import Layout from "../../../layout/layout-constant";
import type ArrangeState from "../../../store/state/data/arrange/arrange-state";
import DrumEditorState from "../../../store/state/data/arrange/drum/drum-editor-state";

type Context = {
    arrange: ArrangeState.EditorProps;
    track: ArrangeState.Track;
};

const createDrumArrangeUpdater = (ctx: Context) => {
    const arrange = (() => {
        if (ctx.arrange.method !== "drum") throw new Error("Drum arrange updater requires drum arrange.");
        return ctx.arrange;
    })();
    (() => {
        if (ctx.track.method !== "drum") throw new Error("Drum arrange updater requires drum track.");
    })();
    const track = ctx.track as ArrangeState.DrumTrack;

    const getEditor = () => {
        if (arrange.editor == undefined) throw new Error("Drum editor must exist.");
        return arrange.editor as DrumEditorState.Value;
    };

    const getColCount = (editor: DrumEditorState.Value) => {
        const criteriaDiv = DrumEditorState.getEffectiveCriteriaDiv(
            editor.criteriaDiv,
            arrange.target.beat,
            arrange.target.scoreBase.rhythm.ts,
        );
        return DrumEditorState.getColumnCount(
            criteriaDiv,
            arrange.target.beat,
            arrange.target.scoreBase.rhythm.ts,
        );
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

    const shiftControl = (next: DrumEditorState.Control) => {
        const editor = getEditor();
        editor.control = next;
        if ((next === "record" || next === "hits") && editor.cursorY < 0 && editor.records.length > 0) {
            editor.cursorY = 0;
        }
    };

    const applyCriteriaDiv = (div: DrumEditorState.CriteriaDiv) => {
        const editor = getEditor();
        editor.criteriaDiv = div;
        editor.colDivs = [];
        editor.hits = [];

        const colCount = getColCount(editor);
        editor.cursorX = Math.max(0, Math.min(editor.cursorX, colCount - 1));
    };

    const moveRecordCursor = (dir: -1 | 1) => {
        const editor = getEditor();
        const next = editor.cursorY + dir;
        if (next < 0 || next > editor.records.length - 1) return false;

        editor.cursorY = next;
        return true;
    };

    const moveColCursor = (dir: -1 | 1) => {
        const editor = getEditor();
        const colCount = getColCount(editor);
        const next = editor.cursorX + dir;
        if (next < 0 || next > colCount - 1) return false;

        editor.cursorX = next;
        return true;
    };

    const movePatternColCursor = (dir: -1 | 1) => {
        const editor = getEditor();
        const patternColCount = getPatternColCount(editor, getColCount(editor));
        const next = editor.cursorX + dir;
        if (next < 0 || next > patternColCount - 1) return false;

        editor.cursorX = next;
        return true;
    };

    const movePatternRecordCursor = (dir: -1 | 1) => {
        const editor = getEditor();
        const next = editor.cursorY + dir;
        if (next < 0 || next > editor.records.length - 1) return false;

        editor.cursorY = next;
        return true;
    };

    const toggleHit = () => {
        const editor = getEditor();
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
            velocity: 10,
        });
        editor.hits.sort((a, b) => {
            if (a.recordIndex !== b.recordIndex) return a.recordIndex - b.recordIndex;
            return a.colIndex - b.colIndex;
        });
        return true;
    };

    const modifyHitVelocity = (dir: -1 | 1) => {
        const editor = getEditor();
        if (editor.control !== "hits") return false;
        const hit = editor.hits.find((hit) => (
            hit.colIndex === editor.cursorX && hit.recordIndex === editor.cursorY
        ));
        if (hit == undefined) return false;

        hit.velocity = Math.max(1, Math.min(20, hit.velocity + dir));
        return true;
    };

    const setColDiv = (
        colIndex: number,
        div: DrumEditorState.SplitDiv | undefined,
    ) => {
        const editor = getEditor();
        const colCount = getColCount(editor);
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
    };

    const insertRecord = () => {
        const editor = getEditor();
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
    };

    const deleteRecord = () => {
        const editor = getEditor();
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
    };

    const swapRecord = (dir: -1 | 1) => {
        const editor = getEditor();
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
    };

    const setRecordKey = (recordIndex: number, key: string) => {
        const editor = getEditor();
        const record = editor.records[recordIndex];
        if (record == undefined) return false;
        if (key !== "" && editor.records.some((item, index) => {
            return index !== recordIndex && item.key === key;
        })) return false;

        record.key = key;
        return true;
    };

    const registerCurrentPattern = () => {
        const editor = getEditor();
        const patternData = DrumEditorState.createPatternData(editor);
        const patternNo = DrumEditorState.registPattern(
            {
                beat: arrange.target.beat.num,
                tsGroup: [arrange.target.scoreBase.rhythm.ts],
                eatHead: arrange.target.beat.eatHead,
                eatTail: arrange.target.beat.eatTail,
            },
            patternData,
            track.bank,
        );

        return {
            patternNo,
            patternCount: track.bank.patterns.length,
        };
    };

    const applyLibrary = () => {
        const origin = arrange.origin;
        if (origin.type !== "library") throw new Error("Drum library apply requires library origin.");
        if (origin.mode !== "edit-pattern" && origin.mode !== "add-pattern") {
            throw new Error("Drum library apply requires drum library mode.");
        }

        const editor = getEditor();
        const patternData = DrumEditorState.createPatternData(editor);
        const category: DrumEditorState.PatternCategory = {
            beat: arrange.target.beat.num,
            tsGroup: [arrange.target.scoreBase.rhythm.ts],
            eatHead: arrange.target.beat.eatHead,
            eatTail: arrange.target.beat.eatTail,
        };
        const addPattern = () => {
            const patternNo = track.bank.patterns.reduce((max, pattern) => {
                return Math.max(max, pattern.no);
            }, -1) + 1;
            track.bank.patterns.push({
                no: patternNo,
                pattern: JSON.parse(JSON.stringify(patternData)),
                category: JSON.parse(JSON.stringify(category)),
            });
            track.bank.regulars.push({
                patternNo,
                sortNo: -1,
            });
            return patternNo;
        };

        switch (origin.mode) {
            case "edit-pattern": {
                if (origin.patternNo === -1) throw new Error("Drum pattern must be selected.");
                const pattern = track.bank.patterns.find(pattern => {
                    return pattern.no === origin.patternNo;
                });
                if (pattern == undefined) throw new Error("Drum pattern must exist.");

                pattern.pattern = patternData;
                pattern.category = category;
                return {
                    patternNo: pattern.no,
                    patternCount: track.bank.patterns.length,
                };
            }
            case "add-pattern": {
                const patternNo = addPattern();
                return {
                    patternNo,
                    patternCount: track.bank.patterns.length,
                };
            }
        }
    };

    const applyArrange = () => {
        const result = registerCurrentPattern();
        const chordSeq = arrange.target.chordSeq;
        const relation = track.relations.find(r => r.chordSeq === chordSeq);
        if (relation == undefined) {
            track.relations.push({
                chordSeq,
                bkgPatt: -1,
                sndsPatt: result.patternNo,
            });
        } else {
            relation.bkgPatt = -1;
            relation.sndsPatt = result.patternNo;
            DrumEditorState.deleteUnreferUnit(track);
        }

        return result;
    };

    return {
        applyArrange,
        applyLibrary,
        applyCriteriaDiv,
        deleteRecord,
        insertRecord,
        modifyHitVelocity,
        moveColCursor,
        movePatternColCursor,
        movePatternRecordCursor,
        moveRecordCursor,
        registerCurrentPattern,
        setColDiv,
        setRecordKey,
        shiftControl,
        swapRecord,
        toggleHit,
    };
};

export default createDrumArrangeUpdater;
