import { get, writable } from "svelte/store";
import { getScrollLimitProps } from "./scroll-limit-props";

export type TimelineViewportRefs = {
  header?: HTMLElement;
  grid?: HTMLElement;
  pitch?: HTMLElement;
};

export const timelineViewportStore = writable<TimelineViewportRefs>({});

export const getTimelineViewportRefs = () => get(timelineViewportStore);

export const getTimelineHeaderRef = () => getTimelineViewportRefs().header;

export const getTimelineGridRef = () => getTimelineViewportRefs().grid;

export const getTimelinePitchRef = () => getTimelineViewportRefs().pitch;

export const setTimelineHeaderRef = (ref?: HTMLElement) => {
  const refs = getTimelineViewportRefs();
  if (refs.header === ref) return;
  refs.header = ref;
  timelineViewportStore.set(refs);
};

export const setTimelineGridRef = (ref?: HTMLElement) => {
  const refs = getTimelineViewportRefs();
  if (refs.grid === ref) return;
  refs.grid = ref;
  timelineViewportStore.set(refs);
};

export const setTimelinePitchRef = (ref?: HTMLElement) => {
  const refs = getTimelineViewportRefs();
  if (refs.pitch === ref) return;
  refs.pitch = ref;
  timelineViewportStore.set(refs);
};

export const touchTimelineViewportRefs = () => {
  timelineViewportStore.set(getTimelineViewportRefs());
};

export const getTimelineViewportScrollLimitProps = (ref?: HTMLElement) => {
  const props = getScrollLimitProps(ref);
  if (props != null) return props;

  if (typeof window === "undefined") return null;

  return {
    scrollMiddleX: window.innerWidth / 2,
    scrollMiddleY: window.innerHeight / 2,
    rectWidth: window.innerWidth,
    rectHeight: window.innerHeight,
  };
};

export const getTimelineHeaderScrollLimitProps = () => {
  return getTimelineViewportScrollLimitProps(getTimelineHeaderRef());
};

export const getTimelineGridScrollLimitProps = () => {
  return getTimelineViewportScrollLimitProps(getTimelineGridRef());
};
