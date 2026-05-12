import type InputState from "../../store/state/input-state";
import createGuitarArrangeActions from "../../actions/arrange/guitar/guitar-arrange-actions";

const useInputGuitarEditor = () => {
    const guitarActions = createGuitarArrangeActions();

    const control = (eventKey: string) => {
        switch (eventKey) {
            case "ArrowUp": guitarActions.moveCursor({ string: -1 }); break;
            case "ArrowDown": guitarActions.moveCursor({ string: 1 }); break;
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
        }
    }

    const getHoldCallbacks = (eventKey: string): InputState.Callbacks => {
        const callbacks: InputState.Callbacks = {};

        callbacks.holdShift = () => {
            switch (eventKey) {
                case "Enter":
                    guitarActions.applyArrange();
                    break;
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
