import { get, writable } from "svelte/store";

export type EnvState = {
  beatWidth: number;
};

export const INITIAL_ENV_STATE: EnvState = {
  beatWidth: 120,
};

export const envStore = writable<EnvState>(INITIAL_ENV_STATE);

export const getEnvState = () => get(envStore);

export const getEnvBeatWidth = () => getEnvState().beatWidth;

export const setEnvBeatWidth = (beatWidth: number) => {
  envStore.update((state) => ({
    ...state,
    beatWidth,
  }));
};
