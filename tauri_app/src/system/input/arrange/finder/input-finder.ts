import type InputState from "../../../store/state/input-state";
import createArrangeActions from "../../../actions/arrange/arrange-actions";
import createDrumArrangeActions from "../../../actions/arrange/drum/drum-arrange-actions";
import createGuitarArrangeActions from "../../../actions/arrange/guitar/guitar-arrange-actions";
import createPianoArrangeActions from "../../../actions/arrange/piano/piano-arrange-actions";
import { get } from "svelte/store";
import { controlStore } from "../../../store/global-store";

const useInputFinder = () => {
    const arrangeActions = createArrangeActions();
    const drumActions = createDrumArrangeActions();
    const guitarActions = createGuitarArrangeActions();
    const pianoActions = createPianoArrangeActions();

    const getMethod = () => {
        const arrange = get(controlStore).outline.arrange;
        if (arrange == null) throw new Error("Arrange finder must exist.");
        return arrange.method;
    };

    const pianoControl = (eventKey: string) => {
        switch (eventKey) {
            case 'ArrowLeft': pianoActions.moveFinderVoicing(-1); break;
            case 'ArrowRight': pianoActions.moveFinderVoicing(1); break;
            case 'ArrowUp': pianoActions.moveFinderBacking(-1); break;
            case 'ArrowDown': pianoActions.moveFinderBacking(1); break;
            case 'Enter': pianoActions.applyFinderPattern(); break;
        }
    };

    const drumControl = (eventKey: string) => {
        switch (eventKey) {
            case 'ArrowLeft': drumActions.moveFinderPattern(-1); break;
            case 'ArrowRight': drumActions.moveFinderPattern(1); break;
            case 'ArrowUp': drumActions.moveFinderPattern(-3); break;
            case 'ArrowDown': drumActions.moveFinderPattern(3); break;
            case 'Enter': drumActions.applyFinderPattern(); break;
        }
    };

    const guitarControl = (eventKey: string) => {
        switch (eventKey) {
            case 'ArrowLeft': guitarActions.moveFinderPattern(-1); break;
            case 'ArrowRight': guitarActions.moveFinderPattern(1); break;
            case 'ArrowUp': guitarActions.moveFinderPattern(-3); break;
            case 'ArrowDown': guitarActions.moveFinderPattern(3); break;
            case 'Enter': guitarActions.applyFinderSelection(); break;
            case 'Backspace': guitarActions.backFinderSelection(); break;
        }
    };

    const control = (eventKey: string) => {
        switch (eventKey) {
            case 'Escape':
            case 'w': arrangeActions.closeFinder(); break;
            default:
                switch (getMethod()) {
                    case "piano":
                        pianoControl(eventKey);
                        break;
                    case "guitar":
                        guitarControl(eventKey);
                        break;
                    case "drum":
                        drumControl(eventKey);
                        break;
                }
        }
    }

    const getHoldCallbacks = (eventKey: string): InputState.Callbacks => {
        const callbacks: InputState.Callbacks = {};

        return callbacks;
    }

    return {
        control,
        getHoldCallbacks
    };
}
export default useInputFinder;
