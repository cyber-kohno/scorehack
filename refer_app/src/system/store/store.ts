import { get, writable, type Writable } from "svelte/store";
import StoreControl from "./props/storeControl";
import StoreData from "./props/storeData";
import StoreInput from "./props/storeInput";
import StorePreview from "./props/storePreview";
import StoreCache from "./props/storeCache";
import StoreRef from "./props/storeRef";
import type StoreTerminal from "./props/storeTerminal";
import StoreFile from "./props/storeFile";
import type StorePianoEditor from "./props/arrange/piano/storePianoEditor";

export type StoreProps = {

    control: StoreControl.Props;
    terminal: null | StoreTerminal.Props;
    data: StoreData.Props;
    input: StoreInput.Props;
    holdCallbacks: StoreInput.Callbacks;
    preview: StorePreview.Props;
    cache: StoreCache.Props;
    env: {
        beatWidth: number;
    },
    ref: StoreRef.Props;
    fileHandle: StoreFile.Props,
}

const store = writable<StoreProps>({
    control: StoreControl.INITIAL,
    terminal: null,
    data: StoreData.INITIAL,
    input: StoreInput.INITIAL,
    holdCallbacks: {},
    preview: StorePreview.INITIAL,
    cache: StoreCache.INITIAL,
    env: {
        beatWidth: 120
    },
    ref: StoreRef.INITIAL,
    fileHandle: StoreFile.INITIAL
});

export type StoreUtil = {
    lastStore: StoreProps;
    commit: () => void;
}

export const createStoreUtil = (lastStore: StoreProps): StoreUtil => {
    return {
        lastStore,
        // commit: () => store.set({ ...lastStore }),
        commit: () => store.set(lastStore),
    };
}

export default store;