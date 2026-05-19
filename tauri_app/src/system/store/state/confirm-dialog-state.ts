namespace ConfirmDialogState {

    export type Tone = "normal" | "danger";
    export type ChoiceRole = "proceed" | "cancel" | "neutral";

    export type Choice = {
        key: string;
        label: string;
        role?: ChoiceRole;
        callback: () => void | Promise<void>;
    };

    export type Value = {
        tone: Tone;
        title?: string;
        messageLines: string[];
        choices: Choice[];
    };

    export const INITIAL: Value = {
        tone: "normal",
        title: "",
        messageLines: [],
        choices: [],
    };
}

export default ConfirmDialogState;
