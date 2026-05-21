import { get } from "svelte/store";
import createOutlineActions from "../../actions/outline/outline-actions";
import { controlStore, dataStore } from "../../store/global-store";
import ActionMenuState from "../../store/state/action-menu-state";
import type ElementState from "../../store/state/data/element-state";

namespace OutlineMenuProvider {
    const createInsertChildren = (
        outlineActions: ReturnType<typeof createOutlineActions>,
    ): ActionMenuState.Item[] => {
        const { action } = ActionMenuState.createFactory();
        return [
            action("Chord", outlineActions.insertChord),
            action("Section", outlineActions.insertSection),
            action("Modulation", outlineActions.insertEventMod),
            action("Tempo Change", outlineActions.insertEventTempo),
            action("Rhythm Change", outlineActions.insertEventRhythm),
        ];
    };

    const createChordDeleteItems = (
        outlineActions: ReturnType<typeof createOutlineActions>,
    ): ActionMenuState.Item[] => {
        const { action } = ActionMenuState.createFactory();
        return [
            action("Block", outlineActions.removeFocusElement, "danger"),
            action("Chord", outlineActions.deleteChord, "danger"),
            action("Arrange", outlineActions.removeBacking, "danger"),
        ];
    };

    export const createItems = (): ActionMenuState.Item[] => {
        const control = get(controlStore);
        const data = get(dataStore);
        const element = data.elements[control.outline.focus];
        if (element == undefined) throw new Error();

        const outlineActions = createOutlineActions();
        const { action, parent } = ActionMenuState.createFactory();

        switch (element.type) {
            case "init":
                return [
                    action("Insert Section", outlineActions.insertSection),
                ];
            case "section":
                return [
                    action("Rename", outlineActions.openSectionNameInput),
                    parent("Insert", createInsertChildren(outlineActions)),
                    action("Delete", outlineActions.removeFocusElement),
                ];
            case "chord": {
                const items: ActionMenuState.Item[] = [
                    parent("Insert", createInsertChildren(outlineActions)),
                    parent("Delete", createChordDeleteItems(outlineActions)),
                ];

                const chordData = element.data as ElementState.DataChord;
                if (chordData.degree != undefined) {
                    items.push(parent("Open", [
                        action("Arrange Editor", outlineActions.openArrangeEditor),
                        action("Arrange Finder", outlineActions.openArrangeFinder),
                    ]));
                }

                return items;
            }
            case "modulate":
            case "tempo":
            case "rhythm":
            case "change":
                return [
                    parent("Insert", createInsertChildren(outlineActions)),
                    action("Delete", outlineActions.removeFocusElement, "warning"),
                ];
        }
    };
}

export default OutlineMenuProvider;
