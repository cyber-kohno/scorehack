import { get } from "svelte/store";
import createArrangeSelector from "../../../service/arrange/arrange-selector";
import createDrumArrangeUpdater from "../../../service/arrange/drum/drum-arrange-updater";
import FloatingSelect from "../../../service/common/floating-select-controller";
import ConfirmDialog from "../../../service/common/confirm-dialog-controller";
import Toast from "../../../service/common/toast-controller";
import { createCommitDataAndRecalculate } from "../../../service/derived/recalculate-derived";
import playbackDrumEditor from "../../../service/playback/arrange/playback-drum-editor";
import { controlStore, dataStore, refStore } from "../../../store/global-store";
import DrumEditorState from "../../../store/state/data/arrange/drum/drum-editor-state";
import type FloatingSelectState from "../../../store/state/floating-select-state";
import ToastState from "../../../store/state/toast-state";

const createContext = () => {
    const control = get(controlStore);
    const data = get(dataStore);
    const arrangeSelector = createArrangeSelector({ control, data });
    const arrange = arrangeSelector.getArrange();
    const arrTrack = arrangeSelector.getCurTrack();
    const ref = get(refStore);

    if (arrange.method !== "drum") throw new Error("Drum arrange action requires drum arrange.");
    if (arrTrack.method !== "drum") throw new Error("Drum arrange action requires drum track.");

    const commitData = () => dataStore.set({ ...data });

    return {
        control,
        arrange,
        arrTrack,
        getEditor: arrangeSelector.getDrumEditor,
        ref,
        drumUpdater: createDrumArrangeUpdater({ arrange, track: arrTrack }),
        commitControl: () => controlStore.set({ ...control }),
        commitData,
        commitDataAndRecalculate: createCommitDataAndRecalculate(commitData),
    };
};

