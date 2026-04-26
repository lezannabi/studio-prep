use std::fs;
use std::path::{Path, PathBuf};

use base64::engine::general_purpose::STANDARD as BASE64_STANDARD;
use base64::Engine;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{AppHandle, Manager};

const SESSION_FILE_NAME: &str = "studio-prep-session.json";
const DEFAULT_DATA: &str = include_str!("../../src/data/mockStudioData.json");
const IMAGE_EXTENSIONS: &[&str] = &["jpg", "jpeg", "png", "webp", "gif", "bmp"];

#[derive(Serialize)]
pub struct FolderImageRecord {
    pub name: String,
    pub path: String,
}

#[derive(Deserialize)]
pub struct ExportImagePayload {
    pub name: String,
    pub image_url: Option<String>,
    pub source_path: Option<String>,
    pub status: String,
    pub is_cover: bool,
}

#[derive(Deserialize)]
pub struct ExportPresetPayload {
    pub id: String,
    pub name: String,
}

#[derive(Serialize)]
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
