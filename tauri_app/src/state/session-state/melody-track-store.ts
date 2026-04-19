import { get, writable } from "svelte/store";

export const melodyTrackStore = writable<number>(0);

export const getMelodyTrackIndex = () => get(melodyTrackStore);

export const setMelodyTrackIndex = (trackIndex: number) => {
  melodyTrackStore.set(trackIndex);
};

export const touchMelodyTrackIndex = () => {
  melodyTrackStore.set(getMelodyTrackIndex());
};
