import type { InputCallbacks } from "../../state/session-state/input-store";
import { createMelodyInputRouter } from "../melody/melody-input-router";
import { createOutlineInputRouter } from "../outline/outline-input-router";
import type { StoreProps, StoreUtil } from "../../system/store/store";
import {
  getShellMode,
  isArrangeInUse,
} from "../../state/ui-state/shell-ui-store";
import { createTerminalActions } from "../terminal/terminal-actions";
import { createTerminalInputRouter } from "../terminal/terminal-input-router";
import {
  hasHoldInput,
  setInputHold,
  switchMode,
  type InputHoldKey,
} from "./root-control";
import { getInputStateStore } from "../../state/session-state/input-store";

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
  lastStore: StoreProps,
  callbacks: InputCallbacks,
) => {
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

export const createKeyboardRouter = (storeUtil: StoreUtil) => {
  const { lastStore, commit } = storeUtil;
  const terminalActions = createTerminalActions(lastStore);
  const inputOutline = createOutlineInputRouter(storeUtil);
  const inputMelody = createMelodyInputRouter(storeUtil);

  const updateHold = (eventKey: string, isDown: boolean) => {
    const holdKey = HOLD_KEY_MAP[eventKey];
    if (holdKey == null) return;
    setInputHold(lastStore, holdKey, isDown);
    commit();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const eventKey = event.key;
    const mode = getShellMode(lastStore);
    const isUseArrange = isArrangeInUse(lastStore);

    if (!hasHoldInput(lastStore)) {
      if (terminalActions.isUse()) {
        const inputTerminal = createTerminalInputRouter(storeUtil);
        inputTerminal.control(eventKey);
        commit();
        return;
      }

      switch (eventKey) {
        case "r": {
          if (!isUseArrange) {
            switchMode(lastStore);
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

    applyHoldCallbacks(lastStore, getRootHoldCallbacks(eventKey));

    switch (mode) {
      case "harmonize": {
        applyHoldCallbacks(lastStore, inputOutline.getHoldCallbacks(eventKey));
        break;
      }
      case "melody": {
        applyHoldCallbacks(lastStore, inputMelody.getHoldCallbacks(eventKey));
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



