#[tauri::command]
pub fn ping_musicxml_command() -> &'static str {
    "musicxml-command-ready"
}
