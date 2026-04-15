import type PreviewUtil from "../../system/util/preview/previewUtil";
import type { StoreUtil } from "../../system/store/store";
import { createPlaybackActions } from "./playback-actions";

export const createPlaybackPreviewRouter = (storeUtil: StoreUtil) => {
  const actions = createPlaybackActions(storeUtil);

  return {
    startPreview: (option: PreviewUtil.Option) => actions.startPreview(option),
    stopPreview: actions.stopPreview,
  };
};
