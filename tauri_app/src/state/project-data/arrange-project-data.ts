import type StoreArrange from "../../domain/arrange/arrange-store";
import type { StoreProps } from "../../system/store/store";
import {
  getArrangeDataState,
  setArrangeDataState,
} from "../session-state/arrange-data-store";

export const getArrangeData = (lastStore: StoreProps): StoreArrange.DataProps => {
  return getArrangeDataState();
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
  getArrangeDataState().tracks = tracks;
  setArrangeDataState(getArrangeDataState());
};
