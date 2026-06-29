import { get } from "svelte/store";
import TonalityTheory from "../../domain/theory/tonality-theory";
import ScoreHistory from "../../infra/tauri/history/score-history";
import FloatingSelect from "../../service/common/floating-select-controller";
import FloatingTextInput from "../../service/common/floating-text-input-controller";
import Toast from "../../service/common/toast-controller";
import previewArrangeNote from "../../service/playback/arrange/preview-arrange-note";
import { actionMenuStore, confirmDialogStore, controlStore, dataStore, floatingSelectStore, floatingTextInputStore, inputStore, mappingStore, refStore } from "../../store/global-store";
import type FloatingSelectState from "../../store/state/floating-select-state";
import InputState from "../../store/state/input-state";
import MappingState from "../../store/state/mapping-state";
import ToastState from "../../store/state/toast-state";
import DrumEditorState from "../../store/state/data/arrange/drum/drum-editor-state";

const createMappingActions = () => {
    const createContext = () => {
        const data = get(dataStore);
        const control = get(controlStore);
        const mapping = get(mappingStore);
        const ref = get(refStore);

        const commitData = () => {
            dataStore.set({ ...data });
            ScoreHistory.add();
        };

        const commitMapping = () => {
            if (mapping == null) return;
            mappingStore.set({ ...mapping });
        };

        return {
            control,
            data,
            mapping,
            ref,
            commitData,
            commitMapping,
        };
    };

    const getActiveDrumTrack = (ctx: ReturnType<typeof createContext>) => {
        const track = ctx.data.arrange.tracks[ctx.control.outline.trackIndex];
        return track?.method === "drum" ? track : undefined;
    };

    const syncFocus = (
        mapping: MappingState.Value,
        recordCount: number,
    ) => {
        if (recordCount === 0) {
            mapping.focus.recordIndex = -1;
            return;
        }

        if (mapping.focus.recordIndex === -1) {
            mapping.focus.recordIndex = 0;
            return;
        }

        mapping.focus.recordIndex = Math.max(
            0,
            Math.min(mapping.focus.recordIndex, recordCount - 1),
        );
    };

    const getFocusCellRect = (ctx: ReturnType<typeof createContext>) => {
        const mapping = ctx.mapping;
        if (mapping == null) return null;

        const cellRef = ctx.ref.library.mapping.cells.find(cell => {
            return cell.recordIndex === mapping.focus.recordIndex &&
                cell.column === mapping.focus.column;
        })?.ref;
        return cellRef?.getBoundingClientRect() ?? null;
    };

    const showFocusToast = (
        ctx: ReturnType<typeof createContext>,
        text: string,
        width = 300,
    ) => {
        const rect = getFocusCellRect(ctx);
        Toast.create({
            ...ToastState.createInitial(),
            x: rect?.left ?? 24,
            y: rect == null ? 84 : rect.bottom + 8,
            width,
            text,
        });
    };

    const open = () => {
        const ctx = createContext();
        const track = getActiveDrumTrack(ctx);
        if (track == undefined) return;

        actionMenuStore.set(null);
        confirmDialogStore.set(null);
        floatingSelectStore.set(null);
        floatingTextInputStore.set(null);
        mappingStore.set(MappingState.createInitial(track.bank.mappings.length));
    };

    const close = () => {
        floatingSelectStore.set(null);
        mappingStore.set(null);
        inputStore.set(InputState.createInitial());
    };

    const moveRecord = (dir: -1 | 1) => {
        const ctx = createContext();
        const mapping = ctx.mapping;
        const track = getActiveDrumTrack(ctx);
        if (mapping == null || track == undefined) return;

        const recordCount = track.bank.mappings.length;
        if (recordCount === 0) {
            mapping.focus.recordIndex = -1;
            ctx.commitMapping();
            return;
        }

        const current = mapping.focus.recordIndex === -1 ? 0 : mapping.focus.recordIndex;
        mapping.focus.recordIndex = Math.max(0, Math.min(current + dir, recordCount - 1));
        ctx.commitMapping();
    };

    const moveColumn = (dir: -1 | 1) => {
        const ctx = createContext();
        const mapping = ctx.mapping;
        if (mapping == null) return;

        const index = MappingState.Columns.indexOf(mapping.focus.column);
        const next = index + dir;
        if (next < 0 || next > MappingState.Columns.length - 1) return;

        mapping.focus.column = MappingState.Columns[next];
        ctx.commitMapping();
    };

    const addRecord = () => {
        const ctx = createContext();
        const mapping = ctx.mapping;
        const track = getActiveDrumTrack(ctx);
        if (mapping == null || track == undefined) return;

        const createDefaultKey = () => {
            const usedKeys = new Set(track.bank.mappings.map(item => item.key));
            for (let index = 0; ; index++) {
                const key = `key${index}`;
                if (!usedKeys.has(key)) return key;
            }
        };

        const insertIndex = mapping.focus.recordIndex === -1
            ? 0
            : mapping.focus.recordIndex + 1;
        track.bank.mappings.splice(insertIndex, 0, {
            key: createDefaultKey(),
            pitch: -1,
            markKind: DrumEditorState.DefaultMarkKind,
        });
        mapping.focus.recordIndex = insertIndex;
        ctx.commitData();
        ctx.commitMapping();
    };

    const deleteRecord = () => {
        const ctx = createContext();
        const mapping = ctx.mapping;
        const track = getActiveDrumTrack(ctx);
        if (mapping == null || track == undefined) return;

        const recordIndex = mapping.focus.recordIndex;
        if (recordIndex < 0 || recordIndex > track.bank.mappings.length - 1) return;

        track.bank.mappings.splice(recordIndex, 1);
        mapping.focus.recordIndex = recordIndex === 0
            ? 0
            : recordIndex - 1;
        syncFocus(mapping, track.bank.mappings.length);
        ctx.commitData();
        ctx.commitMapping();
    };

    const swapRecord = (dir: -1 | 1) => {
        const ctx = createContext();
        const mapping = ctx.mapping;
        const track = getActiveDrumTrack(ctx);
        if (mapping == null || track == undefined) return;

        const index = mapping.focus.recordIndex;
        const next = index + dir;
        if (index < 0 || next < 0 || next > track.bank.mappings.length - 1) return;

        const currentRecord = track.bank.mappings[index];
        const nextRecord = track.bank.mappings[next];
        if (currentRecord == undefined || nextRecord == undefined) return;

        track.bank.mappings[index] = nextRecord;
        track.bank.mappings[next] = currentRecord;
        mapping.focus.recordIndex = next;
        ctx.commitData();
        ctx.commitMapping();
    };

    const setKey = (recordIndex: number, value: string) => {
        const ctx = createContext();
        const track = getActiveDrumTrack(ctx);
        if (track == undefined) return;

        const record = track.bank.mappings[recordIndex];
        if (record == undefined) return;
        if (track.bank.mappings.some((item, index) => {
            return index !== recordIndex && item.key === value;
        })) return;

        record.key = value;
        ctx.commitData();
    };

    const isValidKey = (
        value: string,
        recordIndex: number,
        mappings: { key: string }[],
    ) => {
        if (!/^[A-Za-z0-9-]{1,12}$/.test(value)) return false;
        return mappings.every((item, index) => {
            return index === recordIndex || item.key !== value;
        });
    };

    const openKeyInput = () => {
        const ctx = createContext();
        const mapping = ctx.mapping;
        const track = getActiveDrumTrack(ctx);
        if (mapping == null || track == undefined) return;
        if (mapping.focus.column !== "key") return;

        const recordIndex = mapping.focus.recordIndex;
        const record = track.bank.mappings[recordIndex];
        if (record == undefined) return;

        const cellRef = ctx.ref.library.mapping.cells.find(cell => {
            return cell.recordIndex === recordIndex && cell.column === "key";
        })?.ref;
        if (cellRef == undefined) return;

        const rect = cellRef.getBoundingClientRect();
        FloatingTextInput.open({
            value: record.key,
            cursor: record.key.length,
            left: rect.left,
            top: rect.bottom + 6,
            width: Math.max(120, rect.width),
            permit: value => isValidKey(value, recordIndex, track.bank.mappings),
            apply: value => setKey(recordIndex, value),
        });
    };

    const setDisplay = (recordIndex: number, value: string) => {
        const ctx = createContext();
        const track = getActiveDrumTrack(ctx);
        if (track == undefined) return;

        const record = track.bank.mappings[recordIndex];
        if (record == undefined) return;

        const name = value.trim();
        if (name.length === 0) delete record.name;
        else record.name = name;
        ctx.commitData();
    };

    const openDisplayInput = () => {
        const ctx = createContext();
        const mapping = ctx.mapping;
        const track = getActiveDrumTrack(ctx);
        if (mapping == null || track == undefined) return;
        if (mapping.focus.column !== "display") return;

        const recordIndex = mapping.focus.recordIndex;
        const record = track.bank.mappings[recordIndex];
        if (record == undefined) return;

        const cellRef = ctx.ref.library.mapping.cells.find(cell => {
            return cell.recordIndex === recordIndex && cell.column === "display";
        })?.ref;
        if (cellRef == undefined) return;

        const value = record.name ?? "";
        const rect = cellRef.getBoundingClientRect();
        FloatingTextInput.open({
            value,
            cursor: value.length,
            left: rect.left,
            top: rect.bottom + 6,
            width: Math.max(160, rect.width),
            permit: value => value.length <= 24,
            apply: value => setDisplay(recordIndex, value),
        });
    };

    const setPitch = (recordIndex: number, pitch: number) => {
        const ctx = createContext();
        const track = getActiveDrumTrack(ctx);
        if (track == undefined) return;

        const record = track.bank.mappings[recordIndex];
        if (record == undefined) return;
        if (pitch !== -1 && track.bank.mappings.some((item, index) => {
            return index !== recordIndex && item.pitch === pitch;
        })) return;

        record.pitch = pitch;
        ctx.commitData();
    };

    const createPitchItems = (
        recordIndex: number,
        mappings: { pitch: number }[],
    ): FloatingSelectState.Item[] => {
        const usedPitches = new Set(mappings
            .filter((_, index) => index !== recordIndex)
            .map(item => item.pitch)
            .filter(pitch => pitch !== -1));

        const items: FloatingSelectState.Item[] = [{
            value: "-1",
            label: "",
        }];

        for (let pitch = 0; pitch <= 127; pitch++) {
            items.push({
                value: String(pitch),
                label: TonalityTheory.getKey12FullName(pitch),
                disabled: usedPitches.has(pitch),
            });
        }

        return items;
    };

    const openSoundInput = () => {
        const ctx = createContext();
        const mapping = ctx.mapping;
        const track = getActiveDrumTrack(ctx);
        if (mapping == null || track == undefined) return;
        if (mapping.focus.column !== "sound") return;

        const recordIndex = mapping.focus.recordIndex;
        const record = track.bank.mappings[recordIndex];
        if (record == undefined) return;

        const cellRef = ctx.ref.library.mapping.cells.find(cell => {
            return cell.recordIndex === recordIndex && cell.column === "sound";
        })?.ref;
        if (cellRef == undefined) return;

        const rect = cellRef.getBoundingClientRect();
        FloatingSelect.open({
            value: String(record.pitch),
            filter: "",
            cursor: 0,
            focusIndex: 0,
            left: rect.left,
            top: rect.bottom + 6,
            width: Math.max(120, rect.width),
            height: 220,
            items: createPitchItems(recordIndex, track.bank.mappings),
            apply: value => {
                const pitch = Number(value);
                if (!Number.isInteger(pitch)) return;
                setPitch(recordIndex, pitch);
            },
        });
    };

    const setMarkKind = (
        recordIndex: number,
        markKind: DrumEditorState.MarkKind,
    ) => {
        const ctx = createContext();
        const track = getActiveDrumTrack(ctx);
        if (track == undefined) return;

        const record = track.bank.mappings[recordIndex];
        if (record == undefined) return;
        if (!DrumEditorState.MarkKinds.includes(markKind)) return;

        record.markKind = markKind;
        ctx.commitData();
    };

    const openMarkKindSelect = () => {
        const ctx = createContext();
        const mapping = ctx.mapping;
        const track = getActiveDrumTrack(ctx);
        if (mapping == null || track == undefined) return;
        if (mapping.focus.column !== "mark") return;

        const recordIndex = mapping.focus.recordIndex;
        const record = track.bank.mappings[recordIndex];
        if (record == undefined) return;

        const cellRef = ctx.ref.library.mapping.cells.find(cell => {
            return cell.recordIndex === recordIndex && cell.column === "mark";
        })?.ref;
        if (cellRef == undefined) return;

        const rect = cellRef.getBoundingClientRect();
        FloatingSelect.open({
            value: record.markKind ?? DrumEditorState.DefaultMarkKind,
            filter: "",
            cursor: 0,
            focusIndex: 0,
            left: rect.left,
            top: rect.bottom + 6,
            width: Math.max(150, rect.width),
            height: 180,
            items: DrumEditorState.MarkKinds.map(markKind => ({
                value: markKind,
                label: markKind,
            })),
            apply: value => {
                if (!DrumEditorState.MarkKinds.includes(value as DrumEditorState.MarkKind)) return;
                setMarkKind(recordIndex, value as DrumEditorState.MarkKind);
            },
        });
    };

    const previewSound = () => {
        const ctx = createContext();
        const mapping = ctx.mapping;
        const track = getActiveDrumTrack(ctx);
        if (mapping == null || track == undefined) return;

        const record = track.bank.mappings[mapping.focus.recordIndex];
        if (record == undefined) return;

        if (record.pitch === -1) {
            showFocusToast(ctx, "Sound is not assigned.");
            return;
        }

        if (track.instRef == undefined) {
            showFocusToast(ctx, "Instrument is not assigned.");
            return;
        }

        previewArrangeNote(track, record.pitch);
    };

    return {
        addRecord,
        close,
        deleteRecord,
        moveColumn,
        moveRecord,
        openDisplayInput,
        openKeyInput,
        openMarkKindSelect,
        openSoundInput,
        open,
        previewSound,
        swapRecord,
    };
};

export default createMappingActions;
