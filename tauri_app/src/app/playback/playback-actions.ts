import PreviewUtil from "../../system/util/preview/previewUtil";
import type { StoreUtil } from "../../system/store/store";

export const createPlaybackActions = (storeUtil: StoreUtil) => {
  const { lastStore } = storeUtil;
  const reducer = PreviewUtil.useReducer(lastStore);
  const updater = PreviewUtil.useUpdater(storeUtil);

  return {
    isLoadSoundFont: reducer.isLoadSoundFont,
    loadSoundFont: reducer.loadSoundFont,
    startPreview: updater.startTest,
    stopPreview: updater.stopTest,
  };
};
