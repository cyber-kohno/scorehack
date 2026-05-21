namespace ActionMenuState {

    export type ItemRole = "normal" | "warning" | "danger";

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

    export const createInitial = (): Value => ({
        path: [0],
        items: [],
    });

    export const createFactory = () => ({
        action: (
            label: string,
            callback: ActionItem["callback"],
            role?: ItemRole,
        ): ActionItem => {
            const item: ActionItem = {
                type: "action",
                label,
                callback,
            };
            if (role != undefined) item.role = role;
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
