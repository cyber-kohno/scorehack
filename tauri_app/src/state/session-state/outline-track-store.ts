import { get, writable } from "svelte/store";

export const outlineTrackStore = writable<number>(-1);

export const getOutlineTrackIndex = () => get(outlineTrackStore);

export const setOutlineTrackIndex = (trackIndex: number) => {
  outlineTrackStore.set(trackIndex);
};

export const touchOutlineTrackIndex = () => {
  outlineTrackStore.set(getOutlineTrackIndex());
};
