mod snapshot_stack;

use snapshot_stack::{
    clear_snapshot_stack, create_snapshot_stack, dispose_snapshot_stack, exists_snapshot_stack,
    push_snapshot, redo_snapshot, undo_snapshot, SharedSnapshotStackManager,
};
use tauri::Manager;

const MAIN_WINDOW_LABEL: &str = "main";
const SPLASH_WINDOW_LABEL: &str = "splashscreen";

#[tauri::command]
fn show_main_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(main) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        main.show().map_err(|error| error.to_string())?;
        main.set_focus().map_err(|error| error.to_string())?;
    }

    if let Some(splashscreen) = app.get_webview_window(SPLASH_WINDOW_LABEL) {
        splashscreen.close().map_err(|error| error.to_string())?;
    }

    Ok(())
}

#[tauri::command]
fn restart_app(app: tauri::AppHandle) -> Result<(), String> {
    if cfg!(debug_assertions) {
        return Err(
            "Full restart is not available in dev mode. Stop the dev process and run `npm run tauri dev` again."
                .to_string(),
        );
    }

    app.restart();
}

pub fn run() {
    tauri::Builder::default()
        .manage(SharedSnapshotStackManager::default())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            create_snapshot_stack,
            dispose_snapshot_stack,
            exists_snapshot_stack,
            clear_snapshot_stack,
            push_snapshot,
            undo_snapshot,
            redo_snapshot,
            show_main_window,
            restart_app
        ])
        .run(tauri::generate_context!())
        .expect("failed to run tauri application");
}
