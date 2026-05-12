mod snapshot_stack;

use snapshot_stack::{
    clear_snapshot_stack, create_snapshot_stack, dispose_snapshot_stack, exists_snapshot_stack,
    push_snapshot, redo_snapshot, undo_snapshot, SharedSnapshotStackManager,
};

pub fn run() {
    tauri::Builder::default()
        .manage(SharedSnapshotStackManager::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            create_snapshot_stack,
            dispose_snapshot_stack,
            exists_snapshot_stack,
            clear_snapshot_stack,
            push_snapshot,
            undo_snapshot,
            redo_snapshot
        ])
        .run(tauri::generate_context!())
        .expect("failed to run tauri application");
}
