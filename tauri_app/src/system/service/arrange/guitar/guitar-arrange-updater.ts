import type ArrangeState from "../../../store/state/data/arrange/arrange-state";
import Layout from "../../../layout/layout-constant";
import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";

type Context = {
    arrange: ArrangeState.EditorProps;
    arrTrack: ArrangeState.Track;
};

export type GuitarFretToggleResult = {
    activated: boolean;
    pitch?: number;
};

const createGuitarArrangeUpdater = (ctx: Context) => {
    const arrange = (() => {
        if (ctx.arrange.method !== "guitar") throw new Error();
        return ctx.arrange;
    })();
    const arrTrack = (() => {
        if (ctx.arrTrack.method !== "guitar") throw new Error();
        return ctx.arrTrack;
    })();

    const getGuitarEditor = () => {
        if (arrange.method !== "guitar" || arrange.editor == undefined) throw new Error();
        return arrange.editor as GuitarEditorState.Value;
    };

    const getGuitarLib = () => {
        return arrTrack.bank;
    };

    const getCompiledChord = () => {
        return arrange.target.compiledChord;
    };

    const isCurrentChordTone = () => {
        const editor = getGuitarEditor();
        const tuning = GuitarEditorState.STANDARD_TUNING[editor.cursorString];
        const pitchClass = (tuning.openMidi + editor.cursorFret) % 12;
        return getCompiledChord().structs
            .map(s => ((s.key12 % 12) + 12) % 12)
            .includes(pitchClass);
    };

    const moveCursor = (dir: { string?: -1 | 1; fret?: -1 | 1 }) => {
        const editor = getGuitarEditor();
        editor.cursorString += dir.string ?? 0;
        editor.cursorFret += dir.fret ?? 0;

        if (editor.cursorString < 0) editor.cursorString = 0;
        if (editor.cursorString > GuitarEditorState.STANDARD_TUNING.length - 1) {
            editor.cursorString = GuitarEditorState.STANDARD_TUNING.length - 1;
        }
        if (editor.cursorFret < 0) editor.cursorFret = 0;
        if (editor.cursorFret > GuitarEditorState.MAX_FRET) {
            editor.cursorFret = GuitarEditorState.MAX_FRET;
        }
    };

    const shiftControl = (next: GuitarEditorState.Control) => {
        const editor = getGuitarEditor();
        if (next !== "voicing" && editor.backing == null) return false;

        editor.control = next;
        return true;
    };

    const useBacking = () => {
        const editor = getGuitarEditor();
        if (editor.backing != null) return false;

        editor.backing = GuitarEditorState.createInitialBackingProps();
        return true;
    };

    const deleteBacking = () => {
        const editor = getGuitarEditor();
        if (editor.backing == null) return false;

        editor.backing = null;
        editor.control = "voicing";
        return true;
    };

    const toggleBacking = () => {
        const editor = getGuitarEditor();
        return editor.backing == null ? useBacking() : deleteBacking();
    };

    const getBacking = () => {
        const backing = getGuitarEditor().backing;
        if (backing == null) throw new Error();
        return backing;
    };

    const moveBackingColCursor = (dir: -1 | 1) => {
        const backing = getBacking();
        const next = backing.cursorX + dir;

        if (next < 0 || next > backing.cols.length - 1) return false;

        backing.cursorX = next;
        return true;
    };

    const createInitialBackingCol = (): GuitarEditorState.Col => {
        const backing = getBacking();
        const source = backing.cursorX >= 0 ? backing.cols[backing.cursorX] : undefined;

        return {
            div: source?.div ?? 1,
            dot: source?.dot,
            tuplets: source?.tuplets ?? 1,
        };
    };

    const insertBackingCol = () => {
        const backing = getBacking();
        const cols = backing.cols;
        if (cols.length > Layout.arrange.piano.BACKING_COL_MAX) return false;

        const insertIndex = backing.cursorX + 1;
        cols.splice(insertIndex, 0, createInitialBackingCol());
        backing.events.forEach((event) => {
            if (insertIndex <= event.colIndex) event.colIndex++;
        });
        return true;
    };

    const deleteBackingCol = () => {
        const backing = getBacking();
        const cols = backing.cols;
        if (backing.cursorX === -1) return false;

        for (let i = backing.events.length - 1; i >= 0; i--) {
            const event = backing.events[i];
            if (backing.cursorX === event.colIndex) backing.events.splice(i, 1);
        }
        backing.events.forEach((event) => {
            if (backing.cursorX < event.colIndex) event.colIndex--;
        });

        cols.splice(backing.cursorX, 1);
        if (backing.cursorX > 0) backing.cursorX--;
        if (cols.length === 0) backing.cursorX = -1;
        return true;
    };

    const setBackingColDiv = (div: number) => {
        const backing = getBacking();
        const col = backing.cols[backing.cursorX];
        if (col == undefined) return false;

        col.div = div / 4;
        col.dot = undefined;
        return true;
    };

    const toggleBackingColDot = () => {
        const backing = getBacking();
        const col = backing.cols[backing.cursorX];
        if (col == undefined || col.div >= 4) return false;

        switch (col.dot) {
            case undefined:
                col.dot = 1;
                break;
            case 1:
                col.dot = undefined;
                break;
        }
        return true;
    };

    const setTechnique = (technique: GuitarEditorState.TechniqueSelection | "none") => {
        const backing = getBacking();
        if (backing.cursorX === -1) return false;

        const currentIndex = backing.events.findIndex((event) => {
            return event.colIndex === backing.cursorX;
        });
        if (technique === "none") {
            if (currentIndex !== -1) backing.events.splice(currentIndex, 1);
            return true;
        }

        const event: GuitarEditorState.PatternEvent = {
            colIndex: backing.cursorX,
            ...GuitarEditorState.createPlayActionFromTechnique(technique),
        };
        if (currentIndex === -1) backing.events.push(event);
        else backing.events[currentIndex] = event;
        return true;
    };

    const shiftTechnique = (dir: -1 | 1) => {
        const backing = getBacking();
        if (backing.cursorX === -1) return false;

        const current = backing.events.find((event) => {
            return event.colIndex === backing.cursorX;
        });
        const technique = current == undefined
            ? "none"
            : GuitarEditorState.getTechniqueSelection(current);
        const index = GuitarEditorState.TECHNIQUES.indexOf(technique);
        const next = GuitarEditorState.TECHNIQUES[index + dir];
        if (next == undefined) return false;

        return setTechnique(next);
    };

    const toggleFret = () => {
        if (!isCurrentChordTone()) return false;

        const editor = getGuitarEditor();
        const current = editor.frets[editor.cursorString];
        const activated = current !== editor.cursorFret;
        editor.frets[editor.cursorString] =
            activated ? editor.cursorFret : null;

        return {
            activated,
            pitch: activated
                ? GuitarEditorState.STANDARD_TUNING[editor.cursorString].openMidi + editor.cursorFret
                : undefined,
        };
    };

    const muteString = () => {
        const editor = getGuitarEditor();
        editor.frets[editor.cursorString] = null;
    };

    const applyArrange = () => {
        const editor = getGuitarEditor();
        const chordSeq = arrange.target.chordSeq;
        const guitarLib = getGuitarLib();
        const voicingPattNo = GuitarEditorState.registPattern(editor.frets, guitarLib);
        const backingPattNo = editor.backing == null
            ? -1
            : GuitarEditorState.registBackingPattern(
                GuitarEditorState.createBackingData(editor.backing),
                guitarLib,
            );

        const relations = arrTrack.relations;
        const relation = relations.find(r => r.chordSeq === chordSeq);
        if (relation == undefined) {
            relations.push({
                chordSeq,
                bkgPatt: backingPattNo,
                sndsPatt: voicingPattNo,
            });
        } else {
            relation.bkgPatt = backingPattNo;
            relation.sndsPatt = voicingPattNo;
            GuitarEditorState.deleteUnreferUnit(arrTrack);
        }
    };

    return {
        applyArrange,
        deleteBacking,
        deleteBackingCol,
        insertBackingCol,
        moveCursor,
        moveBackingColCursor,
        muteString,
        setBackingColDiv,
        setTechnique,
        shiftControl,
        shiftTechnique,
        toggleBacking,
        toggleBackingColDot,
        toggleFret,
        useBacking,
    };
};

export default createGuitarArrangeUpdater;
