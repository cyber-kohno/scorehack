import type { ProjectFileHandle } from "../../state/session-state/project-file-store";
import {
  getScoreFileHandle,
  setScoreFileHandle,
} from "../../state/session-state/project-file-store";
import type { RootStoreToken } from "../../state/root-store";
import { saveScoreFilePath } from "../../infra/tauri/dialog";
import { writeUtf8TextFile } from "../../infra/tauri/fs";
import { getFileName, gzipToBase64 } from "./project-file-codec";

export type ProjectIoHandle = ProjectFileHandle;

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
  rootStoreToken: RootStoreToken,
  plainData: string,
  extension: string,
  callbacks: ProjectIoCallbacks,
) => {
  void rootStoreToken;
  try {
    const scoreHandle = getScoreFileHandle();
    if (scoreHandle) {
      await writeUtf8TextFile(scoreHandle.path, gzipToBase64(plainData));
      callbacks.success(scoreHandle);
      return;
    }

    const path = await saveScoreFilePath(extension);
    if (path == null) {
      callbacks.cancel();
      return;
    }

    await writeUtf8TextFile(path, gzipToBase64(plainData));
    const nextHandle = toHandle(path);
    setScoreFileHandle(nextHandle);
    callbacks.success(nextHandle);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    callbacks.error(message);
  }
};
