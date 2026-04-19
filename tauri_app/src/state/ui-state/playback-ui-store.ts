import { getEnvBeatWidth } from "../session-state/env-store";
import {
  getPreviewState,
  type PreviewSoundFontItem,
} from "../session-state/preview-store";

export const isPlaybackActive = (_lastStore?: unknown) => {
  return getPreviewState().timerKeys != null;
};

export const getPlaybackLinePos = (_lastStore?: unknown) => {
  return getPreviewState().linePos;
};

export const getPlaybackProgressTime = (_lastStore?: unknown) => {
  return getPreviewState().progressTime;
};

export const getPlaybackLastTime = (_lastStore?: unknown) => {
  return getPreviewState().lastTime;
};

export const getPlaybackTimerKeys = (_lastStore?: unknown) => {
  return getPreviewState().timerKeys;
};

export const getPlaybackIntervalKeys = (_lastStore?: unknown) => {
  return getPreviewState().intervalKeys;
};

export const getLoadedSoundFonts = (_lastStore?: unknown): PreviewSoundFontItem[] => {
  return getPreviewState().sfItems;
};

export const getPlaybackAudios = (_lastStore?: unknown) => {
  return getPreviewState().audios;
};

export const getPlaybackLineOffset = (_lastStore: unknown, shadeWidth: number) => {
  return getPlaybackLinePos() * getEnvBeatWidth() - shadeWidth;
};
