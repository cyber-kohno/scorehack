import { get } from "svelte/store";
import { confirmDialogStore, inputStore } from "../../store/global-store";
import type ConfirmDialogState from "../../store/state/confirm-dialog-state";
import InputState from "../../store/state/input-state";

type ConfirmDialogProps = Omit<ConfirmDialogState.Value, "focus"> & {
    focus?: number;
};

const createCancelChoice = (): ConfirmDialogState.Choice => ({
    label: "Cancel",
    role: "cancel",
    callback: () => {},
});

namespace ConfirmDialog {
    export const open = (dialog: ConfirmDialogProps) => {
        inputStore.set(InputState.createInitial());
        const choices = [
            ...dialog.choices.map(choice => ({ ...choice })),
            createCancelChoice(),
        ];

        confirmDialogStore.set({
            ...dialog,
            choices,
            focus: Math.max(0, Math.min(dialog.focus ?? 0, Math.max(0, choices.length - 1))),
            messageLines: [...dialog.messageLines],
        });
    };

    export const clear = () => {
        confirmDialogStore.set(null);
    };

    export const cancel = () => {
        clear();
    };

    export const move = (dir: -1 | 1) => {
        const dialog = get(confirmDialogStore);
        if (dialog == null) return false;

        const lastIndex = Math.max(0, dialog.choices.length - 1);
        const focus = Math.max(0, Math.min(lastIndex, dialog.focus + dir));
        confirmDialogStore.set({ ...dialog, focus });
        return true;
    };

    export const apply = () => {
        const dialog = get(confirmDialogStore);
        if (dialog == null) return false;

        const choice = dialog.choices[dialog.focus];
        if (choice == undefined) return false;

        clear();

        const result = choice.callback();
        if (result instanceof Promise) {
            result.catch(error => {
                console.error("Confirm dialog callback failed:", error);
            });
        }
        return true;
    };
}

export default ConfirmDialog;
