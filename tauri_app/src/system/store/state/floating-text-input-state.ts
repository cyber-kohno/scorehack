namespace FloatingTextInputState {
    export type Value = {
        value: string;
        cursor: number;
        left: number;
        top: number;
        width: number;
        apply: (value: string) => void;
        permit?: (str: string) => boolean;
    };

    export const createInitial = (): Value => ({
        value: "",
        cursor: 0,
        left: 0,
        top: 0,
        width: 120,
        apply: () => { },
    });
}

export default FloatingTextInputState;
