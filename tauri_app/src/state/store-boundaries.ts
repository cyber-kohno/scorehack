export type StoreBoundaryKey =
  | "project-data"
  | "shell-ui"
  | "editor-ui"
  | "cache";

export const STORE_BOUNDARY_MAP: Record<StoreBoundaryKey, string[]> = {
  "project-data": ["project-data-store"],
  "shell-ui": ["mode-store", "outline-arrange-store"],
  "editor-ui": [
    "outline-focus-store",
    "outline-track-store",
    "melody-track-store",
    "melody-focus-store",
    "melody-clipboard-store",
    "melody-overlap-store",
    "melody-cursor-store",
  ],
  cache: ["cache-store"],
};

export const describeStoreBoundaries = () => {
  return STORE_BOUNDARY_MAP;
};
