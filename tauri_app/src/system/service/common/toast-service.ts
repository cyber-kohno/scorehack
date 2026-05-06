import { toastStore } from "../../store/global-store";
import type ToastState from "../../store/state/toast-state";

export const createToast = (toast: ToastState.Value) => {
    toastStore.set({ ...toast });
};

export const clearToast = () => {
    toastStore.set(null);
};
