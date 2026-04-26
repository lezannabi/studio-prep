#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod repository;

use repository::{
    AnalyzeProjectPayload, AnalyzeProjectResult, ExportImagePayload, ExportPresetPayload,
    ExportProjectResult, FolderImageRecord, StudioPrepRepository,
};
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

#[tauri::command]
fn export_project_assets(
    app: AppHandle,
    project_name: String,
    source_folder_path: Option<String>,
    export_folder_path: Option<String>,
    images: Vec<ExportImagePayload>,
    presets: Vec<ExportPresetPayload>,
) -> Result<ExportProjectResult, String> {
    StudioPrepRepository::new(app)
        .export_project_assets(
            &project_name,
            source_folder_path,
            export_folder_path,
            images,
            presets,
        )
}

#[tauri::command]
fn pick_export_folder() -> Option<String> {
    rfd::FileDialog::new()
        .pick_folder()
        .map(|path| path.to_string_lossy().to_string())
}

#[tauri::command]
fn analyze_project_images(
    app: AppHandle,
    payload: AnalyzeProjectPayload,
) -> Result<AnalyzeProjectResult, String> {
    StudioPrepRepository::new(app).analyze_project_images(payload)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            load_studio_prep_data,
            save_studio_prep_data,
            reset_studio_prep_data,
            scan_project_folder_images,
            export_project_assets,
            pick_export_folder,
            analyze_project_images
        ])
        .run(tauri::generate_context!())
        .expect("error while running Studio Prep");
}

fn main() {
    run();
}
