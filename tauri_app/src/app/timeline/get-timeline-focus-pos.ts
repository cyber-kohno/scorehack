import type { StoreProps } from "../../system/store/store";

export const getTimelineFocusPos = (lastStore: StoreProps) => {
  let pos = 0;
  const outlineFocus = lastStore.control.outline.focus;
  const chordSeq = lastStore.cache.elementCaches[outlineFocus].lastChordSeq;
  if (chordSeq !== -1) {
    const chordCache = lastStore.cache.chordCaches[chordSeq];
    pos = chordCache.viewPosLeft + chordCache.viewPosWidth / 2;
  }
  return pos;
};
