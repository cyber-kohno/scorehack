import MusicTheory from "../theory/music-theory";
import type StoreCache from "../../system/store/props/storeCache";

export const getPlaybackTimeFromBeat = (
  baseCaches: StoreCache.BaseCache[],
  left: number,
) => {
  let time = 0;
  baseCaches.some((base) => {
    const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(base.scoreBase.ts);
    const beatRate = beatDiv16Cnt / 4;
    const tempo = base.scoreBase.tempo * beatRate;

    const start = base.startBeatNote;
    const end = start + base.lengthBeatNote;
    if (left < end) {
      time += (60000 / tempo) * (left - start);
      return 1;
    }
    time += (60000 / tempo) * base.lengthBeatNote;
  });
  return time;
};

export const getPlaybackBeatFromTime = (
  baseCaches: StoreCache.BaseCache[],
  time: number,
) => {
  let beat = 0;
  baseCaches.some((base) => {
    const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(base.scoreBase.ts);
    const beatRate = beatDiv16Cnt / 4;
    const tempo = base.scoreBase.tempo * beatRate;

    const start = base.startTime;
    const end = start + base.sustainTime;
    if (time < end) {
      beat += ((time - start) / 60000) * tempo;
      return 1;
    }
    beat += (base.sustainTime / 60000) * tempo;
  });
  return beat;
};
