import type { OutlineElement } from "../../domain/outline/outline-types";
import type {
  MelodyAudioTrack,
  MelodyScoreTrack,
} from "../../domain/melody/melody-types";
import type StoreArrange from "../../system/store/props/arrange/storeArrange";
import type { StoreProps } from "../../system/store/store";
import {
  getProjectData,
  setProjectData,
} from "../../state/project-data/project-data-store";
import {
  getArrangeData,
  getArrangeTrack,
  getArrangeTracks,
  setArrangeTracks,
} from "../../state/project-data/arrange-project-data";
import {
  getOutlineElement,
  getOutlineElements,
  insertOutlineElementAt,
  removeOutlineElementAt,
  setOutlineElements,
} from "../../state/project-data/outline-project-data";
import {
  getAudioTrack,
  getAudioTracks,
  getScoreTrack,
  getScoreTracks,
  setAudioTracks,
  setScoreTracks,
} from "../../state/project-data/melody-project-data";

export const createProjectDataActions = (lastStore: StoreProps) => {
  return {
    getProjectData: () => getProjectData(lastStore),
    setProjectData: (nextData: ReturnType<typeof getProjectData>) =>
      setProjectData(lastStore, nextData),

    getOutlineElements: () => getOutlineElements(lastStore),
    getOutlineElement: (index: number) => getOutlineElement(lastStore, index),
    setOutlineElements: (elements: OutlineElement[]) =>
      setOutlineElements(lastStore, elements),
    insertOutlineElementAt: (index: number, element: OutlineElement) =>
      insertOutlineElementAt(lastStore, index, element),
    removeOutlineElementAt: (index: number) =>
      removeOutlineElementAt(lastStore, index),

    getScoreTracks: () => getScoreTracks(lastStore),
    getScoreTrack: (index: number) => getScoreTrack(lastStore, index),
    setScoreTracks: (tracks: MelodyScoreTrack[]) => setScoreTracks(lastStore, tracks),

    getAudioTracks: () => getAudioTracks(lastStore),
    getAudioTrack: (index: number) => getAudioTrack(lastStore, index),
    setAudioTracks: (tracks: MelodyAudioTrack[]) => setAudioTracks(lastStore, tracks),

    getArrangeTracks: () => getArrangeTracks(lastStore),
    getArrangeData: () => getArrangeData(lastStore),
    getArrangeTrack: (index: number) => getArrangeTrack(lastStore, index),
    setArrangeTracks: (tracks: StoreArrange.Track[]) =>
      setArrangeTracks(lastStore, tracks),
  };
};
