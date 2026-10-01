import { get } from "svelte/store";
import { progressStore } from "../../store/global-store";
import type ProgressState from "../../store/state/progress-state";

namespace Progress {
    const destroy = (progress: ProgressState.Value | null) => {
        progress?.onDestroy?.();
    };

    export const open = (progress: ProgressState.Value) => {
        destroy(get(progressStore));
        progressStore.set({
            ...progress,
            total: Math.max(1, progress.total),
            value: Math.max(0, Math.min(progress.value, progress.total)),
        });
    };

    export const step = () => {
        const progress = get(progressStore);
        if (progress == null) return;

        progressStore.set({
            ...progress,
            value: Math.min(progress.total, progress.value + 1),
        });
    };

    export const close = () => {
        const progress = get(progressStore);
        destroy(progress);
        progressStore.set(null);
    };
}

export default Progress;
