import { get } from "svelte/store";
import { dataStore, derivedStore, settingsStore } from "../../store/global-store";
import buildDerived from "./build-derived";

/** Rebuild from committed data; actions must commit before recalculating. */
export const recalculate = () => {
    derivedStore.set(buildDerived(get(dataStore), get(settingsStore)));
};

export const createCommitDataAndRecalculate = (commitData: () => void) => () => {
    commitData();
    recalculate();
};

export default recalculate;
