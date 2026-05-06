namespace ToastState {

    export type Value = {
        x: number;
        y: number;
        durationMs: number;
        width: number;
        text: string;
    };

    export const INITIAL: Value = {
        x: 0,
        y: 0,
        durationMs: 1800,
        width: 240,
        text: "",
    };
}

export default ToastState;
