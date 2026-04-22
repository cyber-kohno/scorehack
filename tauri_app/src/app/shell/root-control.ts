import { createMelodyActions } from "../melody/melody-actions";
import type { RootStoreToken } from "../../state/root-store";
import {
  hasAnyInputHold,
  setInputHoldState,
  type InputHoldKey,
} from "../../state/session-state/keyboard-session";
import { setModeState } from "../../state/session-state/mode-store";
import { resetScoreTrackRefs } from "../../state/session-state/track-ref-session";
import { getShellMode } from "../../state/ui-state/shell-ui-store";

export const switchMode = (rootStoreToken: RootStoreToken) => {
  const melodyActions = createMelodyActions(rootStoreToken);
  const mode = getShellMode(rootStoreToken);
  if (mode === "harmonize") melodyActions.syncCursorFromElementSeq();
  setModeState(mode === "harmonize" ? "melody" : "harmonize");
  resetScoreTrackRefs();
};

export const setInputHold = (
  rootStoreToken: RootStoreToken,
  key: InputHoldKey,
  isDown: boolean,
) => {
  void rootStoreToken;
  setInputHoldState(key, isDown);
};

export const hasHoldInput = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  return hasAnyInputHold();
};

