import type { StoreProps } from "../system/store/store";

export type StoreBoundaryKey =
  | "project-data"
  | "shell-ui"
  | "editor-ui"
  | "session"
  | "cache"
  | "refs";

export const STORE_BOUNDARY_MAP: Record<StoreBoundaryKey, (keyof StoreProps)[]> =
  {
    "project-data": ["data"],
    "shell-ui": ["control", "terminal"],
    "editor-ui": ["control", "env"],
    session: ["input", "holdCallbacks", "preview", "fileHandle"],
    cache: ["cache"],
    refs: ["ref"],
  };

export const describeStoreBoundaries = () => {
  return STORE_BOUNDARY_MAP;
};
