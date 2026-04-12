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