const createDrumArrangeActions = () => {
    const playbackPattern = () => {
        const result = playbackDrumEditor();
        if (result.ok || result.reason !== "inst-not-set") return;

        Toast.create({
            ...ToastState.createInitial(),
            x: 24,
            y: 84,
            width: 300,
            text: "Instrument is not assigned.",
        });
    };

    const getMappingDisplay = (mapping: DrumEditorState.Mapping) => {
        return mapping.name ?? mapping.key;
    };

    const updateControl = (
        update: (updater: ReturnType<typeof createDrumArrangeUpdater>) => void | boolean,
    ) => {
        return () => {
            const ctx = createContext();
            const result = update(ctx.drumUpdater);
            if (result === false) return;

            ctx.commitControl();
        };
    };

    const updateControlWithArg = <T>(
        update: (updater: ReturnType<typeof createDrumArrangeUpdater>, arg: T) => void | boolean,
    ) => {
        return (arg: T) => {
            const ctx = createContext();
            const result = update(ctx.drumUpdater, arg);
            if (result === false) return;

            ctx.commitControl();
        };
    };

    const shiftControl = updateControlWithArg<DrumEditorState.Control>((updater, next) => {
        updater.shiftControl(next);
    });

    const isCriteriaDiv = (value: number): value is DrumEditorState.CriteriaDiv => {
        return value === 1 || value === 2 || value === 3 || value === 4 || value === 6;
    };

    const applyCriteriaDiv = (div: DrumEditorState.CriteriaDiv) => {
        const ctx = createContext();
        ctx.drumUpdater.applyCriteriaDiv(div);
        ctx.commitControl();
    };

    const setCriteriaDiv = (div: DrumEditorState.CriteriaDiv) => {
        const ctx = createContext();
        const editor = ctx.getEditor();
        if (editor.criteriaDiv === div) return;

        const hasPatternData = editor.colDivs.length > 0 || editor.hits.length > 0;
        if (!hasPatternData) {
            applyCriteriaDiv(div);
            return;
        }

        ConfirmDialog.open({
            tone: "danger",
            title: "Change Criteria",
            messageLines: [
                "Changing criteria will remove column splits and hits.",
                "Continue?",
            ],
            choices: [
                {
                    label: "Change",
                    role: "proceed",
                    callback: () => applyCriteriaDiv(div),
                },
            ],
        });
    };

    const isSplitDiv = (value: number): value is DrumEditorState.SplitDiv => {
        return value === 2 || value === 3 || value === 4;
    };

    const getColSplitDivs = (
        criteriaDiv: DrumEditorState.CriteriaDiv,
        tsUnit: number,
    ): DrumEditorState.SplitDiv[] => {
        if (criteriaDiv === 6 || criteriaDiv === 4) return [];
        if (tsUnit === 8 && criteriaDiv === 1) return [3];
        if (criteriaDiv === 1) return [2, 3, 4];
        if (criteriaDiv === 2 || criteriaDiv === 3) return [2, 3];
        return [];
    };

    const openCriteriaDivSelect = () => {
        const ctx = createContext();
        const editor = ctx.getEditor();
        if (editor.control !== "criteria") return;

        const criteriaRef = ctx.ref.arrange.drum.criteria;
        if (criteriaRef == undefined) return;

        const ts = ctx.arrange.target.scoreBase.rhythm.ts;
        const minDiv = DrumEditorState.getMinCriteriaDiv(ctx.arrange.target.beat, ts);
        const effectiveDiv = DrumEditorState.getEffectiveCriteriaDiv(
            editor.criteriaDiv,
            ctx.arrange.target.beat,
            ts,
        );
        const rect = criteriaRef.getBoundingClientRect();
        FloatingSelect.open({
            value: String(effectiveDiv),
            filter: "",
            cursor: 0,
            focusIndex: 0,
            left: rect.left,
            top: rect.bottom + 6,
            width: Math.max(120, rect.width),
            height: 104,
            items: DrumEditorState.getAvailableCriteriaDivs(ts).map((div) => ({
                value: String(div),
                label: DrumEditorState.getCriteriaDivLabel(div, ts),
                disabled: div < minDiv,
            })),
            apply: value => {
                const div = Number(value);
                if (!isCriteriaDiv(div)) return;
                setCriteriaDiv(div);
            },
        });
    };

    const moveRecordCursor = updateControlWithArg<-1 | 1>((updater, dir) => {
        return updater.moveRecordCursor(dir);
    });

    const moveColCursor = updateControlWithArg<-1 | 1>((updater, dir) => {
        return updater.moveColCursor(dir);
    });

    const movePatternColCursor = updateControlWithArg<-1 | 1>((updater, dir) => {
        return updater.movePatternColCursor(dir);
    });

    const movePatternRecordCursor = updateControlWithArg<-1 | 1>((updater, dir) => {
        return updater.movePatternRecordCursor(dir);
    });

    const moveFinderPattern = (dir: -1 | 1 | -3 | 3) => {
        const ctx = createContext();
        const moved = ctx.drumUpdater.moveFinderPattern(dir);
        if (!moved) return;

        ctx.commitControl();
        const frame = ctx.ref.arrange.finder.frame;
        if (frame == undefined) return;

        const finder = ctx.arrange.finder;
        if (finder == undefined) return;
        const rect = frame.getClientRects()[0];
        if (rect == undefined) return;
        const rowIndex = Math.floor(finder.cursor / 3);
        frame.scrollTo({
            top: Math.max(0, -rect.width / 2 + rowIndex * 71),
            behavior: "smooth",
        });
    };

    const openFinderFromEditor = () => {
        const ctx = createContext();
        if (ctx.arrange.origin.type === "library") return;

        ctx.drumUpdater.openFinderFromEditor();
        ctx.commitControl();
    };

    const toggleHit = updateControl(updater => {
        return updater.toggleHit();
    });

    const modifyHitVelocity = updateControlWithArg<-1 | 1>((updater, dir) => {
        return updater.modifyHitVelocity(dir);
    });

    const setColDiv = (
        colIndex: number,
        div: DrumEditorState.SplitDiv | undefined,
    ) => {
        const ctx = createContext();
        const result = ctx.drumUpdater.setColDiv(colIndex, div);
        if (result === false) return;

        ctx.commitControl();
    };

    const openColDivSelect = () => {
        const ctx = createContext();
        const editor = ctx.getEditor();
        if (editor.control !== "col") return;

        const criteriaDiv = DrumEditorState.getEffectiveCriteriaDiv(
            editor.criteriaDiv,
            ctx.arrange.target.beat,
            ctx.arrange.target.scoreBase.rhythm.ts,
        );
        const splitDivs = getColSplitDivs(
            criteriaDiv,
            ctx.arrange.target.scoreBase.rhythm.ts.unit,
        );
        if (splitDivs.length === 0) return;

        const colRef = ctx.ref.arrange.drum.cols.find(item => (
            item.colIndex === editor.cursorX
        ))?.ref;
        if (colRef == undefined) return;

        const current = editor.colDivs.find(item => item.index === editor.cursorX);
        const rect = colRef.getBoundingClientRect();
        FloatingSelect.open({
            value: current == undefined ? "" : String(current.div),
            filter: "",
            cursor: 0,
            focusIndex: 0,
            left: rect.left,
            top: rect.bottom + 6,
            width: Math.max(96, rect.width),
            height: 128,
            items: [
                { value: "", label: "-" },
                ...splitDivs.map((div) => ({
                    value: String(div),
                    label: String(div),
                })),
            ],
            apply: value => {
                if (value === "") {
                    setColDiv(editor.cursorX, undefined);
                    return;
                }

                const div = Number(value);
                if (!isSplitDiv(div)) return;
                setColDiv(editor.cursorX, div);
            },
        });
    };

    const insertRecord = updateControl(updater => {
        return updater.insertRecord();
    });

    const deleteRecord = updateControl(updater => {
        return updater.deleteRecord();
    });

    const swapRecord = updateControlWithArg<-1 | 1>((updater, dir) => {
        return updater.swapRecord(dir);
    });

    const setRecordKey = (recordIndex: number, key: string) => {
        const ctx = createContext();
        const result = ctx.drumUpdater.setRecordKey(recordIndex, key);
        if (result === false) return;

        ctx.commitControl();
    };

    const registerCurrentPattern = () => {
        const ctx = createContext();
        const result = ctx.drumUpdater.registerCurrentPattern();
        ctx.commitData();
        return result;
    };

    const applyArrange = () => {
        const ctx = createContext();
        const result = (() => {
            switch (ctx.arrange.origin.type) {
                case "chord-block":
                    return ctx.drumUpdater.applyArrange();
                case "library":
                    return ctx.drumUpdater.applyLibrary();
            }
        })();
        console.log("[drum arrange] pattern registered", result);
        ctx.control.outline.arrange = null;
        ctx.commitDataAndRecalculate();
        ctx.commitControl();
        return result;
    };

    const applyFinderPattern = () => {
        const ctx = createContext();
        const result = ctx.drumUpdater.applyFinderPattern();

        if (result.closeArrange) ctx.control.outline.arrange = null;
        if (result.data) ctx.commitDataAndRecalculate();
        if (result.control) ctx.commitControl();
    };

    const createRecordKeyItems = (
        editor: DrumEditorState.Value,
        mappings: DrumEditorState.Mapping[],
    ): FloatingSelectState.Item[] => {
        const usedKeys = new Set(editor.records
            .filter((_, index) => index !== editor.cursorY)
            .map(record => record.key)
            .filter(key => key !== ""));

        return [
            { value: "", label: "" },
            ...mappings.map((mapping) => ({
                value: mapping.key,
                label: getMappingDisplay(mapping),
                disabled: usedKeys.has(mapping.key),
            })),
        ];
    };

    const openRecordKeySelect = () => {
        const ctx = createContext();
        const editor = ctx.getEditor();
        const recordIndex = editor.cursorY;
        if (editor.control !== "record") return;
        if (recordIndex < 0) return;

        const record = editor.records[recordIndex];
        if (record == undefined) return;

        const recordRef = ctx.ref.arrange.drum.records.find((item) => (
            item.recordIndex === recordIndex
        ))?.ref;
        if (recordRef == undefined) return;

        const rect = recordRef.getBoundingClientRect();
        FloatingSelect.open({
            value: record.key,
            filter: "",
            cursor: 0,
            focusIndex: 0,
            left: rect.left,
            top: rect.bottom + 6,
            width: Math.max(160, rect.width),
            height: 220,
            items: createRecordKeyItems(editor, ctx.arrTrack.bank.mappings),
            apply: value => setRecordKey(recordIndex, value),
        });
    };

    return {
        applyArrange,
        applyFinderPattern,
        deleteRecord,
        insertRecord,
        moveFinderPattern,
        moveColCursor,
        movePatternColCursor,
        movePatternRecordCursor,
        moveRecordCursor,
        modifyHitVelocity,
        openCriteriaDivSelect,
        openColDivSelect,
        openFinderFromEditor,
        openRecordKeySelect,
        playbackPattern,
        registerCurrentPattern,
        shiftControl,
        swapRecord,
        toggleHit,
    };
};

export default createDrumArrangeActions;
