mod commands;

#[tauri::command]
fn healthcheck() -> &'static str {
    "ok"
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            healthcheck,
            commands::file::ping_file_command,
            commands::musicxml::ping_musicxml_command
        ])
        .run(tauri::generate_context!())
        .expect("failed to run tauri application");
}
