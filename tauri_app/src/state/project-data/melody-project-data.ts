import type {
  MelodyAudioTrack,
  MelodyScoreTrack,
} from "../../domain/melody/melody-types";
import type { RootStoreToken } from "../root-store";
import {
  getAudioTrackState,
  setAudioTrackState,
} from "../session-state/audio-track-store";
import {
  getScoreTrackState,
  setScoreTrackState,
} from "../session-state/score-track-store";

export const getScoreTracks = (
  rootStoreToken: RootStoreToken,
): MelodyScoreTrack[] => {
  void rootStoreToken;
  return getScoreTrackState();
};

export const getScoreTrack = (
  rootStoreToken: RootStoreToken,
  index: number,
): MelodyScoreTrack | undefined => {
  return getScoreTracks(rootStoreToken)[index];
};

export const setScoreTracks = (
  rootStoreToken: RootStoreToken,
  tracks: MelodyScoreTrack[],
): void => {
  void rootStoreToken;
  setScoreTrackState(tracks);
};

export const getAudioTracks = (
  rootStoreToken: RootStoreToken,
): MelodyAudioTrack[] => {
  void rootStoreToken;
  return getAudioTrackState();
};

export const getAudioTrack = (
  rootStoreToken: RootStoreToken,
  index: number,
): MelodyAudioTrack | undefined => {
  return getAudioTracks(rootStoreToken)[index];
};

export const setAudioTracks = (
  rootStoreToken: RootStoreToken,
  tracks: MelodyAudioTrack[],
): void => {
  void rootStoreToken;
  setAudioTrackState(tracks);
};
