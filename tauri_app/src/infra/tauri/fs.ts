import { readFile, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export const readBinaryFile = async (path: string) => {
  return readFile(path);
};

export const readUtf8TextFile = async (path: string) => {
  return readTextFile(path);
};

export const writeUtf8TextFile = async (path: string, text: string) => {
  await writeTextFile(path, text);
};
