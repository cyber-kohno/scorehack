import type { MelodyNote } from "./melody-types";

export type MelodyControlState = {
  cursor: MelodyNote;
};

export const INITIAL_MELODY_CONTROL_STATE: MelodyControlState = {
  cursor: {
    norm: { div: 1 },
    pos: 0,
    len: 1,
    pitch: 42,
  },
};
