import { get } from "svelte/store";
import createDrumArrangeActions from "../../actions/arrange/drum/drum-arrange-actions";
import createArrangeSelector from "../../service/arrange/arrange-selector";
import { controlStore, dataStore } from "../../store/global-store";
import type InputState from "../../store/state/input-state";

const useInputDrumEditor = () => {
    const drumActions = createDrumArrangeActions();
    const reducerArrange = createArrangeSelector({
        control: get(controlStore),
        data: get(dataStore),
    });
    const arrange = get(controlStore).outline.arrange;

    const control = (eventKey: string) => {
        if (arrange == null) throw new Error();
        const editor = reducerArrange.getDrumEditor();

        if (editor.phase !== "edit") return;

        const recordControl = () => {
            switch (eventKey) {
                case "ArrowDown": drumActions.moveRecordCursor(-1); break;
                case "ArrowUp": drumActions.moveRecordCursor(1); break;
                case "W":
                case "w": drumActions.openRecordKeySelect(); break;
                case "a": drumActions.insertRecord(); break;
                case "Delete": drumActions.deleteRecord(); break;
            }
        };

        switch (editor.control) {
            case "criteria":
                switch (eventKey) {
                    case "W":
                    case "w": drumActions.openCriteriaDivSelect(); break;
                }
                break;
            case "col":
                switch (eventKey) {
                    case "ArrowLeft": drumActions.moveColCursor(-1); break;
                    case "ArrowRight": drumActions.moveColCursor(1); break;
                    case "W":
                    case "w": drumActions.openColDivSelect(); break;
                }
                break;
            case "record":
                recordControl();
                break;
            case "hits":
                switch (eventKey) {
                    case "ArrowLeft": drumActions.movePatternColCursor(-1); break;
                    case "ArrowRight": drumActions.movePatternColCursor(1); break;
                    case "ArrowDown": drumActions.movePatternRecordCursor(-1); break;
                    case "ArrowUp": drumActions.movePatternRecordCursor(1); break;
                    case "A":
                    case "a": drumActions.toggleHit(); break;
                }
                break;
        }
    };

    const getHoldCallbacks = (eventKey: string): InputState.Callbacks => {
        if (arrange == null) throw new Error();

        const editor = reducerArrange.getDrumEditor();
        const callbacks: InputState.Callbacks = {};

        callbacks.holdShift = () => {
            switch (editor.control) {
                case "criteria":
                    if (eventKey === "ArrowRight") drumActions.shiftControl("col");
                    if (eventKey === "ArrowDown") drumActions.shiftControl("record");
                    break;
                case "col":
                    if (eventKey === "ArrowLeft") drumActions.shiftControl("criteria");
                    if (eventKey === "ArrowDown") drumActions.shiftControl("hits");
                    break;
                case "record":
                    if (eventKey === "ArrowUp") drumActions.shiftControl("criteria");
                    if (eventKey === "ArrowRight") drumActions.shiftControl("hits");
                    break;
                case "hits":
                    if (eventKey === "ArrowUp") drumActions.shiftControl("col");
                    if (eventKey === "ArrowLeft") drumActions.shiftControl("record");
                    break;
            }
        };

        callbacks.holdD = () => {
            if (editor.control !== "record") return;

            switch (eventKey) {
                case "ArrowDown": drumActions.swapRecord(-1); break;
                case "ArrowUp": drumActions.swapRecord(1); break;
            }
        };

        return callbacks;
    };

    return {
        control,
        getHoldCallbacks,
    };
};

export default useInputDrumEditor;
