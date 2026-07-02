namespace ProgressState {
    export type Value = {
        x: number;
        y: number;
        width: number;
        height: number;
        total: number;
        value: number;
        onDestroy?: () => void;
    };

    export const createInitial = (): Value => ({
        x: 0,
        y: 0,
        width: 240,
        height: 8,
        total: 100,
        value: 0,
    });
}

export default ProgressState;
