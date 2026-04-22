import { get, type Writable } from "svelte/store";
import { createCommitContext, type RootStoreToken } from "../../state/root-store";
import { createKeyboardRouter } from "../shell/keyboard-router";

export const bindGlobalKeyboard = (store: Writable<RootStoreToken>) => {
  const onKeyDown = (event: KeyboardEvent) => {
    const { onKeyDown } = createKeyboardRouter(createCommitContext(get(store)));
    onKeyDown(event);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    const { onKeyUp } = createKeyboardRouter(createCommitContext(get(store)));
    onKeyUp(event);
  };

  window.addEventListener("keydown", onKeyDown, { capture: true });
  window.addEventListener("keyup", onKeyUp, { capture: true });

  return () => {
    window.removeEventListener("keydown", onKeyDown, { capture: true });
    window.removeEventListener("keyup", onKeyUp, { capture: true });
  };
};

