import Progress from "../../../service/common/progress-controller";
import ProgressState from "../../../store/state/progress-state";

const STEP_COUNT = 100;
const MIN_INTERVAL_MS = 16;
const DEFAULT_X = 238;
const DEFAULT_Y = 34;
const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 15;

const startEditorPreviewProgress = (durationMs: number) => {
    const intervalMs = Math.max(MIN_INTERVAL_MS, durationMs / STEP_COUNT);
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
        total: STEP_COUNT,
        value: 0,
        onDestroy: close,
    });

    let stepCount = 0;
    timer = setInterval(() => {
        stepCount++;
        Progress.step();

        if (stepCount >= STEP_COUNT) {
            Progress.close();
        }
    }, intervalMs);
};

export default startEditorPreviewProgress;
