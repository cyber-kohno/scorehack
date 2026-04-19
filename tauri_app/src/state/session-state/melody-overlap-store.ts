import { get, writable } from "svelte/store";

export const melodyOverlapStore = writable<boolean>(false);

export const getMelodyOverlapState = () => get(melodyOverlapStore);

export const setMelodyOverlapState = (isOverlap: boolean) => {
  melodyOverlapStore.set(isOverlap);
};

export const touchMelodyOverlapState = () => {
  melodyOverlapStore.set(getMelodyOverlapState());
};
