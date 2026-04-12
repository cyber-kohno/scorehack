import type StoreMelody from "../../system/store/props/storeMelody";
import { openMp3FilePath } from "../../infra/tauri/dialog";
import { readBinaryFile } from "../../infra/tauri/fs";
import { getFileName, uint8ArrayToBase64 } from "./project-file-codec";
import type { ProjectIoHandle } from "./save-project";

const toHandle = (path: string): ProjectIoHandle => ({
  path,
  name: getFileName(path),
});

export const importAudio = async (
  track: StoreMelody.AudioTrack,
  success: (handle: ProjectIoHandle) => void,
  cancel: () => void,
) => {
  try {
    const path = await openMp3FilePath();
    if (path == null) {
      cancel();
      return;
    }

    const fileBytes = await readBinaryFile(path);
    track.fileName = getFileName(path);
    track.source = uint8ArrayToBase64(fileBytes);
    success(toHandle(path));
  } catch (error) {
    console.error("Failed to load audio file:", error);
    cancel();
  }
};
