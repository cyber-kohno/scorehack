import MusicTheory from "../../domain/theory/music-theory";
import type StoreCache from "../../state/cache-state/cache-store";
import type { RootStoreToken } from "../root-store";
import { getEnvBeatWidth } from "../session-state/env-store";
import { getModeState } from "../session-state/mode-store";
import { getOutlineFocusState } from "../session-state/outline-focus-store";
import type { ScrollLimitProps } from "../session-state/scroll-limit-props";
import { getTimelineFocusPos } from "../../app/timeline/get-timeline-focus-pos";
import {
  getTimelineBaseCaches,
  getTimelineChordCaches,
  getTimelineCurrentBaseCache,
  getTimelineCurrentChordCache,
  getTimelineFocusElementCache,
} from "../cache-state/timeline-cache";
import {
  getTimelineGridScrollLimitProps as getTimelineGridViewportScrollLimitProps,
  getTimelineHeaderScrollLimitProps as getTimelineHeaderViewportScrollLimitProps,
} from "../session-state/timeline-viewport-store";

export const getTimelineHeaderScrollLimitProps = (
  rootStoreToken: RootStoreToken,
) => {
  void rootStoreToken;
  return getTimelineHeaderViewportScrollLimitProps();
};

export const getTimelineGridScrollLimitProps = (
  rootStoreToken: RootStoreToken,
) => {
  void rootStoreToken;
  return getTimelineGridViewportScrollLimitProps();
};

export const isTimelineMelodyMode = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  return getModeState() === "melody";
};

export const getTimelineOutlineFocus = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  return getOutlineFocusState().focus;
};

export const getTimelineBeatWidth = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  return getEnvBeatWidth();
};

export const getTimelinePianoInfo = (rootStoreToken: RootStoreToken) => {
  const element = getTimelineFocusElementCache(rootStoreToken);
  if (element == undefined || element.type !== "chord") return null;

  const chordCache = getTimelineCurrentChordCache(rootStoreToken);
  const base = getTimelineCurrentBaseCache(rootStoreToken);
  if (chordCache == undefined || base == undefined) return null;

  const tonality = base.scoreBase.tonality;
  const scaleList = MusicTheory.getScaleKeyIndexesFromTonality(tonality);
  const uses =
    chordCache.compiledChord == undefined
      ? []
      : chordCache.compiledChord.structs.map((struct) => struct.key12);

  return {
    scaleList,
    uses,
  };
};

export const getTimelineFocusInfo = (rootStoreToken: RootStoreToken) => {
  const elementCache = getTimelineFocusElementCache(rootStoreToken);
  const chordCaches = getTimelineChordCaches(rootStoreToken);
  if (elementCache == undefined) {
    return { left: 0, width: 20, isChord: false };
  }

  const lastChordSeq = elementCache.lastChordSeq;
  const chordSeq = elementCache.chordSeq;
  let left = 0;
  let width = 20;
  let isChord = false;

  if (chordSeq === -1) {
    if (lastChordSeq !== -1) {
      const chordCache = chordCaches[lastChordSeq];
      left = chordCache.viewPosLeft + chordCache.viewPosWidth;
    }
  } else {
    const chordCache = chordCaches[chordSeq];
    left = chordCache.viewPosLeft;
    width = chordCache.viewPosWidth;
    isChord = true;
  }

  return { left, width, isChord };
};

export const getTimelineTailMarginLeft = (rootStoreToken: RootStoreToken) => {
  const chordCaches = getTimelineChordCaches(rootStoreToken);
  if (chordCaches.length === 0) return 0;
  const chordCache = chordCaches[chordCaches.length - 1];
  return chordCache.viewPosLeft + chordCache.viewPosWidth;
};

export const getVisibleTimelineChordCaches = (
  rootStoreToken: RootStoreToken,
  scrollLimitProps: ScrollLimitProps,
) => {
  const focusPos = getTimelineFocusPos(rootStoreToken);
  return getTimelineChordCaches(rootStoreToken).filter((chordCache) => {
    const middle = chordCache.viewPosLeft + chordCache.viewPosWidth / 2;
    return (
      Math.abs(scrollLimitProps.scrollMiddleX - middle) <
        scrollLimitProps.rectWidth ||
      Math.abs(focusPos - middle) < scrollLimitProps.rectWidth
    );
  });
};

export const getTimelineChordName = (
  chordCache: StoreCache.Props["chordCaches"][number],
) => {
  const compiledChord = chordCache.compiledChord;
  if (compiledChord == undefined) return "-";
  return MusicTheory.getKeyChordName(compiledChord.chord);
};

type TimelineDiff = {
  prev: string;
  next: string;
};

export const getTimelineProgressItems = (
  rootStoreToken: RootStoreToken,
  scrollLimitProps: ScrollLimitProps,
) => {
  const chordList: {
    x: number;
    time: number;
  }[] = [];
  const changeList: {
    x: number;
    section?: string;
    modulate?: TimelineDiff;
    tempo?: TimelineDiff;
  }[] = [];

  const focusPos = getTimelineFocusPos(rootStoreToken);
  getTimelineChordCaches(rootStoreToken).forEach((chordCache) => {
    const x = chordCache.viewPosLeft;
    const middle = chordCache.viewPosLeft + chordCache.viewPosWidth / 2;
    if (
      Math.abs(scrollLimitProps.scrollMiddleX - middle) >
        scrollLimitProps.rectWidth &&
      Math.abs(focusPos - middle) > scrollLimitProps.rectWidth
    ) {
      return;
    }

    chordList.push({
      x,
      time: chordCache.startTime,
    });

    const section = chordCache.sectionStart;
    const modulateCache = chordCache.modulate;
    const tempoCache = chordCache.tempo;
    if (
      section == undefined &&
      modulateCache == undefined &&
      tempoCache == undefined
    ) {
      return;
    }

    let modulate: TimelineDiff | undefined = undefined;
    let tempo: TimelineDiff | undefined = undefined;
    if (modulateCache != undefined) {
      modulate = {
        prev: MusicTheory.getScaleName(modulateCache.prev),
        next: MusicTheory.getScaleName(modulateCache.next),
      };
    } else if (tempoCache != undefined) {
      tempo = {
        prev: tempoCache.prev.toString(),
        next: tempoCache.next.toString(),
      };
    }

    changeList.push({
      x,
      section,
      modulate,
      tempo,
    });
  });

  return {
    chordList,
    changeList,
  };
};



