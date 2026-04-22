import type { OutlineElement } from "../../domain/outline/outline-types";
import type {
  MelodyAudioTrack,
  MelodyScoreTrack,
} from "../../domain/melody/melody-types";
import type StoreArrange from "../../domain/arrange/arrange-store";
import type { RootStoreToken } from "../../state/root-store";
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

export const createProjectDataActions = (rootStoreToken: RootStoreToken) => {
  return {
    getProjectData: () => getProjectData(rootStoreToken),
    setProjectData: (nextData: ReturnType<typeof getProjectData>) =>
      setProjectData(rootStoreToken, nextData),

    getOutlineElements: () => getOutlineElements(rootStoreToken),
    getOutlineElement: (index: number) => getOutlineElement(rootStoreToken, index),
    setOutlineElements: (elements: OutlineElement[]) =>
      setOutlineElements(rootStoreToken, elements),
    insertOutlineElementAt: (index: number, element: OutlineElement) =>
      insertOutlineElementAt(rootStoreToken, index, element),
    removeOutlineElementAt: (index: number) =>
      removeOutlineElementAt(rootStoreToken, index),

    getScoreTracks: () => getScoreTracks(rootStoreToken),
    getScoreTrack: (index: number) => getScoreTrack(rootStoreToken, index),
    setScoreTracks: (tracks: MelodyScoreTrack[]) =>
      setScoreTracks(rootStoreToken, tracks),

    getAudioTracks: () => getAudioTracks(rootStoreToken),
    getAudioTrack: (index: number) => getAudioTrack(rootStoreToken, index),
    setAudioTracks: (tracks: MelodyAudioTrack[]) =>
      setAudioTracks(rootStoreToken, tracks),

    getArrangeTracks: () => getArrangeTracks(rootStoreToken),
    getArrangeData: () => getArrangeData(rootStoreToken),
    getArrangeTrack: (index: number) => getArrangeTrack(rootStoreToken, index),
    setArrangeTracks: (tracks: StoreArrange.Track[]) =>
      setArrangeTracks(rootStoreToken, tracks),
  };
};
