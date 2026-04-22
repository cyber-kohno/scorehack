import type { MelodyAudioTrack } from "../../domain/melody/melody-types";
import type { RootStoreToken } from "../../state/root-store";
import { getProjectData } from "../../state/project-data/project-data-store";
import { exportMidi } from "./export-midi";
import { importAudio } from "./import-audio";
import { loadProject } from "./load-project";
import { saveProject, type ProjectIoCallbacks } from "./save-project";

export const createProjectIoService = (rootStoreToken: RootStoreToken) => {
  const saveScoreFile = (callbacks: ProjectIoCallbacks) => {
    const plainData = JSON.stringify(getProjectData(rootStoreToken));
    return saveProject(rootStoreToken, plainData, "sch", callbacks);
  };

  const loadScoreFile = (
    success: ProjectIoCallbacks["success"],
    cancel: ProjectIoCallbacks["cancel"],
  ) => {
    return loadProject(rootStoreToken, success, cancel);
  };

  const loadMp3 = (
    track: MelodyAudioTrack,
    success: ProjectIoCallbacks["success"],
    cancel: ProjectIoCallbacks["cancel"],
  ) => {
    return importAudio(track, success, cancel);
  };

  return {
    downloadMidi: exportMidi,
    saveScoreFile,
    loadScoreFile,
    loadMp3,
  };
};
