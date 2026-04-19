import { createProjectDataActions } from "../project-data/project-data-actions";
import {
  getOutlineFocusState,
  setOutlineFocus,
} from "../../state/session-state/outline-focus-store";
import {
  getOutlineTrackIndex,
  setOutlineTrackIndex,
} from "../../state/session-state/outline-track-store";
import type { StoreProps } from "../../system/store/store";

export const moveOutlineFocus = (lastStore: StoreProps, val: number) => {
  const { getOutlineElements } = createProjectDataActions(lastStore);
  const focus = getOutlineFocusState().focus;
  const length = getOutlineElements().length;
  const next = focus + val;
  if (next >= 0 && next <= length - 1) {
    setOutlineFocus(next);
  }
};

export const moveOutlineSectionFocus = (lastStore: StoreProps, dir: -1 | 1) => {
  const { getOutlineElements } = createProjectDataActions(lastStore);
  const elements = getOutlineElements();

  let tempFocus = getOutlineFocusState().focus;
  const isIncrement = () =>
    dir === -1 ? tempFocus > 0 : tempFocus < elements.length - 1;

  while (isIncrement()) {
    tempFocus += dir;
    if (
      elements[tempFocus].type === "section" ||
      tempFocus === elements.length - 1
    ) {
      setOutlineFocus(tempFocus);
      break;
    }
  }
};

export const changeOutlineHarmonizeTrack = (
  lastStore: StoreProps,
  nextIndex: number,
) => {
  const { getArrangeTracks } = createProjectDataActions(lastStore);
  const tracks = getArrangeTracks();
  if (tracks[nextIndex] == undefined) throw new Error();
  setOutlineTrackIndex(nextIndex);
};

export const getCurrentOutlineHarmonizeTrack = (lastStore: StoreProps) => {
  const { getArrangeTrack } = createProjectDataActions(lastStore);
  const track = getArrangeTrack(getOutlineTrackIndex());
  if (track == undefined) throw new Error();
  return track;
};
