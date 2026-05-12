use serde::Serialize;
use serde_json::Value;
use std::collections::HashMap;
use std::sync::Mutex;

const MAX_STACK_LENGTH: usize = 100;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SnapshotStackStatus {
    current_index: Option<usize>,
    stack_length: usize,
    can_undo: bool,
    can_redo: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SnapshotStackChangeResult {
    snapshot: Option<Value>,
    status: SnapshotStackStatus,
}

#[derive(Debug, Default)]
struct SnapshotStack {
    snapshots: Vec<Value>,
    current_index: Option<usize>,
}

impl SnapshotStack {
    fn status(&self) -> SnapshotStackStatus {
        let current_index = self.current_index;

        SnapshotStackStatus {
            current_index,
            stack_length: self.snapshots.len(),
            can_undo: current_index.is_some_and(|index| index > 0),
            can_redo: current_index.is_some_and(|index| index + 1 < self.snapshots.len()),
        }
    }

    fn clear(&mut self) -> SnapshotStackStatus {
        self.snapshots.clear();
        self.current_index = None;

        self.status()
    }

    fn push(&mut self, snapshot: Value) -> SnapshotStackStatus {
        if let Some(current_index) = self.current_index {
            self.snapshots.truncate(current_index + 1);
        }

        self.snapshots.push(snapshot);

        if self.snapshots.len() > MAX_STACK_LENGTH {
            let overflow = self.snapshots.len() - MAX_STACK_LENGTH;
            self.snapshots.drain(0..overflow);
        }

        let current_index = self.snapshots.len().saturating_sub(1);
        self.current_index = Some(current_index);

        self.status()
    }

    fn undo(&mut self) -> SnapshotStackChangeResult {
        let snapshot = match self.current_index {
            Some(index) if index > 0 => {
                let next_index = index - 1;
                self.current_index = Some(next_index);
                self.snapshots.get(next_index).cloned()
            }
            _ => None,
        };

        SnapshotStackChangeResult {
            snapshot,
            status: self.status(),
        }
    }

    fn redo(&mut self) -> SnapshotStackChangeResult {
        let snapshot = match self.current_index {
            Some(index) if index + 1 < self.snapshots.len() => {
                let next_index = index + 1;
                self.current_index = Some(next_index);
                self.snapshots.get(next_index).cloned()
            }
            _ => None,
        };

        SnapshotStackChangeResult {
            snapshot,
            status: self.status(),
        }
    }
}

#[derive(Debug, Default)]
pub struct SnapshotStackManager {
    stacks: HashMap<String, SnapshotStack>,
}

impl SnapshotStackManager {
    fn create(&mut self, id: String) -> Result<(), String> {
        if self.stacks.contains_key(&id) {
            return Err(format!("snapshot stack already exists: {id}"));
        }

        self.stacks.insert(id, SnapshotStack::default());
        Ok(())
    }

    fn dispose(&mut self, id: &str) -> Result<(), String> {
        if self.stacks.remove(id).is_none() {
            return Err(format!("snapshot stack does not exist: {id}"));
        }

        Ok(())
    }

    fn exists(&self, id: &str) -> bool {
        self.stacks.contains_key(id)
    }

    fn stack_mut(&mut self, id: &str) -> Result<&mut SnapshotStack, String> {
        self.stacks
            .get_mut(id)
            .ok_or_else(|| format!("snapshot stack does not exist: {id}"))
    }
}

pub type SharedSnapshotStackManager = Mutex<SnapshotStackManager>;

#[tauri::command]
pub fn create_snapshot_stack(
    manager: tauri::State<'_, SharedSnapshotStackManager>,
    id: String,
) -> Result<(), String> {
    manager
        .lock()
        .map_err(|_| "failed to lock snapshot stack manager".to_string())
        .and_then(|mut manager| manager.create(id))
}

#[tauri::command]
pub fn dispose_snapshot_stack(
    manager: tauri::State<'_, SharedSnapshotStackManager>,
    id: String,
) -> Result<(), String> {
    manager
        .lock()
        .map_err(|_| "failed to lock snapshot stack manager".to_string())
        .and_then(|mut manager| manager.dispose(&id))
}

#[tauri::command]
pub fn exists_snapshot_stack(
    manager: tauri::State<'_, SharedSnapshotStackManager>,
    id: String,
) -> Result<bool, String> {
    manager
        .lock()
        .map_err(|_| "failed to lock snapshot stack manager".to_string())
        .map(|manager| manager.exists(&id))
}

#[tauri::command]
pub fn clear_snapshot_stack(
    manager: tauri::State<'_, SharedSnapshotStackManager>,
    id: String,
) -> Result<SnapshotStackStatus, String> {
    manager
        .lock()
        .map_err(|_| "failed to lock snapshot stack manager".to_string())
        .and_then(|mut manager| manager.stack_mut(&id).map(|stack| stack.clear()))
}

#[tauri::command]
pub fn push_snapshot(
    manager: tauri::State<'_, SharedSnapshotStackManager>,
    id: String,
    data: Value,
) -> Result<SnapshotStackStatus, String> {
    manager
        .lock()
        .map_err(|_| "failed to lock snapshot stack manager".to_string())
        .and_then(|mut manager| manager.stack_mut(&id).map(|stack| stack.push(data)))
}

#[tauri::command]
pub fn undo_snapshot(
    manager: tauri::State<'_, SharedSnapshotStackManager>,
    id: String,
) -> Result<SnapshotStackChangeResult, String> {
    manager
        .lock()
        .map_err(|_| "failed to lock snapshot stack manager".to_string())
        .and_then(|mut manager| manager.stack_mut(&id).map(|stack| stack.undo()))
}

#[tauri::command]
pub fn redo_snapshot(
    manager: tauri::State<'_, SharedSnapshotStackManager>,
    id: String,
) -> Result<SnapshotStackChangeResult, String> {
    manager
        .lock()
        .map_err(|_| "failed to lock snapshot stack manager".to_string())
        .and_then(|mut manager| manager.stack_mut(&id).map(|stack| stack.redo()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn snapshot(index: usize) -> Value {
        json!({ "data": index })
    }

    #[test]
    fn push_sets_current_snapshot_to_latest() {
        let mut stack = SnapshotStack::default();

        let status = stack.push(snapshot(0));

        assert_eq!(status.current_index, Some(0));
        assert_eq!(status.stack_length, 1);
        assert!(!status.can_undo);
        assert!(!status.can_redo);
    }

    #[test]
    fn push_drops_redo_snapshots_after_current_index() {
        let mut stack = SnapshotStack::default();
        stack.push(snapshot(0));
        stack.push(snapshot(1));
        stack.push(snapshot(2));
        stack.current_index = Some(1);

        let status = stack.push(snapshot(3));

        assert_eq!(status.current_index, Some(2));
        assert_eq!(status.stack_length, 3);
        assert_eq!(stack.snapshots[2], json!({ "data": 3 }));
        assert!(status.can_undo);
        assert!(!status.can_redo);
    }

    #[test]
    fn push_keeps_stack_within_limit() {
        let mut stack = SnapshotStack::default();

        for index in 0..MAX_STACK_LENGTH + 1 {
            stack.push(snapshot(index));
        }

        assert_eq!(stack.snapshots.len(), MAX_STACK_LENGTH);
        assert_eq!(stack.current_index, Some(MAX_STACK_LENGTH - 1));
        assert_eq!(stack.snapshots[0], json!({ "data": 1 }));
    }

    #[test]
    fn clear_removes_all_snapshots() {
        let mut stack = SnapshotStack::default();
        stack.push(snapshot(0));
        stack.push(snapshot(1));

        let status = stack.clear();

        assert_eq!(status.current_index, None);
        assert_eq!(status.stack_length, 0);
        assert!(stack.snapshots.is_empty());
        assert!(!status.can_undo);
        assert!(!status.can_redo);
    }

    #[test]
    fn undo_moves_to_previous_snapshot() {
        let mut stack = SnapshotStack::default();
        stack.push(snapshot(0));
        stack.push(snapshot(1));

        let result = stack.undo();

        assert_eq!(result.status.current_index, Some(0));
        assert_eq!(result.snapshot, Some(json!({ "data": 0 })));
        assert!(!result.status.can_undo);
        assert!(result.status.can_redo);
    }

    #[test]
    fn undo_returns_no_snapshot_when_unavailable() {
        let mut stack = SnapshotStack::default();
        stack.push(snapshot(0));

        let result = stack.undo();

        assert!(result.snapshot.is_none());
        assert_eq!(result.status.current_index, Some(0));
        assert!(!result.status.can_undo);
        assert!(!result.status.can_redo);
    }

    #[test]
    fn redo_moves_to_next_snapshot() {
        let mut stack = SnapshotStack::default();
        stack.push(snapshot(0));
        stack.push(snapshot(1));
        stack.undo();

        let result = stack.redo();

        assert_eq!(result.status.current_index, Some(1));
        assert_eq!(result.snapshot, Some(json!({ "data": 1 })));
        assert!(result.status.can_undo);
        assert!(!result.status.can_redo);
    }

    #[test]
    fn redo_returns_no_snapshot_when_unavailable() {
        let mut stack = SnapshotStack::default();
        stack.push(snapshot(0));

        let result = stack.redo();

        assert!(result.snapshot.is_none());
        assert_eq!(result.status.current_index, Some(0));
        assert!(!result.status.can_undo);
        assert!(!result.status.can_redo);
    }

    #[test]
    fn manager_keeps_independent_stacks_by_id() {
        let mut manager = SnapshotStackManager::default();

        manager.create("main".to_string()).unwrap();
        manager.create("arrange".to_string()).unwrap();
        manager.stack_mut("main").unwrap().push(snapshot(0));
        manager.stack_mut("arrange").unwrap().push(snapshot(1));

        assert_eq!(manager.stack_mut("main").unwrap().status().stack_length, 1);
        assert_eq!(
            manager.stack_mut("arrange").unwrap().snapshots[0],
            json!({ "data": 1 })
        );
    }

    #[test]
    fn manager_requires_explicit_create_before_stack_operations() {
        let mut manager = SnapshotStackManager::default();

        assert!(manager.stack_mut("main").is_err());

        manager.create("main".to_string()).unwrap();

        assert!(manager.stack_mut("main").is_ok());
    }

    #[test]
    fn manager_reports_exists_and_disposes_stack() {
        let mut manager = SnapshotStackManager::default();

        assert!(!manager.exists("main"));

        manager.create("main".to_string()).unwrap();
        assert!(manager.exists("main"));

        manager.dispose("main").unwrap();
        assert!(!manager.exists("main"));
    }

    #[test]
    fn manager_rejects_duplicate_create_and_missing_dispose() {
        let mut manager = SnapshotStackManager::default();

        manager.create("main".to_string()).unwrap();

        assert!(manager.create("main".to_string()).is_err());
        assert!(manager.dispose("arrange").is_err());
    }
}
