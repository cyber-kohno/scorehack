import type { InputCallbacks } from "../../state/session-state/input-store";
import type { CommitContext } from "../../state/root-store";
import { getOutlineArrangeState } from "../../state/session-state/outline-arrange-store";

const useInputGuitarEditor = (commitContext: CommitContext) => {
    void commitContext;
    const control = (eventKey: string) => {
        void eventKey;
        const arrange = getOutlineArrangeState();
        if (arrange == null) throw new Error();
    }

    const getHoldCallbacks = (eventKey: string): InputCallbacks => {
        void eventKey;
        const callbacks: InputCallbacks = {};

        return callbacks;
    }

    return {
        control,
        getHoldCallbacks
    };
}
export default useInputGuitarEditor;



