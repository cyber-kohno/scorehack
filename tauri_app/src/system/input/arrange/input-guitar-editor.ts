import type InputState from "../../store/state/input-state";
import createGuitarArrangeActions from "../../actions/arrange/guitar/guitar-arrange-actions";
import createArrangeSelector from "../../service/arrange/arrange-selector";
import { controlStore, dataStore } from "../../store/global-store";
import { get } from "svelte/store";

const useInputGuitarEditor = () => {
    const guitarActions = createGuitarArrangeActions();
    const reducerArrange = createArrangeSelector({
        control: get(controlStore),
        data: get(dataStore),
    });

    const control = (eventKey: string) => {
        const editor = reducerArrange.getGuitarEditor();

        switch (eventKey) {
            case " ": guitarActions.playbackPattern(); break;
        }

        switch (editor.control) {
            case "voicing":
                switch (eventKey) {
                    case "ArrowUp": guitarActions.moveCursor({ string: 1 }); break;
                    case "ArrowDown": guitarActions.moveCursor({ string: -1 }); break;
                    case "ArrowLeft": guitarActions.moveCursor({ fret: -1 }); break;
                    case "ArrowRight": guitarActions.moveCursor({ fret: 1 }); break;
                    case "a":
                    case "Enter":
                        guitarActions.toggleFret();
                        break;
                    case "Delete":
                    case "Backspace":
                        guitarActions.muteString();
                        break;
                    case "R":
                    case "r":
                        guitarActions.toggleBacking();
                        break;
                }
                break;
            case "col":
                switch (eventKey) {
                    case "ArrowLeft": guitarActions.moveBackingColCursor(-1); break;
                    case "ArrowRight": guitarActions.moveBackingColCursor(1); break;
                    case "a": guitarActions.insertBackingCol(); break;
                    case "Delete": guitarActions.deleteBackingCol(); break;
                    case "1": guitarActions.setBackingColDiv(16); break;
                    case "2": guitarActions.setBackingColDiv(8); break;
                    case "3": guitarActions.setBackingColDiv(4); break;
                    case "4": guitarActions.setBackingColDiv(2); break;
                    case "5": guitarActions.setBackingColDiv(1); break;
                    case ".": guitarActions.toggleBackingColDot(); break;
                }
                break;
            case "pattern":
                switch (eventKey) {
                    case "ArrowUp": guitarActions.shiftTechnique(-1); break;
                    case "ArrowDown": guitarActions.shiftTechnique(1); break;
                    case "ArrowLeft": guitarActions.moveBackingColCursor(-1); break;
                    case "ArrowRight": guitarActions.moveBackingColCursor(1); break;
                    case "Delete": guitarActions.setTechnique("none"); break;
                }
                break;
        }
    }

    const getHoldCallbacks = (eventKey: string): InputState.Callbacks => {
        const callbacks: InputState.Callbacks = {};

        callbacks.holdShift = () => {
            const editor = reducerArrange.getGuitarEditor();

            switch (eventKey) {
                case "Enter":
                    guitarActions.applyArrange();
                    break;
            }

            switch (editor.control) {
                case "voicing":
                    if (eventKey === "ArrowDown") guitarActions.shiftControl("col");
                    break;
                case "col":
                    if (eventKey === "ArrowUp") guitarActions.shiftControl("voicing");
                    if (eventKey === "ArrowDown") guitarActions.shiftControl("pattern");
                    break;
                case "pattern":
                    if (eventKey === "ArrowUp") guitarActions.shiftControl("col");
                    break;
            }
        };

        callbacks.holdC = () => {
            const editor = reducerArrange.getGuitarEditor();
            if (editor.control !== "pattern") return;

            switch (eventKey) {
                case "ArrowUp": guitarActions.increasePatternVelocity(); break;
                case "ArrowDown": guitarActions.decreasePatternVelocity(); break;
                case "ArrowLeft": guitarActions.decreasePatternSpeed(); break;
                case "ArrowRight": guitarActions.increasePatternSpeed(); break;
            }
        };

        return callbacks;
    }

    return {
        control,
        getHoldCallbacks
    };
}
export default useInputGuitarEditor;
