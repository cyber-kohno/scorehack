import { get } from "svelte/store";
import createOutlineActions from "../../actions/outline/outline-actions";
import { actionMenuStore, controlStore, dataStore, inputStore } from "../../store/global-store";
import ActionMenuState from "../../store/state/action-menu-state";
import type ElementState from "../../store/state/data/element-state";
import InputState from "../../store/state/input-state";

const createOutlineItems = (): ActionMenuState.Item[] => {
    const control = get(controlStore);
    const data = get(dataStore);
    const element = data.elements[control.outline.focus];
    if (element == undefined) return [];

    const outlineActions = createOutlineActions();
    const items: ActionMenuState.Item[] = [];
    const insertItems: ActionMenuState.Item[] = [
        {
            type: "action",
            label: "Chord",
            callback: outlineActions.insertChord,
        },
        {
            type: "action",
            label: "Section",
            callback: outlineActions.insertSection,
        },
        {
            type: "action",
            label: "Modulation",
            callback: outlineActions.insertEventMod,
        },
        {
            type: "action",
            label: "Tempo Change",
            callback: outlineActions.insertEventTempo,
        },
        {
            type: "action",
            label: "Rhythm Change",
            callback: outlineActions.insertEventRhythm,
        },
    ];

    items.push({
        type: "parent",
        label: "Insert",
        children: insertItems,
    });

    const deleteItems: ActionMenuState.Item[] = [];
    if (element.type !== "init") {
        deleteItems.push({
            type: "action",
            label: "Block",
            role: "danger",
            callback: outlineActions.removeFocusElement,
        });
    }
    if (element.type === "chord") {
        deleteItems.push({
            type: "action",
            label: "Chord",
            role: "danger",
            callback: outlineActions.deleteChord,
        });
        deleteItems.push({
            type: "action",
            label: "Arrange",
            role: "danger",
            callback: outlineActions.removeBacking,
        });
    }
    if (deleteItems.length > 0) {
        items.push({
            type: "parent",
            label: "Delete",
            children: deleteItems,
        });
    }

    const openItems: ActionMenuState.Item[] = [];
    if (element.type === "chord") {
        const chordData = element.data as ElementState.DataChord;
        if (chordData.degree != undefined) {
            openItems.push({
                type: "action",
                label: "Arrange Editor",
                callback: outlineActions.openArrangeEditor,
            });
            openItems.push({
                type: "action",
                label: "Arrange Finder",
                callback: outlineActions.openArrangeFinder,
            });
        }
    }
    if (openItems.length > 0) {
        items.push({
            type: "parent",
            label: "Open",
            children: openItems,
        });
    }

    return items;
};

const withExitItem = (items: ActionMenuState.Item[]) => {
    return [
        ...items,
        {
            type: "action",
            label: "Exit",
            callback: ActionMenu.close,
        },
    ] satisfies ActionMenuState.Item[];
};

const getLevelItems = (
    rootItems: ActionMenuState.Item[],
    path: number[],
) => {
    let items = rootItems;
    for (let depth = 0; depth < path.length - 1; depth++) {
        const item = items[path[depth]];
        if (item?.type !== "parent") return [];
        items = item.children;
    }
    return path.length === 1 ? withExitItem(items) : items;
};

const getFocusedItem = (actionMenu: ActionMenuState.Value) => {
    const items = getLevelItems(actionMenu.items, actionMenu.path);
    return items[actionMenu.path[actionMenu.path.length - 1]];
};

const clampPath = (actionMenu: ActionMenuState.Value) => {
    const items = getLevelItems(actionMenu.items, actionMenu.path);
    const lastIndex = actionMenu.path.length - 1;
    actionMenu.path[lastIndex] = Math.max(
        0,
        Math.min(actionMenu.path[lastIndex], Math.max(0, items.length - 1)),
    );
};

namespace ActionMenu {
    export const open = () => {
        inputStore.set({ ...InputState.INITIAL });

        const control = get(controlStore);
        const items = (() => {
            if (control.mode === "harmonize" && control.outline.arrange == null) {
                return createOutlineItems();
            }

            return [];
        })();

        if (items.length === 0) {
            actionMenuStore.set(null);
            return;
        }

        actionMenuStore.set({
            ...ActionMenuState.INITIAL,
            path: [0],
            items,
        });
    };

    export const close = () => {
        actionMenuStore.set(null);
    };

    export const move = (dir: -1 | 1) => {
        const actionMenu = get(actionMenuStore);
        if (actionMenu == null || actionMenu.items.length === 0) return;

        const lastIndex = actionMenu.path.length - 1;
        const items = getLevelItems(actionMenu.items, actionMenu.path);
        const next = actionMenu.path[lastIndex] + dir;
        actionMenu.path[lastIndex] = Math.max(0, Math.min(items.length - 1, next));
        actionMenuStore.set({ ...actionMenu });
    };

    export const enter = () => {
        const actionMenu = get(actionMenuStore);
        if (actionMenu == null) return;

        const item = getFocusedItem(actionMenu);
        if (item == undefined) {
            close();
            return;
        }

        if (item.type === "parent") {
            if (item.children.length === 0) return;
            actionMenu.path = [...actionMenu.path, 0];
            actionMenuStore.set({ ...actionMenu });
            return;
        }

        close();

        const result = item.callback();
        if (result instanceof Promise) {
            result.catch(error => {
                console.error("Action menu callback failed:", error);
            });
        }
    };

    export const apply = enter;

    export const openChild = () => {
        const actionMenu = get(actionMenuStore);
        if (actionMenu == null) return;

        const item = getFocusedItem(actionMenu);
        if (item?.type !== "parent" || item.children.length === 0) return;

        actionMenu.path = [...actionMenu.path, 0];
        actionMenuStore.set({ ...actionMenu });
    };

    export const back = () => {
        const actionMenu = get(actionMenuStore);
        if (actionMenu == null) return;

        if (actionMenu.path.length <= 1) return;
        actionMenu.path = actionMenu.path.slice(0, -1);
        clampPath(actionMenu);
        actionMenuStore.set({ ...actionMenu });
    };

    export const getLevelItemsForPath = getLevelItems;
}

export default ActionMenu;
