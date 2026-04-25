mod repository;

use repository::StudioPrepRepository;
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            load_studio_prep_data,
            save_studio_prep_data,
            reset_studio_prep_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running Studio Prep");
}

fn main() {
    run();
}
