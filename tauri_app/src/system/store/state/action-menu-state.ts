namespace ActionMenuState {

    export type ItemRole = "normal" | "warning" | "danger";

    export type ActionItem = {
        type: "action";
        label: string;
        role?: ItemRole;
        keepOpen?: boolean;
        callback: () => void | Promise<void>;
    };

    export type ActionOptions = {
        role?: ItemRole;
        keepOpen?: boolean;
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

    export const createInitial = (): Value => ({
        path: [0],
        items: [],
    });

    export const createFactory = () => ({
        action: (
            label: string,
            callback: ActionItem["callback"],
            option?: ItemRole | ActionOptions,
        ): ActionItem => {
            const item: ActionItem = {
                type: "action",
                label,
                callback,
            };
            if (typeof option === "string") {
                item.role = option;
            } else if (option != undefined) {
                if (option.role != undefined) item.role = option.role;
                if (option.keepOpen != undefined) item.keepOpen = option.keepOpen;
            }
            return item;
        },
        parent: (
            label: string,
            children: Item[],
        ): ParentItem => ({
            type: "parent",
            label,
            children,
        }),
    });
}

export default ActionMenuState;
