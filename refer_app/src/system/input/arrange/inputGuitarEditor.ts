import type StoreInput from "../../store/props/storeInput";
import type { StoreUtil } from "../../store/store";

const useInputGuitarEditor = (storeUtil: StoreUtil) => {
    const { lastStore, commit } = storeUtil;

    const outline = lastStore.control.outline;
    const arrange = outline.arrange;

    const control = (eventKey: string) => {
        if (arrange == null) throw new Error();
    }

    const getHoldCallbacks = (eventKey: string): StoreInput.Callbacks => {
        const callbacks: StoreInput.Callbacks = {};

        return callbacks;
    }

    return {
        control,
        getHoldCallbacks
    };
}
export default useInputGuitarEditor;