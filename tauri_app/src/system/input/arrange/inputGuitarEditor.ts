import { get } from "svelte/store";
import type StoreInput from "../../store/state/input-state";
import { controlStore } from "../../store/global-store";
import type { StoreUtil } from "../../store/store";

const useInputGuitarEditor = (storeUtil: StoreUtil) => {
    const { lastStore, commit } = storeUtil;
    const controlStoreValue = get(controlStore);
    lastStore.control = controlStoreValue;
    const outline = controlStoreValue.outline;
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
