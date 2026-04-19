import { get, writable } from "svelte/store";
import type { MelodyAudioTrack } from "../../domain/melody/melody-types";

export const audioTrackStore = writable<MelodyAudioTrack[]>([]);

export const getAudioTrackState = () => get(audioTrackStore);

export const setAudioTrackState = (tracks: MelodyAudioTrack[]) => {
  audioTrackStore.set(tracks);
};

export const touchAudioTrackState = () => {
  audioTrackStore.set(getAudioTrackState());
};
