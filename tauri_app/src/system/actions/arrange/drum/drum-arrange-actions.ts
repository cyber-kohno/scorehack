import { get } from "svelte/store";
import createArrangeSelector from "../../../service/arrange/arrange-selector";
import Layout from "../../../layout/layout-constant";
import FloatingSelect from "../../../service/common/floating-select-controller";
import { controlStore, dataStore, refStore } from "../../../store/global-store";
import DrumEditorState from "../../../store/state/data/arrange/drum/drum-editor-state";
import type FloatingSelectState from "../../../store/state/floating-select-state";

const createContext = () => {
    const control = get(controlStore);
    const data = get(dataStore);
    const arrangeSelector = createArrangeSelector({ control, data });
    const arrange = arrangeSelector.getArrange();
    const arrTrack = arrangeSelector.getCurTrack();
    const ref = get(refStore);

    if (arrange.method !== "drum") throw new Error("Drum arrange action requires drum arrange.");
    if (arrTrack.method !== "drum") throw new Error("Drum arrange action requires drum track.");

    return {
        arrange,
        arrTrack,
        editor: arrangeSelector.getDrumEditor(),
        ref,
        commitControl: () => controlStore.set({ ...control }),
    };
};

const createDrumArrangeActions = () => {
    const getMappingDisplay = (mapping: DrumEditorState.Mapping) => {
        return mapping.name ?? mapping.key;
    };

    const updateControl = (update: (editor: DrumEditorState.Value) => void | boolean) => {
        const ctx = createContext();
        const result = update(ctx.editor);
        if (result === false) return;

        ctx.commitControl();
    };

    const shiftControl = (next: DrumEditorState.Control) => {
        const ctx = createContext();
        ctx.editor.control = next;
        if ((next === "record" || next === "hits") && ctx.editor.cursorY < 0 && ctx.editor.records.length > 0) {
            ctx.editor.cursorY = 0;
        }
        ctx.commitControl();
    };

    const isCriteriaDiv = (value: number): value is DrumEditorState.CriteriaDiv => {
        return value === 1 || value === 2 || value === 3 || value === 4 || value === 6;
    };

    const setCriteriaDiv = (div: DrumEditorState.CriteriaDiv) => {
        updateControl((editor) => {
            editor.criteriaDiv = div;
            return true;
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
        if (ctx.editor.control !== "criteria") return;

        const criteriaRef = ctx.ref.arrange.drum.criteria;
        if (criteriaRef == undefined) return;

        const ts = ctx.arrange.target.scoreBase.rhythm.ts;
        const minDiv = DrumEditorState.getMinCriteriaDiv(ctx.arrange.target.beat, ts);
        const effectiveDiv = DrumEditorState.getEffectiveCriteriaDiv(
            ctx.editor.criteriaDiv,
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

    const moveRecordCursor = (dir: -1 | 1) => {
        updateControl((editor) => {
            const next = editor.cursorY + dir;
            if (next < 0 || next > editor.records.length - 1) return false;

            editor.cursorY = next;
            return true;
        });
    };

    const moveColCursor = (dir: -1 | 1) => {
        const ctx = createContext();
        const criteriaDiv = DrumEditorState.getEffectiveCriteriaDiv(
            ctx.editor.criteriaDiv,
            ctx.arrange.target.beat,
            ctx.arrange.target.scoreBase.rhythm.ts,
        );
        const colCount = DrumEditorState.getColumnCount(
            criteriaDiv,
            ctx.arrange.target.beat,
            ctx.arrange.target.scoreBase.rhythm.ts,
        );
        const next = ctx.editor.cursorX + dir;
        if (next < 0 || next > colCount - 1) return;

        ctx.editor.cursorX = next;
        ctx.commitControl();
    };

    const getPatternColCount = (
        editor: DrumEditorState.Value,
        colCount: number,
    ) => {
        return Array.from({ length: colCount }, (_, index) => {
            return editor.colDivs.find(item => item.index === index)?.div ?? 1;
        }).reduce((sum, div) => sum + div, 0);
    };

    const getBaseColRanges = (
        colDivs: DrumEditorState.ColDiv[],
        colCount: number,
    ) => {
        let start = 0;
        return Array.from({ length: colCount }, (_, index) => {
            const div = colDivs.find(item => item.index === index)?.div ?? 1;
            const range = { index, start, div };
            start += div;
            return range;
        });
    };

    const getBaseColByHitIndex = (
        ranges: ReturnType<typeof getBaseColRanges>,
        colIndex: number,
    ) => {
        return ranges.find((range) => (
            range.start <= colIndex && colIndex < range.start + range.div
        ));
    };

    const adjustHitsForColDivChange = (
        editor: DrumEditorState.Value,
        targetIndex: number,
        prevColDivs: DrumEditorState.ColDiv[],
        nextColDivs: DrumEditorState.ColDiv[],
        colCount: number,
    ) => {
        const prevRanges = getBaseColRanges(prevColDivs, colCount);
        const nextRanges = getBaseColRanges(nextColDivs, colCount);
        const nextHits: DrumEditorState.Hit[] = [];

        editor.hits.forEach((hit) => {
            const prevRange = getBaseColByHitIndex(prevRanges, hit.colIndex);
            if (prevRange == undefined) return;

            const nextRange = nextRanges[prevRange.index];
            if (nextRange == undefined) return;

            const localIndex = hit.colIndex - prevRange.start;
            if (prevRange.index === targetIndex && localIndex > 0) return;
            if (localIndex > nextRange.div - 1) return;

            nextHits.push({
                ...hit,
                colIndex: nextRange.start + localIndex,
            });
        });

        editor.hits = nextHits;
    };

    const movePatternColCursor = (dir: -1 | 1) => {
        const ctx = createContext();
        const criteriaDiv = DrumEditorState.getEffectiveCriteriaDiv(
            ctx.editor.criteriaDiv,
            ctx.arrange.target.beat,
            ctx.arrange.target.scoreBase.rhythm.ts,
        );
        const colCount = DrumEditorState.getColumnCount(
            criteriaDiv,
            ctx.arrange.target.beat,
            ctx.arrange.target.scoreBase.rhythm.ts,
        );
        const patternColCount = getPatternColCount(ctx.editor, colCount);
        const next = ctx.editor.cursorX + dir;
        if (next < 0 || next > patternColCount - 1) return;

        ctx.editor.cursorX = next;
        ctx.commitControl();
    };

    const movePatternRecordCursor = (dir: -1 | 1) => {
        updateControl((editor) => {
            const next = editor.cursorY + dir;
            if (next < 0 || next > editor.records.length - 1) return false;

            editor.cursorY = next;
            return true;
        });
    };

    const toggleHit = () => {
        updateControl((editor) => {
            if (editor.cursorX < 0 || editor.cursorY < 0) return false;
            if (editor.cursorY > editor.records.length - 1) return false;

            const index = editor.hits.findIndex((hit) => (
                hit.colIndex === editor.cursorX && hit.recordIndex === editor.cursorY
            ));
            if (index >= 0) {
                editor.hits.splice(index, 1);
                return true;
            }

            editor.hits.push({
                colIndex: editor.cursorX,
                recordIndex: editor.cursorY,
                velocity: 100,
            });
            editor.hits.sort((a, b) => {
                if (a.recordIndex !== b.recordIndex) return a.recordIndex - b.recordIndex;
                return a.colIndex - b.colIndex;
            });
            return true;
        });
    };

    const setColDiv = (
        colIndex: number,
        div: DrumEditorState.SplitDiv | undefined,
    ) => {
        updateControl((editor) => {
            const ctx = createContext();
            const criteriaDiv = DrumEditorState.getEffectiveCriteriaDiv(
                editor.criteriaDiv,
                ctx.arrange.target.beat,
                ctx.arrange.target.scoreBase.rhythm.ts,
            );
            const colCount = DrumEditorState.getColumnCount(
                criteriaDiv,
                ctx.arrange.target.beat,
                ctx.arrange.target.scoreBase.rhythm.ts,
            );
            const prevColDivs = editor.colDivs.map(item => ({ ...item }));
            const index = editor.colDivs.findIndex(item => item.index === colIndex);

            if (div == undefined) {
                if (index >= 0) editor.colDivs.splice(index, 1);
            } else {
                if (index >= 0) editor.colDivs[index].div = div;
                else editor.colDivs.push({ index: colIndex, div });
                editor.colDivs.sort((a, b) => a.index - b.index);
            }

            adjustHitsForColDivChange(
                editor,
                colIndex,
                prevColDivs,
                editor.colDivs,
                colCount,
            );
            return true;
        });
    };

    const openColDivSelect = () => {
        const ctx = createContext();
        if (ctx.editor.control !== "col") return;

        const criteriaDiv = DrumEditorState.getEffectiveCriteriaDiv(
            ctx.editor.criteriaDiv,
            ctx.arrange.target.beat,
            ctx.arrange.target.scoreBase.rhythm.ts,
        );
        const splitDivs = getColSplitDivs(
            criteriaDiv,
            ctx.arrange.target.scoreBase.rhythm.ts.unit,
        );
        if (splitDivs.length === 0) return;

        const colRef = ctx.ref.arrange.drum.cols.find(item => (
            item.colIndex === ctx.editor.cursorX
        ))?.ref;
        if (colRef == undefined) return;

        const current = ctx.editor.colDivs.find(item => item.index === ctx.editor.cursorX);
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
                    setColDiv(ctx.editor.cursorX, undefined);
                    return;
                }

                const div = Number(value);
                if (!isSplitDiv(div)) return;
                setColDiv(ctx.editor.cursorX, div);
            },
        });
    };

    const insertRecord = () => {
        updateControl((editor) => {
            if (editor.records.length >= Layout.arrange.piano.BACKING_RECORD_MAX) return false;

            if (editor.records.length === 0) {
                editor.records.push({ key: "" });
                editor.cursorY = 0;
                return true;
            }

            editor.records.splice(editor.cursorY + 1, 0, { key: "" });
            editor.hits.forEach((hit) => {
                if (editor.cursorY < hit.recordIndex) hit.recordIndex++;
            });
            return true;
        });
    };

    const deleteRecord = () => {
        updateControl((editor) => {
            if (editor.records.length < 1) return false;

            editor.records.splice(editor.cursorY, 1);
            for (let i = editor.hits.length - 1; i >= 0; i--) {
                const hit = editor.hits[i];
                if (hit.recordIndex === editor.cursorY) editor.hits.splice(i, 1);
            }
            editor.hits.forEach((hit) => {
                if (editor.cursorY < hit.recordIndex) hit.recordIndex--;
            });

            if (editor.records.length === 0) {
                editor.cursorY = -1;
                return true;
            }
            if (editor.cursorY > 0) editor.cursorY--;
            return true;
        });
    };

    const swapRecord = (dir: -1 | 1) => {
        updateControl((editor) => {
            const index = editor.cursorY;
            const next = index + dir;
            if (index < 0 || next < 0 || next > editor.records.length - 1) return false;

            const record = editor.records[index];
            const nextRecord = editor.records[next];
            if (record == undefined || nextRecord == undefined) return false;

            editor.records[index] = nextRecord;
            editor.records[next] = record;
            editor.hits.forEach((hit) => {
                if (hit.recordIndex === index) hit.recordIndex = next;
                else if (hit.recordIndex === next) hit.recordIndex = index;
            });
            editor.cursorY = next;
            return true;
        });
    };

    const setRecordKey = (recordIndex: number, key: string) => {
        updateControl((editor) => {
            const record = editor.records[recordIndex];
            if (record == undefined) return false;
            if (key !== "" && editor.records.some((item, index) => {
                return index !== recordIndex && item.key === key;
            })) return false;

            record.key = key;
            return true;
        });
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
        const recordIndex = ctx.editor.cursorY;
        if (ctx.editor.control !== "record") return;
        if (recordIndex < 0) return;

        const record = ctx.editor.records[recordIndex];
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
            items: createRecordKeyItems(ctx.editor, ctx.arrTrack.bank.mappings),
            apply: value => setRecordKey(recordIndex, value),
        });
    };

    return {
        deleteRecord,
        insertRecord,
        moveColCursor,
        movePatternColCursor,
        movePatternRecordCursor,
        moveRecordCursor,
        openCriteriaDivSelect,
        openColDivSelect,
        openRecordKeySelect,
        shiftControl,
        swapRecord,
        toggleHit,
    };
};

export default createDrumArrangeActions;
