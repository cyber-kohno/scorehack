import useReducerCache from "../../system/store/reducer/reducerCache";
import type { StoreProps } from "../../system/store/store";
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
  const fileHandle = lastStore.fileHandle;
  const { recalculate } = createCacheActions(lastStore);
  const { setProjectData, getScoreTracks } = createProjectDataActions(lastStore);

  try {
    const path = await openScoreFilePath();
    if (path == null) {
      cancel();
      return;
    }

    const fileContents = await readUtf8TextFile(path);
    fileHandle.score = toHandle(path);
    const text = unzipFromBase64(fileContents);
    setProjectData(JSON.parse(text));
    lastStore.ref.trackArr.length = 0;
    for (let i = 0; i < getScoreTracks().length; i++) {
      lastStore.ref.trackArr.push([]);
    }
    recalculate();
    success(fileHandle.score);
  } catch {
    cancel();
  }
};

