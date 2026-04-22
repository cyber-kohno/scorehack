import { get, writable } from "svelte/store";

export type ProjectFileHandle = {
  path: string;
  name: string;
};

export type ProjectFileState = {
  score?: ProjectFileHandle;
};

export const INITIAL_PROJECT_FILE_STATE: ProjectFileState = {};

export const projectFileStore = writable<ProjectFileState>(
  INITIAL_PROJECT_FILE_STATE,
);

export const getProjectFileState = () => get(projectFileStore);

export const getScoreFileHandle = () => getProjectFileState().score;

export const setScoreFileHandle = (score: ProjectFileHandle) => {
  projectFileStore.update((state) => ({
    ...state,
    score,
  }));
};

export const clearProjectFileState = () => {
  projectFileStore.set(INITIAL_PROJECT_FILE_STATE);
};
