import type { InputCallbacks } from "../../state/session-state/input-store";
import type { StoreUtil } from "../../system/store/store";
import {
  clearOutlineArrangeState,
  getOutlineArrangeState,
} from "../../state/session-state/outline-arrange-store";
import useInputGuitarEditor from "./guitar-editor-input";
import useInputPianoEditor from "./piano-editor-input";

const useInputArrange = (storeUtil: StoreUtil) => {
    const { commit } = storeUtil;

    const inputPianoEditor = useInputPianoEditor(storeUtil);
    const inputGuitarEditor = useInputGuitarEditor(storeUtil);

    const control = (eventKey: string) => {
        const arrange = getOutlineArrangeState();
        if (arrange == null) throw new Error();

        switch (eventKey) {
            case 'Escape':
            case 'b': {
                clearOutlineArrangeState();
                commit();
                return;
            }
        }

        switch (arrange.method) {
            case 'piano': { inputPianoEditor.control(eventKey); } break;
            case 'guitar': { inputGuitarEditor.control(eventKey); } break;
        }
    }


    const getHoldCallbacks = (eventKey: string): InputCallbacks => {
        const arrange = getOutlineArrangeState();
        if (arrange == null) throw new Error();

        switch (arrange.method) {
            case 'piano': return inputPianoEditor.getHoldCallbacks(eventKey);
            case 'guitar': return inputGuitarEditor.getHoldCallbacks(eventKey);
        }
    }

    return {
        control,
        getHoldCallbacks
    };
}
export default useInputArrange;



