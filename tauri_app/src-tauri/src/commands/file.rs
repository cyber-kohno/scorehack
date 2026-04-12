#[tauri::command]
pub fn ping_file_command() -> &'static str {
    "file-command-ready"
}
