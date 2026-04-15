import MusicTheory from "../../domain/theory/music-theory";
import StoreRef from "../../system/store/props/storeRef";
import type { StoreProps } from "../../system/store/store";
import { getTimelineFocusPos } from "../../app/timeline/get-timeline-focus-pos";

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
  const focus = lastStore.control.outline.focus;
  const element = lastStore.cache.elementCaches[focus];
  if (element == undefined || element.type !== "chord") return null;

  const chordCache = lastStore.cache.chordCaches[element.chordSeq];
  const base = lastStore.cache.baseCaches[element.baseSeq];
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

export const getVisibleTimelineChordCaches = (
  lastStore: StoreProps,
  scrollLimitProps: StoreRef.ScrollLimitProps,
) => {
  const focusPos = getTimelineFocusPos(lastStore);
  return lastStore.cache.chordCaches.filter((chordCache) => {
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
  lastStore.cache.chordCaches.forEach((chordCache) => {
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
