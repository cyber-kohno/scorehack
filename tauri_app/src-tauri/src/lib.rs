use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Mutex;

const MAX_HISTORY_LENGTH: usize = 100;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct StoreSnapshot {
    data_store: Value,
    control_store: Value,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct HistoryStatus {
    current_index: usize,
    history_length: usize,
}

#[derive(Debug, Default)]
struct HistoryState {
    snapshots: Vec<StoreSnapshot>,
    current_index: Option<usize>,
}

impl HistoryState {
    fn push(&mut self, snapshot: StoreSnapshot) -> HistoryStatus {
        self.snapshots.push(snapshot);

        if self.snapshots.len() > MAX_HISTORY_LENGTH {
            let overflow = self.snapshots.len() - MAX_HISTORY_LENGTH;
            self.snapshots.drain(0..overflow);
        }

        let current_index = self.snapshots.len().saturating_sub(1);
        self.current_index = Some(current_index);

        HistoryStatus {
            current_index,
            history_length: self.snapshots.len(),
        }
    }
}

type SharedHistoryState = Mutex<HistoryState>;

#[tauri::command]
fn push_history_snapshot(
    history_state: tauri::State<'_, SharedHistoryState>,
    data_store: Value,
    control_store: Value,
) -> Result<HistoryStatus, String> {
    let snapshot = StoreSnapshot {
        data_store,
        control_store,
    };

    history_state
        .lock()
        .map_err(|_| "failed to lock history state".to_string())
        .map(|mut history| history.push(snapshot))
}

pub fn run() {
    tauri::Builder::default()
        .manage(SharedHistoryState::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![push_history_snapshot])
        .run(tauri::generate_context!())
        .expect("failed to run tauri application");
}
