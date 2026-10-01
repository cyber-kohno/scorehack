import { toastStore } from "../../store/global-store";
import type ToastState from "../../store/state/toast-state";

namespace Toast {
    export const create = (toast: ToastState.Value) => {
        toastStore.set({ ...toast });
    };

    export const clear = () => {
        toastStore.set(null);
    };
}

export default Toast;
