import SoundFont, { type InstrumentName } from "soundfont-player";
import type { StoreProps } from "../../system/store/store";

export const setPlaybackTimerKeys = (
  lastStore: StoreProps,
  timerKeys: number[] | null,
) => {
  lastStore.preview.timerKeys = timerKeys;
};

export const setPlaybackIntervalKeys = (
  lastStore: StoreProps,
  intervalKeys: number[] | null,
) => {
  lastStore.preview.intervalKeys = intervalKeys;
};

export const setPlaybackLastTime = (lastStore: StoreProps, time: number) => {
  lastStore.preview.lastTime = time;
};

export const setPlaybackProgressTime = (
  lastStore: StoreProps,
  time: number,
) => {
  lastStore.preview.progressTime = time;
};

export const setPlaybackLinePos = (lastStore: StoreProps, linePos: number) => {
  lastStore.preview.linePos = linePos;
};

export const clearPlaybackAudios = (lastStore: StoreProps) => {
  lastStore.preview.audios.length = 0;
};

export const pausePlaybackAudios = (lastStore: StoreProps) => {
  lastStore.preview.audios.forEach((audio) => audio.element.pause());
};

export const stopLoadedSoundFonts = (lastStore: StoreProps) => {
  lastStore.preview.sfItems.forEach((sf) => {
    if (sf.player) sf.player.stop();
  });
};

export const pushPlaybackAudio = (
  lastStore: StoreProps,
  audio: HTMLAudioElement,
  referIndex: number,
) => {
  lastStore.preview.audios.push({
    element: audio,
    referIndex,
  });
};

export const addLoadedSoundFont = (
  lastStore: StoreProps,
  instrumentName: InstrumentName,
) => {
  lastStore.preview.sfItems.push({ instrumentName });
};

export const setLoadedSoundFontPlayer = (
  lastStore: StoreProps,
  instrumentName: InstrumentName,
  player: SoundFont.Player,
) => {
  const item = lastStore.preview.sfItems.find(
    (sf) => sf.instrumentName === instrumentName,
  );
  if (item == undefined) throw new Error();
  item.player = player;
};
