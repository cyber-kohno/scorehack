import type InputState from "../../../store/state/input-state";
import createArrangeActions from "../../../actions/arrange/arrange-actions";
import createPianoArrangeActions from "../../../actions/arrange/piano/piano-arrange-actions";

const useInputFinder = () => {
    const arrangeActions = createArrangeActions();
    const pianoActions = createPianoArrangeActions();

    const control = (eventKey: string) => {
        switch (eventKey) {
            case 'Escape':
            case 'w': arrangeActions.closeFinder(); break;
            case 'ArrowLeft': pianoActions.moveFinderVoicing(-1); break;
            case 'ArrowRight': pianoActions.moveFinderVoicing(1); break;
            case 'ArrowUp': pianoActions.moveFinderBacking(-1); break;
            case 'ArrowDown': pianoActions.moveFinderBacking(1); break;
            case 'Enter': pianoActions.applyFinderPattern(); break;
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
