import SoundFont, { type InstrumentName } from "soundfont-player";
import { getPreviewState } from "./preview-store";

export const setPlaybackTimerKeys = (timerKeys: number[] | null) => {
  getPreviewState().timerKeys = timerKeys;
};

export const setPlaybackIntervalKeys = (intervalKeys: number[] | null) => {
  getPreviewState().intervalKeys = intervalKeys;
};

export const setPlaybackLastTime = (time: number) => {
  getPreviewState().lastTime = time;
};

export const setPlaybackProgressTime = (time: number) => {
  getPreviewState().progressTime = time;
};

export const setPlaybackLinePos = (linePos: number) => {
  getPreviewState().linePos = linePos;
};

export const clearPlaybackAudios = () => {
  getPreviewState().audios.length = 0;
};

export const pausePlaybackAudios = () => {
  getPreviewState().audios.forEach((audio) => audio.element.pause());
};

export const stopLoadedSoundFonts = () => {
  getPreviewState().sfItems.forEach((sf) => {
    if (sf.player) sf.player.stop();
  });
};

export const pushPlaybackAudio = (
  audio: HTMLAudioElement,
  referIndex: number,
) => {
  getPreviewState().audios.push({
    element: audio,
    referIndex,
  });
};

export const addLoadedSoundFont = (instrumentName: InstrumentName) => {
  getPreviewState().sfItems.push({ instrumentName });
};

export const setLoadedSoundFontPlayer = (
  instrumentName: InstrumentName,
  player: SoundFont.Player,
) => {
  const item = getPreviewState().sfItems.find(
    (sf) => sf.instrumentName === instrumentName,
  );
  if (item == undefined) throw new Error();
  item.player = player;
};
