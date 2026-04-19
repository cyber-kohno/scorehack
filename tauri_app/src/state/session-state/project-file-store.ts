import { get, writable } from "svelte/store";

namespace ProjectFileStore {
  export type Handle = {
    path: string;
    name: string;
  };

  export type Props = {
    score?: Handle;
  };

  export const INITIAL: Props = {};
}

export default ProjectFileStore;

export const projectFileStore = writable<ProjectFileStore.Props>(
  ProjectFileStore.INITIAL,
);

export const getProjectFileState = () => get(projectFileStore);

export const getScoreFileHandle = () => getProjectFileState().score;

export const setScoreFileHandle = (score: ProjectFileStore.Handle) => {
  projectFileStore.update((state) => ({
    ...state,
    score,
  }));
};

export const clearProjectFileState = () => {
  projectFileStore.set(ProjectFileStore.INITIAL);
};
