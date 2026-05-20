namespace ConfirmDialogState {

    export type Tone = "normal" | "danger";
    export type ChoiceRole = "proceed" | "cancel" | "neutral";

    export type Choice = {
        label: string;
        role?: ChoiceRole;
        callback: () => void | Promise<void>;
    };

    export type Value = {
        tone: Tone;
        title?: string;
        messageLines: string[];
        choices: Choice[];
        focus: number;
    };

    export const createInitial = (): Value => ({
        tone: "normal",
        title: "",
        messageLines: [],
        choices: [],
        focus: 0,
    });
}

export default ConfirmDialogState;
