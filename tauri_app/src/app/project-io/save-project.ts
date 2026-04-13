import type ProjectFileStore from "../../state/session-state/project-file-store";
import type { StoreProps } from "../../system/store/store";
import { saveScoreFilePath } from "../../infra/tauri/dialog";
import { writeUtf8TextFile } from "../../infra/tauri/fs";
import { getFileName, gzipToBase64 } from "./project-file-codec";

export type ProjectIoHandle = ProjectFileStore.Handle;

export interface ProjectIoCallbacks {
  success: (handle: ProjectIoHandle) => void;
  cancel: () => void;
  error: (message: string) => void;
}

const toHandle = (path: string): ProjectIoHandle => ({
  path,
  name: getFileName(path),
});

export const saveProject = async (
  lastStore: StoreProps,
  plainData: string,
  extension: string,
  callbacks: ProjectIoCallbacks,
) => {
  const fileHandle = lastStore.fileHandle;

  try {
    if (fileHandle.score) {
      await writeUtf8TextFile(fileHandle.score.path, gzipToBase64(plainData));
      callbacks.success(fileHandle.score);
      return;
    }

    const path = await saveScoreFilePath(extension);
    if (path == null) {
      callbacks.cancel();
      return;
    }

    await writeUtf8TextFile(path, gzipToBase64(plainData));
    fileHandle.score = toHandle(path);
    callbacks.success(fileHandle.score);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    callbacks.error(message);
  }
};
