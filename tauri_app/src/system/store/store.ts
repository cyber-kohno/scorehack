import { get } from "svelte/store";
import { controlStore, dataStore, derivedStore, inputStore, playbackStore, refStore, settingsStore, terminalStore } from "./global-store";
import type ControlState from "./state/control-state";
import DataState from "./state/data/data-state";
import DerivedState from "./state/derived-state";
import StoreInput from "./state/input-state";
import PlaybackState from "./state/playback-state";
import RefState from "./state/ref-state";
import SettingsState from "./state/settings-state";
import type TerminalState from "./state/terminal-state";

export type StoreProps = {
    cache: DerivedState.Value;
    control: ControlState.Value;
    data: DataState.Value;
    settings: SettingsState.Value;
    input: StoreInput.Value;
    preview: PlaybackState.Value;
    ref: RefState.Value;
    terminal: null | TerminalState.Value;
}

export type StoreUtil = {
    lastStore: StoreProps;
    commit: () => void;
}

const getStoreValue = (): StoreProps => {

    return {
        cache: get(derivedStore),
        control: get(controlStore),
        data: get(dataStore),
        settings: get(settingsStore),
        input: get(inputStore),
        preview: get(playbackStore),
        ref: get(refStore),
        terminal: get(terminalStore),
    };
};

const store = {
    subscribe(run: (value: StoreProps) => void) {
        run(getStoreValue());
        const unsubscribeControl = controlStore.subscribe(() => {
            run(getStoreValue());
        });
        const unsubscribeData = dataStore.subscribe(() => {
            run(getStoreValue());
        });
        const unsubscribeInput = inputStore.subscribe(() => {
            run(getStoreValue());
        });
        const unsubscribeDerived = derivedStore.subscribe(() => {
            run(getStoreValue());
        });
        const unsubscribeRef = refStore.subscribe(() => {
            run(getStoreValue());
        });
        const unsubscribeSettings = settingsStore.subscribe(() => {
            run(getStoreValue());
        });
        const unsubscribePlayback = playbackStore.subscribe(() => {
            run(getStoreValue());
        });
        const unsubscribeTerminal = terminalStore.subscribe(() => {
            run(getStoreValue());
        });

        return () => {
            unsubscribeControl();
            unsubscribeData();
            unsubscribeInput();
            unsubscribeDerived();
            unsubscribeRef();
            unsubscribeSettings();
            unsubscribePlayback();
            unsubscribeTerminal();
        };
    },
    set(value: StoreProps) {
        const { control, data, settings: env, input, preview, ref, settings, terminal, cache } = value;
        controlStore.set(control);
        dataStore.set(data);
        inputStore.set(input);
        derivedStore.set(cache);
        refStore.set(ref);
        settingsStore.set(settings);
        playbackStore.set(preview);
        terminalStore.set(terminal);
        void env;
    },
    update(updater: (value: StoreProps) => StoreProps) {
        store.set(updater(getStoreValue()));
    }
};

export const createStoreUtil = (lastStore: StoreProps): StoreUtil => {
    return {
        lastStore,
        commit: () => {
            const { control, data, settings: env, input, preview, ref, settings, terminal, cache } = lastStore;
            controlStore.set(control);
            dataStore.set(data);
            inputStore.set(input);
            derivedStore.set(cache);
            refStore.set(ref);
            settingsStore.set(settings);
            playbackStore.set(preview);
            terminalStore.set(terminal);
            void env;
        },
    };
}

export default store;
