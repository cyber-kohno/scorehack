import type { MelodyNote } from "./melody-types";

export type MelodyControlState = {
  trackIndex: number;
  cursor: MelodyNote;
  isOverlap: boolean;
  focus: number;
  focusLock: number;
  clipboard: {
    notes: MelodyNote[] | null;
  };
};

export const INITIAL_MELODY_CONTROL_STATE: MelodyControlState = {
  cursor: {
    norm: { div: 1 },
    pos: 0,
    len: 1,
    pitch: 42,
  },
  focus: -1,
  focusLock: -1,
  isOverlap: false,
  trackIndex: 0,
  clipboard: { notes: null },
};
