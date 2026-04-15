import type StoreCache from "../../system/store/props/storeCache";
import type { StoreProps } from "../../system/store/store";

export const getCache = (lastStore: StoreProps): StoreCache.Props => {
  return lastStore.cache;
};

export const setCache = (lastStore: StoreProps, nextCache: StoreCache.Props) => {
  lastStore.cache = nextCache;
};

export const getBaseCaches = (lastStore: StoreProps) => {
  return getCache(lastStore).baseCaches;
};

export const getChordCaches = (lastStore: StoreProps) => {
  return getCache(lastStore).chordCaches;
};

export const getElementCaches = (lastStore: StoreProps) => {
  return getCache(lastStore).elementCaches;
};

export const getOutlineTailPosition = (lastStore: StoreProps) => {
  return getCache(lastStore).outlineTailPos;
};

export const isCacheStandby = (lastStore: StoreProps) => {
  return getElementCaches(lastStore).length === 0;
};

export const getBeatSumWidth = (lastStore: StoreProps) => {
  return getChordCaches(lastStore).reduce(
    (total, chordCache) => total + chordCache.viewPosWidth,
    0,
  );
};

export const getBeatNoteTail = (lastStore: StoreProps) => {
  const chordCaches = getChordCaches(lastStore);
  const tail = chordCaches[chordCaches.length - 1];
  return tail.startBeatNote + tail.lengthBeatNote;
};

export const getBaseCacheFromBeat = (lastStore: StoreProps, pos: number) => {
  return getBaseCaches(lastStore).find(
    (baseCache) =>
      baseCache.startBeatNote <= pos &&
      pos < baseCache.startBeatNote + baseCache.lengthBeatNote,
  );
};

export const getChordCacheFromBeat = (lastStore: StoreProps, pos: number) => {
  return getChordCaches(lastStore).find(
    (chordCache) =>
      chordCache.startBeatNote <= pos &&
      pos < chordCache.startBeatNote + chordCache.lengthBeatNote,
  );
};
