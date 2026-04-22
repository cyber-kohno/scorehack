import {
  getOutlineFocusState,
  setOutlineFocusLock,
} from "../../state/session-state/outline-focus-store";
import { getOutlineArrangeState } from "../../state/session-state/outline-arrange-store";
import type { RootStoreToken } from "../../state/root-store";
import {
  moveOutlineFocus,
  moveOutlineSectionFocus,
} from "./outline-navigation";

export const isOutlineArrangeEditorActive = () => {
  const arrange = getOutlineArrangeState();
  return arrange != null && arrange.editor != undefined;
};

export const isOutlineArrangeFinderActive = () => {
  const arrange = getOutlineArrangeState();
  return arrange != null && arrange.finder != undefined;
};

export const isOutlineArrangeInputActive = () =>
  isOutlineArrangeFinderActive() || isOutlineArrangeEditorActive();

type MoveOutlineInputFocusParams = {
  rootStoreToken: RootStoreToken;
  dir: -1 | 1;
  onMoved: () => void;
};

export const moveOutlineInputFocus = ({
  rootStoreToken,
  dir,
  onMoved,
}: MoveOutlineInputFocusParams) => {
  setOutlineFocusLock(-1);
  moveOutlineFocus(rootStoreToken, dir);
  onMoved();
};

export const moveOutlineInputSectionFocus = ({
  rootStoreToken,
  dir,
  onMoved,
}: MoveOutlineInputFocusParams) => {
  setOutlineFocusLock(-1);
  moveOutlineSectionFocus(rootStoreToken, dir);
  onMoved();
};

export const moveOutlineInputRangeFocus = ({
  rootStoreToken,
  dir,
  onMoved,
}: MoveOutlineInputFocusParams) => {
  const outlineFocus = getOutlineFocusState();
  if (outlineFocus.focusLock === -1) setOutlineFocusLock(outlineFocus.focus);
  moveOutlineFocus(rootStoreToken, dir);
  onMoved();
};
