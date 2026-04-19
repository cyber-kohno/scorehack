import { get, writable } from "svelte/store";
import type { MelodyNote } from "../../domain/melody/melody-types";

export type MelodyClipboardState = {
  notes: MelodyNote[] | null;
};

const INITIAL_MELODY_CLIPBOARD_STATE: MelodyClipboardState = {
  notes: null,
};

export const melodyClipboardStore = writable<MelodyClipboardState>(
  INITIAL_MELODY_CLIPBOARD_STATE,
);

export const getMelodyClipboardState = () => get(melodyClipboardStore);

export const touchMelodyClipboardState = () => {
  melodyClipboardStore.set(getMelodyClipboardState());
};

export const setMelodyClipboardNotes = (notes: MelodyNote[] | null) => {
  getMelodyClipboardState().notes = notes;
};
