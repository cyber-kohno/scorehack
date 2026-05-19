import { get } from "svelte/store";
import { confirmDialogStore, inputStore } from "../../store/global-store";
import type ConfirmDialogState from "../../store/state/confirm-dialog-state";
import InputState from "../../store/state/input-state";

export const openConfirmDialog = (dialog: ConfirmDialogState.Value) => {
    inputStore.set({ ...InputState.INITIAL });
    confirmDialogStore.set({
        ...dialog,
        choices: dialog.choices.map(choice => ({ ...choice })),
        messageLines: [...dialog.messageLines],
    });
};

export const clearConfirmDialog = () => {
    confirmDialogStore.set(null);
};

export const chooseConfirmDialogByKey = (key: string) => {
    const dialog = get(confirmDialogStore);
    if (dialog == null) return false;

    const choice = dialog.choices.find(item => item.key === key);
    if (choice == undefined) return false;

    clearConfirmDialog();

    const result = choice.callback();
    if (result instanceof Promise) {
        result.catch(error => {
            console.error("Confirm dialog callback failed:", error);
        });
    }
    return true;
};
