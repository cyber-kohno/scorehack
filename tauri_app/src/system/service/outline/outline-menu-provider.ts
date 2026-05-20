import { get } from "svelte/store";
import createOutlineActions from "../../actions/outline/outline-actions";
import { controlStore, dataStore } from "../../store/global-store";
import type ActionMenuState from "../../store/state/action-menu-state";
import type ElementState from "../../store/state/data/element-state";

namespace OutlineMenuProvider {
    const createInsertChildren = (
        outlineActions: ReturnType<typeof createOutlineActions>,
    ): ActionMenuState.Item[] => [
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

    const createChordDeleteItems = (
        outlineActions: ReturnType<typeof createOutlineActions>,
    ): ActionMenuState.Item[] => [
        {
            type: "action",
            label: "Block",
            role: "danger",
            callback: outlineActions.removeFocusElement,
        },
        {
            type: "action",
            label: "Chord",
            role: "danger",
            callback: outlineActions.deleteChord,
        },
        {
            type: "action",
            label: "Arrange",
            role: "danger",
            callback: outlineActions.removeBacking,
        },
    ];

    export const createItems = (): ActionMenuState.Item[] => {
        const control = get(controlStore);
        const data = get(dataStore);
        const element = data.elements[control.outline.focus];
        if (element == undefined) throw new Error();

        const outlineActions = createOutlineActions();

        switch (element.type) {
            case "init":
                return [
                    {
                        type: "action",
                        label: "Insert Section",
                        callback: outlineActions.insertSection,
                    },
                ];
            case "section":
                return [
                    {
                        type: "action",
                        label: "Rename",
                        callback: outlineActions.openSectionNameInput,
                    },
                    {
                        type: "parent",
                        label: "Insert",
                        children: createInsertChildren(outlineActions),
                    },
                    {
                        type: "action",
                        label: "Delete",
                        callback: outlineActions.removeFocusElement,
                    },
                ];
            case "chord": {
                const items: ActionMenuState.Item[] = [
                    {
                        type: "parent",
                        label: "Insert",
                        children: createInsertChildren(outlineActions),
                    },
                    {
                        type: "parent",
                        label: "Delete",
                        children: createChordDeleteItems(outlineActions),
                    },
                ];

                const chordData = element.data as ElementState.DataChord;
                if (chordData.degree != undefined) {
                    items.push({
                        type: "parent",
                        label: "Open",
                        children: [
                            {
                                type: "action",
                                label: "Arrange Editor",
                                callback: outlineActions.openArrangeEditor,
                            },
                            {
                                type: "action",
                                label: "Arrange Finder",
                                callback: outlineActions.openArrangeFinder,
                            },
                        ],
                    });
                }

                return items;
            }
            case "modulate":
            case "tempo":
            case "rhythm":
            case "change":
                return [
                    {
                        type: "parent",
                        label: "Insert",
                        children: createInsertChildren(outlineActions),
                    },
                    {
                        type: "action",
                        label: "Delete",
                        role: "warning",
                        callback: outlineActions.removeFocusElement,
                    },
                ];
        }
    };
}

export default OutlineMenuProvider;
