import { open, save } from "@tauri-apps/plugin-dialog";

export const openScoreFilePath = async () => {
  const path = await open({
    multiple: false,
    directory: false,
    filters: [{ name: "Score File", extensions: ["sch"] }],
  });

  if (path == null || Array.isArray(path)) return null;
  return path;
};

export const saveScoreFilePath = async (extension: string) => {
  const path = await save({
    filters: [{ name: "Score File", extensions: [extension] }],
  });

  if (path == null || Array.isArray(path)) return null;
  return path;
};

export const openMp3FilePath = async () => {
  const path = await open({
    multiple: false,
    directory: false,
    filters: [{ name: "MP3 Files", extensions: ["mp3"] }],
  });

  if (path == null || Array.isArray(path)) return null;
  return path;
};
