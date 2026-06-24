import { readUtf8TextFile, writeUtf8TextFile } from "../../infra/tauri/fs";
import TextCompression from "./text-compression";

namespace CompressedJsonFile {
    export type ReadResult<T> =
        | { type: "success"; value: T }
        | { type: "read-error"; error: unknown }
        | { type: "parse-error"; error: unknown };

    export const read = async <T>(path: string): Promise<ReadResult<T>> => {
        let text: string;
        try {
            text = await readUtf8TextFile(path);
        } catch (error) {
            return { type: "read-error", error };
        }

        try {
            return {
                type: "success",
                value: JSON.parse(TextCompression.unzip(text)) as T,
            };
        } catch (error) {
            return { type: "parse-error", error };
        }
    };

    export const write = async (path: string, value: unknown) => {
        await writeUtf8TextFile(path, TextCompression.zip(JSON.stringify(value)));
    };
}

export default CompressedJsonFile;
