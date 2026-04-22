import type { MelodyNote } from "../../domain/melody/melody-types";
import {
  getMelodyCursorStore,
  setMelodyCursorStore,
} from "../../state/session-state/melody-cursor-store";
import type { RootStoreToken } from "../../state/root-store";

export const getMelodyCursorState = (
  rootStoreToken: RootStoreToken,
): MelodyNote => {
  void rootStoreToken;
  return getMelodyCursorStore();
};

export const copyMelodyCursorState = (
  rootStoreToken: RootStoreToken,
): MelodyNote => {
  return JSON.parse(JSON.stringify(getMelodyCursorState(rootStoreToken)));
};

export const replaceMelodyCursorState = (
  rootStoreToken: RootStoreToken,
  note: MelodyNote,
) => {
  void rootStoreToken;
  setMelodyCursorStore(JSON.parse(JSON.stringify(note)));
};
