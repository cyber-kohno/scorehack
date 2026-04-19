import { get, writable } from "svelte/store";

export type PianoRefs = {
  col?: HTMLElement;
  table?: HTMLElement;
  pedal?: HTMLElement;
};

export type ArrangeFinderRecordRef = {
  seq: number;
  ref: HTMLElement;
};

export type ArrangeRefState = {
  piano: PianoRefs;
  finder: {
    frame?: HTMLElement;
    records: ArrangeFinderRecordRef[];
  };
};

const createInitialArrangeRefState = (): ArrangeRefState => ({
  piano: {},
  finder: { records: [] },
});

export const arrangeRefStore = writable<ArrangeRefState>(
  createInitialArrangeRefState(),
);

export const getArrangeRefState = () => get(arrangeRefStore);

export const getArrangePianoRefs = () => getArrangeRefState().piano;

export const getArrangeFinderRefs = () => getArrangeRefState().finder;

export const setArrangePianoColRef = (ref?: HTMLElement) => {
  const state = getArrangeRefState();
  if (state.piano.col === ref) return;
  state.piano.col = ref;
  arrangeRefStore.set(state);
};

export const setArrangePianoTableRef = (ref?: HTMLElement) => {
  const state = getArrangeRefState();
  if (state.piano.table === ref) return;
  state.piano.table = ref;
  arrangeRefStore.set(state);
};

export const setArrangePianoPedalRef = (ref?: HTMLElement) => {
  const state = getArrangeRefState();
  if (state.piano.pedal === ref) return;
  state.piano.pedal = ref;
  arrangeRefStore.set(state);
};

export const setArrangeFinderFrameRef = (ref?: HTMLElement) => {
  const state = getArrangeRefState();
  if (state.finder.frame === ref) return;
  state.finder.frame = ref;
  arrangeRefStore.set(state);
};

export const upsertArrangeFinderRecordRef = (seq: number, ref: HTMLElement) => {
  const records = getArrangeFinderRefs().records;
  const instance = records.find((item) => item.seq === seq);
  if (instance == undefined) records.push({ seq, ref });
  else instance.ref = ref;
};

export const touchArrangeRefs = () => {
  arrangeRefStore.set(getArrangeRefState());
};
