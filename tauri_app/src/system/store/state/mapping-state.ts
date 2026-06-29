namespace MappingState {
    export type Column = "key" | "display" | "sound" | "mark";

    export const Columns: Column[] = ["key", "display", "sound", "mark"];

    export type Value = {
        focus: {
            recordIndex: number;
            column: Column;
        };
    };

    export const createInitial = (recordCount = 0): Value => ({
        focus: {
            recordIndex: recordCount === 0 ? -1 : 0,
            column: "key",
        },
    });
}

export default MappingState;
