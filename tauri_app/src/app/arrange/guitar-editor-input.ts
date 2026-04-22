import type { InputCallbacks } from "../../state/session-state/input-store";
import type { StoreUtil } from "../../state/root-store";
import { getOutlineArrangeState } from "../../state/session-state/outline-arrange-store";

const useInputGuitarEditor = (storeUtil: StoreUtil) => {
    const control = (eventKey: string) => {
        const arrange = getOutlineArrangeState();
        if (arrange == null) throw new Error();
    }

    const getHoldCallbacks = (eventKey: string): InputCallbacks => {
        const callbacks: InputCallbacks = {};

        return callbacks;
    }

    return {
        control,
        getHoldCallbacks
    };
}
export default useInputGuitarEditor;



