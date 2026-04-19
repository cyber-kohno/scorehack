import type { StoreProps } from "../system/store/store";

export type StoreBoundaryKey =
  | "project-data"
  | "shell-ui"
  | "editor-ui"
  | "cache";

export const STORE_BOUNDARY_MAP: Record<StoreBoundaryKey, (keyof StoreProps)[]> =
  {
    "project-data": ["data"],
    "shell-ui": ["control"],
    "editor-ui": ["control"],
    cache: ["cache"],
  };

export const describeStoreBoundaries = () => {
  return STORE_BOUNDARY_MAP;
};

