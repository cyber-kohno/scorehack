namespace FileState {

    export type Value = {
        score?: Handle
    }

    export const createInitial = (): Value => ({});

    export type Handle = {
        path: string;
        name: string;
    }
}
export default FileState;
