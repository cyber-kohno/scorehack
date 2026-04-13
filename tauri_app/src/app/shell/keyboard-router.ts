import type StoreInput from "../../system/store/props/storeInput";
import useInputMelody from "../../system/input/inputMelody";
import { createOutlineInputRouter } from "../outline/outline-input-router";
import useInputTerminal from "../../system/input/inputTerminal";
import useReducerTermianl from "../../system/store/reducer/reducerTerminal";
import type { StoreProps, StoreUtil } from "../../system/store/store";
import {
  getShellMode,
  isArrangeInUse,
} from "../../state/ui-state/shell-ui-store";
import {
  hasHoldInput,
  setInputHold,
  switchMode,
  type InputHoldKey,
} from "./root-control";

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
  callbacks: StoreInput.Callbacks,
) => {
  Object.keys(callbacks).some((key) => {
    const holdKey = key as keyof typeof lastStore.input;
    const callback = callbacks[holdKey];
    if (lastStore.input[holdKey] && callback != undefined) {
      callback();
      return true;
    }
    return false;
  });
};

const getRootHoldCallbacks = (eventKey: string): StoreInput.Callbacks => {
  const callbacks: StoreInput.Callbacks = {};

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
  const reducerTerminal = useReducerTermianl(lastStore);
  const inputOutline = createOutlineInputRouter(storeUtil);
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
      if (reducerTerminal.isUse()) {
        const inputTerminal = useInputTerminal(storeUtil);
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
          reducerTerminal.open();
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
