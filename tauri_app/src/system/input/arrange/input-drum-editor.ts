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
                case "a": drumActions.insertRecord(); break;
                case "Delete": drumActions.deleteRecord(); break;
            }
        };

        switch (editor.control) {
            case "record":
                recordControl();
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

        return callbacks;
    };

    return {
        control,
        getHoldCallbacks,
    };
};

export default useInputDrumEditor;
