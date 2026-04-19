import type { StoreProps } from "../../system/store/store";
import { setScoreFileHandle } from "../../state/session-state/project-file-store";
import { resetTrackRefGroups } from "../../state/session-state/track-ref-session";
import { openScoreFilePath } from "../../infra/tauri/dialog";
import { readUtf8TextFile } from "../../infra/tauri/fs";
import { createCacheActions } from "../cache/cache-actions";
import { createProjectDataActions } from "../project-data/project-data-actions";
import { getFileName, unzipFromBase64 } from "./project-file-codec";
import type { ProjectIoHandle } from "./save-project";

const toHandle = (path: string): ProjectIoHandle => ({
  path,
  name: getFileName(path),
});

export const loadProject = async (
  lastStore: StoreProps,
  success: (handle: ProjectIoHandle) => void,
  cancel: () => void,
) => {
  const { recalculate } = createCacheActions(lastStore);
  const { setProjectData, getScoreTracks } = createProjectDataActions(lastStore);

  try {
    const path = await openScoreFilePath();
    if (path == null) {
      cancel();
      return;
    }

    const fileContents = await readUtf8TextFile(path);
    const nextHandle = toHandle(path);
    setScoreFileHandle(nextHandle);
    const text = unzipFromBase64(fileContents);
    setProjectData(JSON.parse(text));
    resetTrackRefGroups(getScoreTracks().length);
    recalculate();
    success(nextHandle);
  } catch {
    cancel();
  }
};


