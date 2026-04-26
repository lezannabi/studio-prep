use std::fs;
use std::path::PathBuf;

use serde::Serialize;
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
