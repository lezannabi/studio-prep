use std::fs;
use std::path::{Path, PathBuf};
use std::{env, time::Duration};

use base64::engine::general_purpose::STANDARD as BASE64_STANDARD;
use base64::Engine;
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{AppHandle, Manager};

const SESSION_FILE_NAME: &str = "studio-prep-session.json";
const DEFAULT_DATA: &str = include_str!("../../src/data/mockStudioData.json");
const IMAGE_EXTENSIONS: &[&str] = &["jpg", "jpeg", "png", "webp", "gif", "bmp"];
const OPENAI_RESPONSES_URL: &str = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_VISION_MODEL: &str = "gpt-4.1-mini";

#[derive(Serialize)]
pub struct FolderImageRecord {
    pub name: String,
    pub path: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportImagePayload {
    pub name: String,
    pub image_url: Option<String>,
    pub source_path: Option<String>,
    pub status: String,
    pub is_cover: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportPresetPayload {
    pub id: String,
    pub name: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyzeImagePayload {
    pub image_id: String,
    pub name: String,
    pub image_url: Option<String>,
    pub source_path: Option<String>,
    pub note: String,
    pub tags: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyzeProjectPayload {
    pub project_name: String,
    pub notes: String,
    pub images: Vec<AnalyzeImagePayload>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyzeImageDecision {
    pub image_id: String,
    pub status: String,
    pub reason: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyzeProjectResult {
    pub cover_image_id: String,
    pub decisions: Vec<AnalyzeImageDecision>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportProjectResult {
    pub export_path: String,
    pub exported_image_count: usize,
    pub exported_preset_count: usize,
}

pub struct StudioPrepRepository {
    app_handle: AppHandle,
}

impl StudioPrepRepository {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    pub fn load(&self) -> Result<Value, String> {
        let session_path = self.session_path()?;

        if session_path.exists() {
            let content = fs::read_to_string(&session_path)
                .map_err(|error| format!("failed to read session file: {error}"))?;

            return serde_json::from_str(&content)
                .map_err(|error| format!("failed to parse session file: {error}"));
        }

        self.default_data()
    }

    pub fn save(&self, data: Value) -> Result<(), String> {
        let session_path = self.session_path()?;
        let parent_dir = session_path
            .parent()
            .ok_or_else(|| String::from("missing app data directory"))?;

        fs::create_dir_all(parent_dir)
            .map_err(|error| format!("failed to create app data directory: {error}"))?;

        let payload = serde_json::to_string_pretty(&data)
            .map_err(|error| format!("failed to serialize session data: {error}"))?;

        fs::write(&session_path, payload)
            .map_err(|error| format!("failed to write session file: {error}"))?;

        Ok(())
    }

    pub fn reset(&self) -> Result<Value, String> {
        let session_path = self.session_path()?;

        if session_path.exists() {
            fs::remove_file(&session_path)
                .map_err(|error| format!("failed to remove session file: {error}"))?;
        }

        self.default_data()
    }

    pub fn scan_project_folder_images(
        &self,
        folder_path: &str,
    ) -> Result<Vec<FolderImageRecord>, String> {
        let folder = PathBuf::from(folder_path);

        if !folder.exists() {
            return Err(String::from("지정한 폴더를 찾을 수 없습니다."));
        }

        if !folder.is_dir() {
            return Err(String::from("지정한 경로가 폴더가 아닙니다."));
        }

        let mut images = fs::read_dir(&folder)
            .map_err(|error| format!("failed to read folder: {error}"))?
            .filter_map(|entry| entry.ok())
            .filter_map(|entry| {
                let path = entry.path();
                let extension = path.extension()?.to_str()?.to_ascii_lowercase();

                if !IMAGE_EXTENSIONS.contains(&extension.as_str()) {
                    return None;
                }

                Some(FolderImageRecord {
                    name: entry.file_name().to_string_lossy().to_string(),
                    path: path.to_string_lossy().to_string(),
                })
            })
            .collect::<Vec<_>>();

        images.sort_by(|left, right| left.name.cmp(&right.name));

        Ok(images)
    }

    pub fn export_project_assets(
        &self,
        project_name: &str,
        source_folder_path: Option<String>,
        export_folder_path: Option<String>,
        images: Vec<ExportImagePayload>,
        presets: Vec<ExportPresetPayload>,
    ) -> Result<ExportProjectResult, String> {
        if presets.is_empty() {
            return Err(String::from("준비된 내보내기 프리셋이 없습니다."));
        }

        if images.is_empty() {
            return Err(String::from("내보낼 이미지가 없습니다."));
        }

        let base_dir = match export_folder_path
            .filter(|path| !path.trim().is_empty())
            .or_else(|| source_folder_path.filter(|path| !path.trim().is_empty()))
        {
            Some(path) => PathBuf::from(path),
            None => self
                .app_handle
                .path()
                .app_data_dir()
                .map_err(|error| format!("failed to resolve app data dir: {error}"))?,
        };

        let export_dir = base_dir.join("exports").join(slugify(project_name));
        fs::create_dir_all(&export_dir)
            .map_err(|error| format!("failed to create export directory: {error}"))?;

        for preset in &presets {
            let preset_dir = export_dir.join(&preset.id);
            fs::create_dir_all(&preset_dir)
                .map_err(|error| format!("failed to create preset directory: {error}"))?;

            for (index, image) in images.iter().enumerate() {
                let extension = detect_extension(image);
                let file_name = format!(
                    "{}-{}-{:02}.{}",
                    slugify(project_name),
                    preset.id,
                    index + 1,
                    extension
                );
                let target_path = preset_dir.join(file_name);
                write_export_image(image, &target_path)?;
            }
        }

        let manifest = serde_json::json!({
            "projectName": project_name,
            "exportedImageCount": images.len(),
            "exportedPresetCount": presets.len(),
            "images": images.iter().map(|image| serde_json::json!({
                "name": image.name,
                "status": image.status,
                "isCover": image.is_cover,
                "sourcePath": image.source_path
            })).collect::<Vec<_>>(),
            "presets": presets.iter().map(|preset| serde_json::json!({
                "id": preset.id,
                "name": preset.name
            })).collect::<Vec<_>>()
        });

        fs::write(
            export_dir.join("manifest.json"),
            serde_json::to_string_pretty(&manifest)
                .map_err(|error| format!("failed to serialize export manifest: {error}"))?,
        )
        .map_err(|error| format!("failed to write export manifest: {error}"))?;

        Ok(ExportProjectResult {
            export_path: export_dir.to_string_lossy().to_string(),
            exported_image_count: images.len(),
            exported_preset_count: presets.len(),
        })
    }

    pub fn analyze_project_images(
        &self,
        payload: AnalyzeProjectPayload,
    ) -> Result<AnalyzeProjectResult, String> {
        let api_key = env::var("OPENAI_API_KEY")
            .map_err(|_| String::from("OPENAI_API_KEY 환경변수가 설정되지 않았습니다."))?;
        let model = env::var("OPENAI_VISION_MODEL")
            .unwrap_or_else(|_| String::from(DEFAULT_OPENAI_VISION_MODEL));

        if payload.images.is_empty() {
            return Err(String::from("분석할 이미지가 없습니다."));
        }

        let client = Client::builder()
            .timeout(Duration::from_secs(120))
            .build()
            .map_err(|error| format!("failed to build OpenAI client: {error}"))?;

        let mut content = Vec::new();
        content.push(serde_json::json!({
            "type": "input_text",
            "text": build_analysis_prompt(&payload)
        }));

        for image in &payload.images {
            let image_url = resolve_image_data_url(image)?;
            content.push(serde_json::json!({
                "type": "input_image",
                "image_url": image_url,
                "detail": "low"
            }));
        }

        let request_body = serde_json::json!({
            "model": model,
            "input": [{
                "role": "user",
                "content": content
            }],
            "text": {
                "format": {
                    "type": "json_schema",
                    "name": "image_curation_result",
                    "strict": true,
                    "schema": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                            "coverImageId": { "type": "string" },
                            "decisions": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "additionalProperties": false,
                                    "properties": {
                                        "imageId": { "type": "string" },
                                        "status": {
                                            "type": "string",
                                            "enum": ["selected", "candidate", "excluded"]
                                        },
                                        "reason": { "type": "string" }
                                    },
                                    "required": ["imageId", "status", "reason"]
                                }
                            }
                        },
                        "required": ["coverImageId", "decisions"]
                    }
                }
            }
        });

        let response = client
            .post(OPENAI_RESPONSES_URL)
            .bearer_auth(api_key)
            .header("Content-Type", "application/json")
            .json(&request_body)
            .send()
            .map_err(|error| format!("failed to call OpenAI Responses API: {error}"))?;

        let status = response.status();
        let response_json = response
            .json::<Value>()
            .map_err(|error| format!("failed to parse OpenAI response: {error}"))?;

        if !status.is_success() {
            let message = response_json
                .get("error")
                .and_then(|error| error.get("message"))
                .and_then(Value::as_str)
                .unwrap_or("OpenAI API 요청이 실패했습니다.");
            return Err(String::from(message));
        }

        let output_text = response_json
            .get("output_text")
            .and_then(Value::as_str)
            .ok_or_else(|| String::from("OpenAI 응답에서 output_text를 찾지 못했습니다."))?;

        serde_json::from_str::<AnalyzeProjectResult>(output_text)
            .map_err(|error| format!("failed to parse AI analysis result: {error}"))
    }

    fn session_path(&self) -> Result<PathBuf, String> {
        let app_data_dir = self
            .app_handle
            .path()
            .app_data_dir()
            .map_err(|error| format!("failed to resolve app data dir: {error}"))?;

        Ok(app_data_dir.join(SESSION_FILE_NAME))
    }

    fn default_data(&self) -> Result<Value, String> {
        serde_json::from_str(DEFAULT_DATA)
            .map_err(|error| format!("failed to parse bundled mock data: {error}"))
    }
}

fn slugify(value: &str) -> String {
    let mut slug = String::new();

    for character in value.chars() {
        if character.is_ascii_alphanumeric() {
            slug.push(character.to_ascii_lowercase());
        } else if (character.is_whitespace() || character == '-' || character == '_')
            && !slug.ends_with('-')
        {
            slug.push('-');
        }
    }

    slug.trim_matches('-').to_string()
}

fn detect_extension(image: &ExportImagePayload) -> String {
    if let Some(source_path) = &image.source_path {
        if let Some(extension) = Path::new(source_path).extension().and_then(|value| value.to_str())
        {
            return extension.to_ascii_lowercase();
        }
    }

    if let Some(extension) = Path::new(&image.name).extension().and_then(|value| value.to_str()) {
        return extension.to_ascii_lowercase();
    }

    if let Some(image_url) = &image.image_url {
        if image_url.starts_with("data:image/png") {
            return String::from("png");
        }
        if image_url.starts_with("data:image/webp") {
            return String::from("webp");
        }
        if image_url.starts_with("data:image/gif") {
            return String::from("gif");
        }
    }

    String::from("jpg")
}

fn write_export_image(image: &ExportImagePayload, target_path: &Path) -> Result<(), String> {
    if let Some(source_path) = &image.source_path {
        fs::copy(source_path, target_path)
            .map_err(|error| format!("failed to copy image file: {error}"))?;
        return Ok(());
    }

    if let Some(image_url) = &image.image_url {
        let encoded = image_url
            .split_once(',')
            .ok_or_else(|| String::from("invalid image data url"))?
            .1;
        let bytes = BASE64_STANDARD
            .decode(encoded)
            .map_err(|error| format!("failed to decode image data: {error}"))?;

        fs::write(target_path, bytes)
            .map_err(|error| format!("failed to write exported image: {error}"))?;
        return Ok(());
    }

    Err(String::from("이미지 원본 경로 또는 데이터가 없습니다."))
}

fn build_analysis_prompt(payload: &AnalyzeProjectPayload) -> String {
    let mut prompt = String::new();
    prompt.push_str("You are selecting the best project images for a creative studio workflow.\n");
    prompt.push_str("Return JSON only. Choose exactly one coverImageId from the provided images.\n");
    prompt.push_str("For each image, assign one status from selected, candidate, excluded.\n");
    prompt.push_str("selected means strong export candidate, candidate means usable backup, excluded means not recommended.\n");
    prompt.push_str("Prefer clear composition, representative framing, strong lighting, and less duplication.\n");
    prompt.push_str(&format!("Project: {}\n", payload.project_name));
    if !payload.notes.trim().is_empty() {
        prompt.push_str(&format!("Project notes: {}\n", payload.notes));
    }
    prompt.push_str("Image metadata:\n");

    for image in &payload.images {
        prompt.push_str(&format!(
            "- imageId={} name={} tags={} note={}\n",
            image.image_id,
            image.name,
            image.tags.join(", "),
            image.note
        ));
    }

    prompt
}

fn resolve_image_data_url(image: &AnalyzeImagePayload) -> Result<String, String> {
    if let Some(image_url) = &image.image_url {
        if image_url.starts_with("data:image/") {
            return Ok(image_url.clone());
        }
    }

    if let Some(source_path) = &image.source_path {
        let bytes = fs::read(source_path)
            .map_err(|error| format!("failed to read image source file: {error}"))?;
        let extension = Path::new(source_path)
            .extension()
            .and_then(|value| value.to_str())
            .unwrap_or("jpg")
            .to_ascii_lowercase();
        let mime = match extension.as_str() {
            "png" => "image/png",
            "webp" => "image/webp",
            "gif" => "image/gif",
            _ => "image/jpeg",
        };

        return Ok(format!(
            "data:{};base64,{}",
            mime,
            BASE64_STANDARD.encode(bytes)
        ));
    }

    Err(format!("이미지 데이터가 없습니다: {}", image.name))
}
