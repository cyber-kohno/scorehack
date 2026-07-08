import type ArrangeState from "../../../store/state/data/arrange/arrange-state";
import Layout from "../../../layout/layout-constant";
import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";
import FinderState from "../../../store/state/data/arrange/finder-state";

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

    const getFinder = () => {
        if (arrange.finder == undefined) throw new Error("Guitar finder must exist.");
        return arrange.finder as FinderState.Guitar.Finder;
    };

    const getCompiledChord = () => {
        return arrange.target.compiledChord;
    };

    const isCurrentChordTone = () => {
        const editor = getGuitarEditor();
        const tuning = GuitarEditorState.STANDARD_TUNING[editor.cursorString];
        const pitchClass = (tuning.openPitchIndex + editor.cursorFret) % 12;
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
        if (arrange.origin.type === "library") return false;

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

    const modifyPatternEvent = (
        modifier: (event: GuitarEditorState.PatternEvent) => GuitarEditorState.PatternEvent,
    ) => {
        const backing = getBacking();
        if (backing.cursorX === -1) return false;

        const eventIndex = backing.events.findIndex((event) => {
            return event.colIndex === backing.cursorX;
        });
        if (eventIndex === -1) return false;

        backing.events[eventIndex] = modifier(backing.events[eventIndex]);
        return true;
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
                ? GuitarEditorState.STANDARD_TUNING[editor.cursorString].openPitchIndex + editor.cursorFret
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
        const voicingPattNo = GuitarEditorState.registPattern(
            editor.frets,
            guitarLib,
            FinderState.Guitar.createVoicingKey(arrange.target.compiledChord.chord),
        );
        const backingCategory: FinderState.BackingCategory = {
            beat: arrange.target.beat.num,
            tsGloup: [arrange.target.scoreBase.rhythm.ts],
            eatHead: arrange.target.beat.eatHead,
            eatTail: arrange.target.beat.eatTail,
        };
        const backingPattNo = editor.backing == null
            ? -1
            : GuitarEditorState.registBackingPattern(
                backingCategory,
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

    const applyLibrary = () => {
        const origin = arrange.origin;
        if (origin.type !== "library") throw new Error("Guitar library origin must exist.");
        if (
            origin.mode !== "edit-voicing" &&
            origin.mode !== "add-voicing" &&
            origin.mode !== "edit-backing" &&
            origin.mode !== "add-backing"
        ) {
            throw new Error("Guitar library mode must exist.");
        }

        const editor = getGuitarEditor();
        const guitarLib = getGuitarLib();
        const voicingKey = FinderState.Guitar.createVoicingKey(arrange.target.compiledChord.chord);
        const backingCategory: FinderState.BackingCategory = {
            beat: arrange.target.beat.num,
            tsGloup: [arrange.target.scoreBase.rhythm.ts],
            eatHead: arrange.target.beat.eatHead,
            eatTail: arrange.target.beat.eatTail,
        };

        switch (origin.mode) {
            case "edit-voicing": {
                if (origin.voicingNo === -1) throw new Error("Guitar voicing pattern must be selected.");
                const pattern = guitarLib.voicingPatterns.find(pattern => {
                    return pattern.no === origin.voicingNo;
                });
                if (pattern == undefined) throw new Error("Guitar voicing pattern must exist.");

                pattern.key = voicingKey;
                pattern.frets = JSON.parse(JSON.stringify(editor.frets));
                return;
            }
            case "add-voicing":
                GuitarEditorState.registPattern(editor.frets, guitarLib, voicingKey);
                return;
            case "edit-backing": {
                if (origin.backingNo === -1) throw new Error("Guitar backing pattern must be selected.");
                if (editor.backing == null) throw new Error("Guitar backing editor must exist.");
                const pattern = guitarLib.backingPatterns.find(pattern => {
                    return pattern.no === origin.backingNo;
                });
                if (pattern == undefined) throw new Error("Guitar backing pattern must exist.");

                pattern.category = backingCategory;
                pattern.backing = GuitarEditorState.createBackingData(editor.backing);
                return;
            }
            case "add-backing":
                if (editor.backing == null) throw new Error("Guitar backing editor must exist.");
                GuitarEditorState.registBackingPattern(
                    backingCategory,
                    GuitarEditorState.createBackingData(editor.backing),
                    guitarLib,
                );
                return;
        }
    };

    const moveFinder = (dir: -1 | 1 | -3 | 3) => {
        const finder = getFinder();
        const list = finder.cursor.target === "voicing"
            ? finder.voicings
            : finder.backings;
        const key = finder.cursor.target;
        const current = finder.cursor[key];
        const next = current + dir;
        if (next < 0 || next > list.length - 1) return false;

        finder.cursor[key] = next;
        return true;
    };

    const applyFinderSelection = () => {
        const finder = getFinder();

        if (finder.cursor.target === "voicing") {
            finder.cursor.target = "backing";
            return { control: true, data: false, closeArrange: false };
        }

        const selectedVoicing = finder.voicings[finder.cursor.voicing];
        const selectedBacking = finder.backings[finder.cursor.backing];
        if (selectedVoicing == undefined || selectedBacking == undefined) {
            throw new Error("Guitar finder selection must exist.");
        }

        const voicingNo = selectedVoicing.voicingNo;
        const backingNo = selectedBacking.backingNo;
        const chordSeq = arrange.target.chordSeq;

        const openEditor = () => {
            const editor = GuitarEditorState.createInitialProps();
            if (voicingNo !== -1) {
                const voicing = FinderState.Guitar.getVoicingFromNo(voicingNo, arrTrack.bank);
                editor.frets = JSON.parse(JSON.stringify(voicing.frets)) as GuitarEditorState.StringSelection[];
            }
            if (backingNo !== -1) {
                const backing = FinderState.Guitar.getBackingFromNo(backingNo, arrTrack.bank);
                editor.backing = GuitarEditorState.createBackingEditorProps(backing.backing);
                editor.control = "voicing";
            }
            arrange.editor = editor;
            delete arrange.finder;
            return { control: true, data: false, closeArrange: false };
        };

        if (voicingNo === -1) return openEditor();

        let relation = arrTrack.relations.find(r => r.chordSeq === chordSeq);
        if (relation == undefined) {
            relation = {
                chordSeq,
                bkgPatt: backingNo,
                sndsPatt: voicingNo,
            };
            arrTrack.relations.push(relation);
        } else {
            relation.bkgPatt = backingNo;
            relation.sndsPatt = voicingNo;
            GuitarEditorState.deleteUnreferUnit(arrTrack);
        }

        return { control: true, data: true, closeArrange: true };
    };

    const backFinderSelection = () => {
        const finder = getFinder();
        if (finder.cursor.target !== "backing") return false;

        finder.cursor.target = "voicing";
        return true;
    };

    return {
        applyFinderSelection,
        applyArrange,
        applyLibrary,
        backFinderSelection,
        deleteBacking,
        deleteBackingCol,
        insertBackingCol,
        moveCursor,
        moveFinder,
        moveBackingColCursor,
        modifyPatternEvent,
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
