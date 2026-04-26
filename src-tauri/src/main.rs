#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod repository;

use repository::{FolderImageRecord, StudioPrepRepository};
use serde_json::Value;
use tauri::AppHandle;

#[tauri::command]
fn load_studio_prep_data(app: AppHandle) -> Result<Value, String> {
    StudioPrepRepository::new(app).load()
}

#[tauri::command]
fn save_studio_prep_data(app: AppHandle, data: Value) -> Result<(), String> {
    StudioPrepRepository::new(app).save(data)
}

#[tauri::command]
fn reset_studio_prep_data(app: AppHandle) -> Result<Value, String> {
    StudioPrepRepository::new(app).reset()
}

#[tauri::command]
fn scan_project_folder_images(
    app: AppHandle,
    folder_path: String,
) -> Result<Vec<FolderImageRecord>, String> {
    StudioPrepRepository::new(app).scan_project_folder_images(&folder_path)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            load_studio_prep_data,
            save_studio_prep_data,
            reset_studio_prep_data,
            scan_project_folder_images
        ])
        .run(tauri::generate_context!())
        .expect("error while running Studio Prep");
}

fn main() {
    run();
}
