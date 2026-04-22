import { createMelodyActions } from "../melody/melody-actions";
import type { StoreProps } from "../../state/root-store";
import {
  hasAnyInputHold,
  setInputHoldState,
  type InputHoldKey,
} from "../../state/session-state/keyboard-session";
import { setModeState } from "../../state/session-state/mode-store";
import { resetScoreTrackRefs } from "../../state/session-state/track-ref-session";
import { getShellMode } from "../../state/ui-state/shell-ui-store";

export const switchMode = (lastStore: StoreProps) => {
  const melodyActions = createMelodyActions(lastStore);
  const mode = getShellMode(lastStore);
  if (mode === "harmonize") melodyActions.syncCursorFromElementSeq();
  setModeState(mode === "harmonize" ? "melody" : "harmonize");
  resetScoreTrackRefs();
};

export const setInputHold = (
  lastStore: StoreProps,
  key: InputHoldKey,
  isDown: boolean,
) => {
  void lastStore;
  setInputHoldState(key, isDown);
};

export const hasHoldInput = (lastStore: StoreProps) => {
  void lastStore;
  return hasAnyInputHold();
};

