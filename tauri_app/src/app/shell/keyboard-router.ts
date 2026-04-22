import type { InputCallbacks } from "../../state/session-state/input-store";
import useInputMelody from "../melody/melody-input";
import useInputOutline from "../outline/outline-input";
import type { StoreProps, StoreUtil } from "../../state/root-store";
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
  const inputOutline = useInputOutline(storeUtil);
  const inputMelody = useInputMelody(storeUtil);

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
        useInputTerminal(storeUtil).control(eventKey);
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



