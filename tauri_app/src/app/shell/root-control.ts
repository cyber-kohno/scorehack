import useReducerMelody from "../../system/store/reducer/reducerMelody";
import type { StoreProps } from "../../system/store/store";
import {
  hasAnyInputHold,
  setInputHoldState,
  type InputHoldKey,
} from "../../state/session-state/keyboard-session";
import { getShellMode } from "../../state/ui-state/shell-ui-store";

export const switchMode = (lastStore: StoreProps) => {
  const reducerMelody = useReducerMelody(lastStore);
  const mode = getShellMode(lastStore);
  if (mode === "harmonize") reducerMelody.syncCursorFromElementSeq();
  lastStore.control.mode = mode === "harmonize" ? "melody" : "harmonize";
  lastStore.ref.trackArr.forEach((track) => (track.length = 0));
};

export const setInputHold = (
  lastStore: StoreProps,
  key: InputHoldKey,
  isDown: boolean,
) => {
  setInputHoldState(lastStore, key, isDown);
};

export const hasHoldInput = (lastStore: StoreProps) => {
  return hasAnyInputHold(lastStore);
};
