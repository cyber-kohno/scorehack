import type { InputCallbacks } from "../../state/session-state/input-store";
import useInputMelody from "../melody/melody-input";
import useInputOutline from "../outline/outline-input";
import type { CommitContext, RootStoreToken } from "../../state/root-store";
import {
  getShellMode,
  isArrangeInUse,
} from "../../state/ui-state/shell-ui-store";
import { createTerminalActions } from "../terminal/terminal-actions";
import useInputTerminal from "../terminal/terminal-input";
import {
  hasHoldInput,
  setInputHold,
  switchMode,
} from "./root-control";
import { getInputStateStore } from "../../state/session-state/input-store";
import type { InputHoldKey } from "../../state/session-state/keyboard-session";

const HOLD_KEY_MAP: Partial<Record<string, InputHoldKey>> = {
  e: "holdE",
  d: "holdD",
  f: "holdF",
  c: "holdC",
  x: "holdX",
  g: "holdG",
  Shift: "holdShift",
  Control: "holdCtrl",
};

const applyHoldCallbacks = (
  rootStoreToken: RootStoreToken,
  callbacks: InputCallbacks,
) => {
  void rootStoreToken;
  const input = getInputStateStore();
  Object.keys(callbacks).some((key) => {
    const holdKey = key as keyof typeof input;
    const callback = callbacks[holdKey];
    if (input[holdKey] && callback != undefined) {
      callback();
      return true;
    }
    return false;
  });
};

const getRootHoldCallbacks = (eventKey: string): InputCallbacks => {
  const callbacks: InputCallbacks = {};

  callbacks.holdE = () => {
    switch (eventKey) {
      case "ArrowUp": {
        console.log("E hold + ArrowUp");
      }
    }
  };

  return callbacks;
};

export const createKeyboardRouter = (commitContext: CommitContext) => {
  const { lastStore: rootStoreToken, commit } = commitContext;
  const terminalActions = createTerminalActions(rootStoreToken);
  const inputOutline = useInputOutline(commitContext);
  const inputMelody = useInputMelody(commitContext);

  const updateHold = (eventKey: string, isDown: boolean) => {
    const holdKey = HOLD_KEY_MAP[eventKey];
    if (holdKey == null) return;
    setInputHold(rootStoreToken, holdKey, isDown);
    commit();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const eventKey = event.key;
    const mode = getShellMode(rootStoreToken);
    const isUseArrange = isArrangeInUse(rootStoreToken);

    if (!hasHoldInput(rootStoreToken)) {
      if (terminalActions.isUse()) {
        useInputTerminal(commitContext).control(eventKey);
        commit();
        return;
      }

      switch (eventKey) {
        case "r": {
          if (!isUseArrange) {
            switchMode(rootStoreToken);
            commit();
          }
          break;
        }
        case "t": {
          terminalActions.open();
          commit();
          break;
        }
      }

      switch (mode) {
        case "harmonize": {
          inputOutline.control(eventKey);
          break;
        }
        case "melody": {
          inputMelody.control(eventKey);
          break;
        }
      }

      updateHold(event.key, true);
      return;
    }

    applyHoldCallbacks(rootStoreToken, getRootHoldCallbacks(eventKey));

    switch (mode) {
      case "harmonize": {
        applyHoldCallbacks(rootStoreToken, inputOutline.getHoldCallbacks(eventKey));
        break;
      }
      case "melody": {
        applyHoldCallbacks(rootStoreToken, inputMelody.getHoldCallbacks(eventKey));
        break;
      }
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    updateHold(event.key, false);
  };

  return {
    onKeyDown,
    onKeyUp,
  };
};


