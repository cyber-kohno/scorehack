import type StoreArrange from "../../domain/arrange/arrange-store";
import type { RootStoreToken } from "../root-store";
import {
  getArrangeDataState,
  setArrangeDataState,
} from "../session-state/arrange-data-store";

export const getArrangeData = (
  rootStoreToken: RootStoreToken,
): StoreArrange.DataProps => {
  void rootStoreToken;
  return getArrangeDataState();
};

export const getArrangeTracks = (
  rootStoreToken: RootStoreToken,
): StoreArrange.Track[] => {
  return getArrangeData(rootStoreToken).tracks;
};

export const getArrangeTrack = (
  rootStoreToken: RootStoreToken,
  index: number,
): StoreArrange.Track | undefined => {
  return getArrangeTracks(rootStoreToken)[index];
};

export const setArrangeTracks = (
  rootStoreToken: RootStoreToken,
  tracks: StoreArrange.Track[],
): void => {
  void rootStoreToken;
  getArrangeDataState().tracks = tracks;
  setArrangeDataState(getArrangeDataState());
};
