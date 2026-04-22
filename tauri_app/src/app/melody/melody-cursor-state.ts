import type { MelodyNote } from "../../domain/melody/melody-types";
import {
  getMelodyCursorStore,
  setMelodyCursorStore,
} from "../../state/session-state/melody-cursor-store";
import type { StoreProps } from "../../state/root-store";

export const getMelodyCursorState = (lastStore: StoreProps): MelodyNote => {
  return getMelodyCursorStore();
};

export const copyMelodyCursorState = (lastStore: StoreProps): MelodyNote => {
  return JSON.parse(JSON.stringify(getMelodyCursorState(lastStore)));
};

export const replaceMelodyCursorState = (
  lastStore: StoreProps,
  note: MelodyNote,
) => {
  setMelodyCursorStore(JSON.parse(JSON.stringify(note)));
};
