import MusicTheory from "../../domain/theory/music-theory";
import StoreRef from "../../system/store/props/storeRef";
import type { StoreProps } from "../../system/store/store";
import { getTimelineFocusPos } from "../../app/timeline/get-timeline-focus-pos";
import {
  getTimelineBaseCaches,
  getTimelineChordCaches,
  getTimelineCurrentBaseCache,
  getTimelineCurrentChordCache,
  getTimelineFocusElementCache,
} from "../cache-state/timeline-cache";

export const getTimelineHeaderScrollLimitProps = (lastStore: StoreProps) => {
  return StoreRef.getScrollLimitProps(lastStore.ref.header);
};

export const getTimelineGridScrollLimitProps = (lastStore: StoreProps) => {
  return StoreRef.getScrollLimitProps(lastStore.ref.grid);
};

export const isTimelineMelodyMode = (lastStore: StoreProps) => {
  return lastStore.control.mode === "melody";
};

export const getTimelineOutlineFocus = (lastStore: StoreProps) => {
  return lastStore.control.outline.focus;
};

export const getTimelineBeatWidth = (lastStore: StoreProps) => {
  return lastStore.env.beatWidth;
};

export const getTimelinePianoInfo = (lastStore: StoreProps) => {
  const element = getTimelineFocusElementCache(lastStore);
  if (element == undefined || element.type !== "chord") return null;

  const chordCache = getTimelineCurrentChordCache(lastStore);
  const base = getTimelineCurrentBaseCache(lastStore);
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

export const getTimelineFocusInfo = (lastStore: StoreProps) => {
  const elementCache = getTimelineFocusElementCache(lastStore);
  const chordCaches = getTimelineChordCaches(lastStore);
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

export const getTimelineTailMarginLeft = (lastStore: StoreProps) => {
  const chordCaches = getTimelineChordCaches(lastStore);
  if (chordCaches.length === 0) return 0;
  const chordCache = chordCaches[chordCaches.length - 1];
  return chordCache.viewPosLeft + chordCache.viewPosWidth;
};

export const getVisibleTimelineChordCaches = (
  lastStore: StoreProps,
  scrollLimitProps: StoreRef.ScrollLimitProps,
) => {
  const focusPos = getTimelineFocusPos(lastStore);
  return getTimelineChordCaches(lastStore).filter((chordCache) => {
    const middle = chordCache.viewPosLeft + chordCache.viewPosWidth / 2;
    return (
      Math.abs(scrollLimitProps.scrollMiddleX - middle) <
        scrollLimitProps.rectWidth ||
      Math.abs(focusPos - middle) < scrollLimitProps.rectWidth
    );
  });
};

export const getTimelineChordName = (
  chordCache: StoreProps["cache"]["chordCaches"][number],
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
  lastStore: StoreProps,
  scrollLimitProps: StoreRef.ScrollLimitProps,
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

  const focusPos = getTimelineFocusPos(lastStore);
  getTimelineChordCaches(lastStore).forEach((chordCache) => {
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
