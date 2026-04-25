use std::fs;
use std::path::PathBuf;

use serde_json::Value;
use tauri::{AppHandle, Manager};

const SESSION_FILE_NAME: &str = "studio-prep-session.json";
const DEFAULT_DATA: &str = include_str!("../../src/data/mockStudioData.json");

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
