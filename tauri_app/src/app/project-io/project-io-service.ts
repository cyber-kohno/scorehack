import type StoreMelody from "../../system/store/props/storeMelody";
import type { StoreProps } from "../../system/store/store";
import { exportMidi } from "./export-midi";
import { importAudio } from "./import-audio";
import { loadProject } from "./load-project";
import { saveProject, type ProjectIoCallbacks } from "./save-project";

export const createProjectIoService = (lastStore: StoreProps) => {
  const saveScoreFile = (callbacks: ProjectIoCallbacks) => {
    const plainData = JSON.stringify(lastStore.data);
    return saveProject(lastStore, plainData, "sch", callbacks);
  };

  const loadScoreFile = (
    success: ProjectIoCallbacks["success"],
    cancel: ProjectIoCallbacks["cancel"],
  ) => {
    return loadProject(lastStore, success, cancel);
  };

  const loadMp3 = (
    track: StoreMelody.AudioTrack,
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
