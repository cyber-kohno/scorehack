import PreviewUtil from "./preview-util";
import type { CommitContext } from "../../state/root-store";

export const createPlaybackActions = (commitContext: CommitContext) => {
  const { lastStore: rootStoreToken } = commitContext;
  const reducer = PreviewUtil.useReducer(rootStoreToken);
  const updater = PreviewUtil.useUpdater(commitContext);

  return {
    isLoadSoundFont: reducer.isLoadSoundFont,
    loadSoundFont: reducer.loadSoundFont,
    startPreview: updater.startTest,
    stopPreview: updater.stopTest,
  };
};
