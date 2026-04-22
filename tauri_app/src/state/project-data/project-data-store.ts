import type { MelodyAudioTrack } from "../../domain/melody/melody-types";
import type { MelodyScoreTrack } from "../../domain/melody/melody-types";
import type { OutlineElement } from "../../domain/outline/outline-types";
import type StoreArrange from "../../domain/arrange/arrange-store";
import type { RootStoreToken } from "../root-store";
import {
  getAudioTrackState,
  setAudioTrackState,
} from "../session-state/audio-track-store";
import {
  getArrangeDataState,
  setArrangeDataState,
} from "../session-state/arrange-data-store";
import {
  getScoreTrackState,
  setScoreTrackState,
} from "../session-state/score-track-store";
import {
  getOutlineElementState,
  setOutlineElementState,
} from "../session-state/outline-element-store";

export type ProjectDataSnapshot = {
  elements: OutlineElement[];
  scoreTracks: MelodyScoreTrack[];
  audioTracks: MelodyAudioTrack[];
  arrange: StoreArrange.DataProps;
};

export const getProjectData = (
  rootStoreToken: RootStoreToken,
): ProjectDataSnapshot => {
  void rootStoreToken;
  return {
    elements: getOutlineElementState(),
    scoreTracks: getScoreTrackState(),
    audioTracks: getAudioTrackState(),
    arrange: getArrangeDataState(),
  };
};

export const setProjectData = (
  rootStoreToken: RootStoreToken,
  nextData: ProjectDataSnapshot,
): void => {
  void rootStoreToken;
  const { elements, scoreTracks, audioTracks, arrange } = nextData;
  setOutlineElementState(elements);
  setScoreTrackState(scoreTracks);
  setAudioTrackState(audioTracks);
  setArrangeDataState(arrange);
};
