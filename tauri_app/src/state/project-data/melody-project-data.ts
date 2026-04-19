import type {
  MelodyAudioTrack,
  MelodyScoreTrack,
} from "../../domain/melody/melody-types";
import type { StoreProps } from "../../system/store/store";
import { getProjectData } from "./project-data-store";
import {
  getAudioTrackState,
  setAudioTrackState,
} from "../session-state/audio-track-store";
import {
  getScoreTrackState,
  setScoreTrackState,
} from "../session-state/score-track-store";

export const getScoreTracks = (lastStore: StoreProps): MelodyScoreTrack[] => {
  return getScoreTrackState();
};

export const getScoreTrack = (
  lastStore: StoreProps,
  index: number,
): MelodyScoreTrack | undefined => {
  return getScoreTracks(lastStore)[index];
};

export const setScoreTracks = (
  lastStore: StoreProps,
  tracks: MelodyScoreTrack[],
): void => {
  setScoreTrackState(tracks);
};

export const getAudioTracks = (lastStore: StoreProps): MelodyAudioTrack[] => {
  return getAudioTrackState();
};

export const getAudioTrack = (
  lastStore: StoreProps,
  index: number,
): MelodyAudioTrack | undefined => {
  return getAudioTracks(lastStore)[index];
};

export const setAudioTracks = (
  lastStore: StoreProps,
  tracks: MelodyAudioTrack[],
): void => {
  setAudioTrackState(tracks);
};
