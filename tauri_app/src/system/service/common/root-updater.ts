import { get } from "svelte/store";
import type { StoreProps } from "../../store/store";
import { inputStore } from "../../store/global-store";

const useReducerRoot = () => {
    const input = get(inputStore);

    type InputKey = keyof StoreProps['input'];
    const setInputHold = (key: InputKey, isDown: boolean) => {
        input[key] = isDown;
    }

    return {
        setInputHold,
    };
}

export default useReducerRoot;
