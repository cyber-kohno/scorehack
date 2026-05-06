import type InputState from "../../store/state/input-state";

const useInputGuitarEditor = () => {
    const control = (eventKey: string) => {
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
export default useInputGuitarEditor;
