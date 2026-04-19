import { get, writable } from "svelte/store";
import StoreArrange from "../../domain/arrange/arrange-store";

export const arrangeDataStore = writable<StoreArrange.DataProps>(StoreArrange.INITIAL);

export const getArrangeDataState = () => get(arrangeDataStore);

export const setArrangeDataState = (arrange: StoreArrange.DataProps) => {
  arrangeDataStore.set(arrange);
};

export const touchArrangeDataState = () => {
  arrangeDataStore.set(getArrangeDataState());
};
