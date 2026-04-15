import type StorePreview from "../../system/store/props/storePreview";
import type { StoreProps } from "../../system/store/store";

export const isPlaybackActive = (lastStore: StoreProps) => {
  return lastStore.preview.timerKeys != null;
};

export const getPlaybackLinePos = (lastStore: StoreProps) => {
  return lastStore.preview.linePos;
};

export const getPlaybackProgressTime = (lastStore: StoreProps) => {
  return lastStore.preview.progressTime;
};

export const getPlaybackLastTime = (lastStore: StoreProps) => {
  return lastStore.preview.lastTime;
};

export const getPlaybackTimerKeys = (lastStore: StoreProps) => {
  return lastStore.preview.timerKeys;
};

export const getPlaybackIntervalKeys = (lastStore: StoreProps) => {
  return lastStore.preview.intervalKeys;
};

export const getLoadedSoundFonts = (
  lastStore: StoreProps,
): StorePreview.SFItem[] => {
  return lastStore.preview.sfItems;
};

export const getPlaybackAudios = (lastStore: StoreProps) => {
  return lastStore.preview.audios;
};

export const getPlaybackLineOffset = (
  lastStore: StoreProps,
  shadeWidth: number,
) => {
  return getPlaybackLinePos(lastStore) * lastStore.env.beatWidth - shadeWidth;
};
