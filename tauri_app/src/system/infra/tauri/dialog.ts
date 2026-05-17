import { open, save } from "@tauri-apps/plugin-dialog";

export const openScoreFilePath = async (defaultDirectory?: string) => {
  const path = await open({
    multiple: false,
    directory: false,
    defaultPath: defaultDirectory === "" ? undefined : defaultDirectory,
    filters: [{ name: "Score File", extensions: ["sch"] }],
  });

  if (path == null || Array.isArray(path)) return null;
  return path;
};

export const saveScoreFilePath = async (extension: string, defaultDirectory?: string) => {
  const path = await save({
    defaultPath: defaultDirectory === "" ? undefined : defaultDirectory,
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

export const openDirectoryPath = async (defaultPath?: string, recursive = false) => {
  const path = await open({
    multiple: false,
    directory: true,
    recursive,
    defaultPath: defaultPath === "" ? undefined : defaultPath,
  });

  if (path == null || Array.isArray(path)) return null;
  return path;
};

export const openSoundFontFilePath = async (defaultDirectory?: string) => {
  const path = await open({
    multiple: false,
    directory: false,
    defaultPath: defaultDirectory === "" ? undefined : defaultDirectory,
    filters: [{ name: "SoundFont Files", extensions: ["sf2", "sf3"] }],
  });

  if (path == null || Array.isArray(path)) return null;
  return path;
};
