namespace ActionMenuState {

    export type ItemRole = "normal" | "danger";

    export type ActionItem = {
        type: "action";
        label: string;
        role?: ItemRole;
        callback: () => void | Promise<void>;
    };

    export type ParentItem = {
        type: "parent";
        label: string;
        children: Item[];
    };

    export type Item = ActionItem | ParentItem;

    export type Value = {
        path: number[];
        items: Item[];
    };

    export const INITIAL: Value = {
        path: [0],
        items: [],
    };
}

export default ActionMenuState;
