import type StoreArrange from "../../system/store/props/arrange/storeArrange";
import type { StoreProps } from "../../system/store/store";
import { getProjectData } from "./project-data-store";

export const getArrangeData = (lastStore: StoreProps): StoreArrange.DataProps => {
  return getProjectData(lastStore).arrange;
};

export const getArrangeTracks = (
  lastStore: StoreProps,
): StoreArrange.Track[] => {
  return getArrangeData(lastStore).tracks;
};

export const getArrangeTrack = (
  lastStore: StoreProps,
  index: number,
): StoreArrange.Track | undefined => {
  return getArrangeTracks(lastStore)[index];
};

export const setArrangeTracks = (
  lastStore: StoreProps,
  tracks: StoreArrange.Track[],
): void => {
  getArrangeData(lastStore).tracks = tracks;
};
