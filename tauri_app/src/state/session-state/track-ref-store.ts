import { get, writable } from "svelte/store";

export type TrackRefItem = {
  seq: number;
  ref: HTMLElement;
};

export type TrackRefGroups = TrackRefItem[][];

const createInitialTrackRefGroups = (): TrackRefGroups => [[]];

export const trackRefStore = writable<TrackRefGroups>(
  createInitialTrackRefGroups(),
);

export const getTrackRefGroups = () => get(trackRefStore);

export const setTrackRefGroups = (groups: TrackRefGroups) => {
  trackRefStore.set(groups);
};

export const touchTrackRefGroups = () => {
  trackRefStore.set(getTrackRefGroups());
};

export const resetTrackRefGroups = (trackCount = 1) => {
  const next = Array.from({ length: Math.max(trackCount, 1) }, () => []);
  setTrackRefGroups(next);
};

export const clearTrackRefGroups = () => {
  getTrackRefGroups().forEach((arr) => {
    arr.length = 0;
  });
};

export const ensureTrackRefGroup = (trackIndex: number) => {
  const groups = getTrackRefGroups();
  while (groups.length <= trackIndex) {
    groups.push([]);
  }
  return groups[trackIndex];
};

export const pushTrackRefGroup = () => {
  getTrackRefGroups().push([]);
};

export const removeTrackRefGroup = (trackIndex: number) => {
  getTrackRefGroups().splice(trackIndex, 1);
};

export const upsertTrackRef = (
  trackIndex: number,
  seq: number,
  ref: HTMLElement,
) => {
  const refs = ensureTrackRefGroup(trackIndex);
  const instance = refs.find((r) => r.seq === seq);
  if (instance == undefined) refs.push({ seq, ref });
  else instance.ref = ref;
};

export const findTrackRef = (trackIndex: number, seq: number) => {
  return ensureTrackRefGroup(trackIndex).find((r) => r.seq === seq);
};
