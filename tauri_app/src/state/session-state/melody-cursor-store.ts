import { get, writable } from "svelte/store";
import { INITIAL_MELODY_CONTROL_STATE } from "../../domain/melody/melody-control";
import type { MelodyNote } from "../../domain/melody/melody-types";

export const melodyCursorStore = writable<MelodyNote>(
  JSON.parse(JSON.stringify(INITIAL_MELODY_CONTROL_STATE.cursor)),
);

export const getMelodyCursorStore = () => get(melodyCursorStore);

export const setMelodyCursorStore = (note: MelodyNote) => {
  melodyCursorStore.set(note);
};

export const touchMelodyCursorState = () => {
  melodyCursorStore.set(getMelodyCursorStore());
};
