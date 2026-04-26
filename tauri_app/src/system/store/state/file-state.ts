namespace FileState {

    export type Value = {
        score?: Handle
    }

    export const INITIAL: Value = {
    }

    export type Handle = {
        path: string;
        name: string;
    }
}
export default FileState;
