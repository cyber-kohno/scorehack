import {
  getOutlineFocusState,
  setOutlineFocusLock,
} from "../../state/session-state/outline-focus-store";
import { getOutlineArrangeState } from "../../state/session-state/outline-arrange-store";
import type { StoreProps } from "../../state/root-store";
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
  lastStore: StoreProps;
  dir: -1 | 1;
  onMoved: () => void;
};

export const moveOutlineInputFocus = ({
  lastStore,
  dir,
  onMoved,
}: MoveOutlineInputFocusParams) => {
  setOutlineFocusLock(-1);
  moveOutlineFocus(lastStore, dir);
  onMoved();
};

export const moveOutlineInputSectionFocus = ({
  lastStore,
  dir,
  onMoved,
}: MoveOutlineInputFocusParams) => {
  setOutlineFocusLock(-1);
  moveOutlineSectionFocus(lastStore, dir);
  onMoved();
};

export const moveOutlineInputRangeFocus = ({
  lastStore,
  dir,
  onMoved,
}: MoveOutlineInputFocusParams) => {
  const outlineFocus = getOutlineFocusState();
  if (outlineFocus.focusLock === -1) setOutlineFocusLock(outlineFocus.focus);
  moveOutlineFocus(lastStore, dir);
  onMoved();
};
