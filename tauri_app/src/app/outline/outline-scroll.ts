import { getCurrentOutlineElementCache } from "../../state/cache-state/outline-cache";
import { getTimelineFocusChordCache } from "../../state/cache-state/timeline-cache";
import {
  findOutlineElementRef,
  getOutlineFrameRef,
} from "../../state/session-state/outline-ref-store";
import { getOutlineFocusState } from "../../state/session-state/outline-focus-store";
import type { StoreProps } from "../../state/root-store";
import { smoothScrollLeft, smoothScrollTop } from "../viewport/scroll-actions";
import {
  getTimelineGridRef,
  getTimelineHeaderRef,
} from "../../state/session-state/timeline-viewport-store";

export const adjustTimelineScrollXFromOutline = (lastStore: StoreProps) => {
  const gridRef = getTimelineGridRef();
  const headerRef = getTimelineHeaderRef();
  if (gridRef == undefined || headerRef == undefined) return;
  const width = gridRef.getBoundingClientRect().width;
  const element = getCurrentOutlineElementCache(lastStore);
  if (element == undefined) return;

  const { lastChordSeq, chordSeq } = element;
  let pos = 0;
  if (lastChordSeq !== -1) {
    const chordCache = getTimelineFocusChordCache(lastStore);
    if (chordCache == undefined) return;

    if (chordSeq !== -1) {
      pos = chordCache.viewPosLeft + chordCache.viewPosWidth / 2 - width / 2;
    } else {
      pos = chordCache.viewPosLeft + chordCache.viewPosWidth - width / 2;
    }
  }

  smoothScrollLeft(lastStore, [gridRef, headerRef], pos);
};

export const adjustOutlineScroll = (lastStore: StoreProps) => {
  const ref = getOutlineFrameRef();
  if (ref == undefined) return;

  const { height: outlineHeight } = ref.getBoundingClientRect();
  const elementSeq = getOutlineFocusState().focus;
  const element = getCurrentOutlineElementCache(lastStore);
  if (element == undefined) return;

  const elementRef = findOutlineElementRef(elementSeq);
  if (elementRef == undefined) return;

  const height = elementRef.ref.getBoundingClientRect().height;
  const top = element.outlineTop - outlineHeight / 2 + height / 2;
  smoothScrollTop(lastStore, [ref], top);
};
