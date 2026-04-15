import type {
  MelodyAudioTrack,
  MelodyScoreTrack,
} from "../../domain/melody/melody-types";
import type { StoreProps } from "../../system/store/store";
import { getProjectData } from "./project-data-store";

export const getScoreTracks = (lastStore: StoreProps): MelodyScoreTrack[] => {
  return getProjectData(lastStore).scoreTracks;
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
  getProjectData(lastStore).scoreTracks = tracks;
};

export const getAudioTracks = (lastStore: StoreProps): MelodyAudioTrack[] => {
  return getProjectData(lastStore).audioTracks;
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
  getProjectData(lastStore).audioTracks = tracks;
};
