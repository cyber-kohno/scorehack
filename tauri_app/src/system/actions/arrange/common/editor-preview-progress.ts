import Progress from "../../../service/common/progress-controller";
import ProgressState from "../../../store/state/progress-state";

const INTERVAL_MS = 16;
const DEFAULT_X = 238;
const DEFAULT_Y = 34;
const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 15;

const startEditorPreviewProgress = (durationMs: number) => {
    const total = Math.max(1, Math.ceil(durationMs / INTERVAL_MS));
    const intervalMs = durationMs / total;
    let timer: ReturnType<typeof setInterval> | null = null;

    const close = () => {
        if (timer != null) {
            clearInterval(timer);
            timer = null;
        }
    };

    Progress.open({
        ...ProgressState.createInitial(),
        x: DEFAULT_X,
        y: DEFAULT_Y,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        total,
        value: 0,
        onDestroy: close,
    });

    let stepCount = 0;
    timer = setInterval(() => {
        stepCount++;
        Progress.step();

        if (stepCount >= total) {
            Progress.close();
        }
    }, intervalMs);
};

export default startEditorPreviewProgress;
