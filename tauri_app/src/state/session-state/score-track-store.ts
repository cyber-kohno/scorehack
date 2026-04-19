import { get, writable } from "svelte/store";
import type { MelodyScoreTrack } from "../../domain/melody/melody-types";
import StoreMelody from "../../domain/melody/melody-store";

export const scoreTrackStore = writable<MelodyScoreTrack[]>([
  StoreMelody.createMelodyTrackScoreInitial(),
]);

export const getScoreTrackState = () => get(scoreTrackStore);

export const setScoreTrackState = (tracks: MelodyScoreTrack[]) => {
  scoreTrackStore.set(tracks);
};

export const touchScoreTrackState = () => {
  scoreTrackStore.set(getScoreTrackState());
};
