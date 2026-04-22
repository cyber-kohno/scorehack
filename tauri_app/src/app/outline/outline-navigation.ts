import { createProjectDataActions } from "../project-data/project-data-actions";
import {
  getOutlineFocusState,
  setOutlineFocus,
} from "../../state/session-state/outline-focus-store";
import {
  getOutlineTrackIndex,
  setOutlineTrackIndex,
} from "../../state/session-state/outline-track-store";
import type { RootStoreToken } from "../../state/root-store";

export const moveOutlineFocus = (rootStoreToken: RootStoreToken, val: number) => {
  const { getOutlineElements } = createProjectDataActions(rootStoreToken);
  const focus = getOutlineFocusState().focus;
  const length = getOutlineElements().length;
  const next = focus + val;
  if (next >= 0 && next <= length - 1) {
    setOutlineFocus(next);
  }
};

export const moveOutlineSectionFocus = (rootStoreToken: RootStoreToken, dir: -1 | 1) => {
  const { getOutlineElements } = createProjectDataActions(rootStoreToken);
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
  rootStoreToken: RootStoreToken,
  nextIndex: number,
) => {
  const { getArrangeTracks } = createProjectDataActions(rootStoreToken);
  const tracks = getArrangeTracks();
  if (tracks[nextIndex] == undefined) throw new Error();
  setOutlineTrackIndex(nextIndex);
};

export const getCurrentOutlineHarmonizeTrack = (rootStoreToken: RootStoreToken) => {
  const { getArrangeTrack } = createProjectDataActions(rootStoreToken);
  const track = getArrangeTrack(getOutlineTrackIndex());
  if (track == undefined) throw new Error();
  return track;
};
