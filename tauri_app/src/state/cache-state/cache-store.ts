import { get, writable } from "svelte/store";
import type { RootStoreToken } from "../root-store";
import type {
  OutlineDataInit,
  OutlineElement,
} from "../../domain/outline/outline-types";
import type MusicTheory from "../../domain/theory/music-theory";

namespace StoreCache {
  export type Props = {
    baseCaches: BaseCache[];
    chordCaches: ChordCache[];
    elementCaches: ElementCache[];
    outlineTailPos: number;
  };

  export const INITIAL: Props = {
    baseCaches: [],
    chordCaches: [],
    elementCaches: [],
    outlineTailPos: 0,
  };

  export interface BeatRange {
    startTime: number;
    sustainTime: number;
    startBeat: number;
    lengthBeat: number;
    startBeatNote: number;
    lengthBeatNote: number;
    viewPosLeft: number;
    viewPosWidth: number;
  }

  export interface BaseCache extends BeatRange {
    scoreBase: OutlineDataInit;
    startBar: number;
    baseSeq: number;
  }

  export interface ChordCache extends BeatRange {
    chordSeq: number;
    elementSeq: number;
    baseSeq: number;
    beat: BeatCache;
    compiledChord?: CompiledChord;
    sectionStart?: string;
    modulate?: ModulateCahce;
    tempo?: TempoCahce;
    arrs: string[];
  }

  export interface ModulateCahce {
    prev: MusicTheory.Tonality;
    next: MusicTheory.Tonality;
  }

  export interface TempoCahce {
    prev: number;
    next: number;
  }

  export interface BeatCache {
    num: number;
    eatHead: number;
    eatTail: number;
  }

  export const getBeatInfo = (beatCache: BeatCache) => {
    let ret = beatCache.num.toString();
    if (beatCache.eatHead !== 0 || beatCache.eatTail !== 0) {
      ret += ` (${beatCache.eatHead}, ${beatCache.eatTail})`;
    }
    return ret;
  };

  export type CompiledChord = {
    chord: MusicTheory.KeyChordProps;
    structs: MusicTheory.ChordStruct[];
  };

  export interface ElementCache extends OutlineElement {
    elementSeq: number;
    chordSeq: number;
    baseSeq: number;
    lastChordSeq: number;
    viewHeight: number;
    outlineTop: number;
    curSection: string;
    modulate?: ModulateCahce;
    tempo?: TempoCahce;
  }
}

export default StoreCache;

export const cacheStateStore = writable<StoreCache.Props>(StoreCache.INITIAL);

export const getCacheStateStore = () => get(cacheStateStore);

export const getCache = (): StoreCache.Props => {
  return getCacheStateStore();
};

export const setCache = (nextCache: StoreCache.Props) => {
  cacheStateStore.set(nextCache);
};

export const touchCacheState = () => {
  cacheStateStore.set(getCacheStateStore());
};

export const getBaseCaches = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  return getCache().baseCaches;
};

export const getChordCaches = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  return getCache().chordCaches;
};

export const getElementCaches = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  return getCache().elementCaches;
};

export const getOutlineTailPosition = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  return getCache().outlineTailPos;
};

export const isCacheStandby = (rootStoreToken: RootStoreToken) => {
  return getElementCaches(rootStoreToken).length === 0;
};

export const getBeatSumWidth = (rootStoreToken: RootStoreToken) => {
  return getChordCaches(rootStoreToken).reduce(
    (total, chordCache) => total + chordCache.viewPosWidth,
    0,
  );
};

export const getBeatNoteTail = (rootStoreToken: RootStoreToken) => {
  const chordCaches = getChordCaches(rootStoreToken);
  const tail = chordCaches[chordCaches.length - 1];
  return tail.startBeatNote + tail.lengthBeatNote;
};

export const getBaseCacheFromBeat = (rootStoreToken: RootStoreToken, pos: number) => {
  return getBaseCaches(rootStoreToken).find(
    (baseCache) =>
      baseCache.startBeatNote <= pos &&
      pos < baseCache.startBeatNote + baseCache.lengthBeatNote,
  );
};

export const getChordCacheFromBeat = (rootStoreToken: RootStoreToken, pos: number) => {
  return getChordCaches(rootStoreToken).find(
    (chordCache) =>
      chordCache.startBeatNote <= pos &&
      pos < chordCache.startBeatNote + chordCache.lengthBeatNote,
  );
};
