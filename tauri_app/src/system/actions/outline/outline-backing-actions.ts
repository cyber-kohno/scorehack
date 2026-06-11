import ChordTheory from "../../domain/theory/chord-theory";
import GuitarVoicingResolver from "../../service/arrange/guitar/guitar-voicing-resolver";
import ConfirmDialog from "../../service/common/confirm-dialog-controller";
import Toast from "../../service/common/toast-controller";
import type ArrangeLibrary from "../../store/state/data/arrange/arrange-library";
import type ArrangeState from "../../store/state/data/arrange/arrange-state";
import GuitarEditorState from "../../store/state/data/arrange/guitar/guitar-editor-state";
import PianoEditorState from "../../store/state/data/arrange/piano/piano-editor-state";
import ElementState from "../../store/state/data/element-state";
import ToastState from "../../store/state/toast-state";
import type { OutlineActionContext } from "./outline-actions";

const createOutlineBackingActions = (
    createContext: () => OutlineActionContext,
) => {
    const getChordStructs = (
        ctx: OutlineActionContext,
        chordData: ElementState.DataChord,
    ) => {
        if (chordData.degree == undefined) return [];

        const tonality = ctx.derivedSelector.getCurBase().scoreBase.tonality;
        const chord = ChordTheory.getKeyChordFromDegree(tonality, chordData.degree);
        return ChordTheory.getStructsFromKeyChord(chord);
    };

    const getChordStructCount = (
        ctx: OutlineActionContext,
        chordData: ElementState.DataChord,
    ) => {
        return getChordStructs(ctx, chordData).length;
    };

    const getChordPitchClasses = (
        ctx: OutlineActionContext,
        chordData: ElementState.DataChord,
    ) => {
        return getChordStructs(ctx, chordData)
            .map(struct => ((struct.key12 % 12) + 12) % 12)
            .sort((a, b) => a - b);
    };

    const isSamePitchClasses = (left: number[], right: number[]) => {
        if (left.length !== right.length) return false;
        return left.every((item, index) => item === right[index]);
    };

    const clearPianoVoicing = (
        ctx: OutlineActionContext,
        track: ArrangeState.PianoTrack,
        structCount: number,
    ) => {
        const { chordSeq, baseSeq } = ctx.derived.elementCaches[ctx.outline.focus];
        if (chordSeq === -1) return false;

        const relationIndex = track.relations.findIndex(r => r.chordSeq === chordSeq);
        if (relationIndex === -1) return false;

        const relation = track.relations[relationIndex];
        if (relation.bkgPatt === -1) {
            track.relations.splice(relationIndex, 1);
            PianoEditorState.deleteUnreferUnit(track);
            return true;
        }

        const chordCache = ctx.derived.chordCaches[chordSeq];
        const scoreBase = ctx.derived.baseCaches[baseSeq].scoreBase;
        const category: ArrangeLibrary.SearchCategory = {
            beat: chordCache.beat.num,
            structCnt: structCount,
            tsGloup: [scoreBase.rhythm.ts],
            eatHead: chordCache.beat.eatHead,
            eatTail: chordCache.beat.eatTail,
        };

        const [, soundsPattNo] = PianoEditorState.registPattern(
            category,
            null,
            [],
            track.lib,
        );

        relation.sndsPatt = soundsPattNo;
        PianoEditorState.deleteUnreferUnit(track);
        return true;
    };

    const removeGuitarBacking = (
        ctx: OutlineActionContext,
        track: ArrangeState.GuitarTrack,
    ) => {
        const { chordSeq } = ctx.derived.elementCaches[ctx.outline.focus];
        if (chordSeq === -1) return false;

        const relationIndex = track.relations.findIndex(r => r.chordSeq === chordSeq);
        if (relationIndex === -1) return false;

        track.relations.splice(relationIndex, 1);
        GuitarEditorState.deleteUnreferUnit(track);
        return true;
    };

    const clearVoicingIfChordChanged = (
        ctx: OutlineActionContext,
        beforeChordData: ElementState.DataChord,
        afterChordData: ElementState.DataChord,
    ) => {
        const track = ctx.outlineSelector.getCurrHarmonizeTrack();
        switch (track.method) {
            case "piano": {
                const beforeCount = getChordStructCount(ctx, beforeChordData);
                const afterCount = getChordStructCount(ctx, afterChordData);
                if (beforeCount === afterCount) return false;
                return clearPianoVoicing(ctx, track, afterCount);
            }
            case "guitar": {
                const beforePitchClasses = getChordPitchClasses(ctx, beforeChordData);
                const afterPitchClasses = getChordPitchClasses(ctx, afterChordData);
                if (isSamePitchClasses(beforePitchClasses, afterPitchClasses)) return false;
                return removeGuitarBacking(ctx, track);
            }
        }
    };

    const openArrangeEditor = () => {
        const ctx = createContext();
        const opened = ctx.outlineUpdater.openArrangeEditor();

        if (!opened) return;

        ctx.commitControl();
    };

    const openArrangeFinder = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") return;

        const opened = ctx.outlineUpdater.openArrangeFinder();
        if (!opened) return;

        ctx.commitControl();
    };

    const applyDefaultPianoVoicing = (
        ctx: OutlineActionContext,
        track: ArrangeState.PianoTrack,
    ) => {
        const { chordSeq, baseSeq } = ctx.derived.elementCaches[ctx.outline.focus];
        if (chordSeq === -1) return false;

        const chordCache = ctx.derived.chordCaches[chordSeq];
        const compiledChord = chordCache.compiledChord;
        const pianoLib = track.lib;
        if (compiledChord == undefined) return false;

        let relation = track.relations.find(r => r.chordSeq === chordSeq);
        if (relation != undefined) {
            Toast.create({
                ...ToastState.createInitial(),
                x: 12,
                y: 48,
                width: 280,
                text: "Backing is already set.",
            });
            return false;
        }

        const sounds = compiledChord.structs.map((_, index) => `3.${index}`);
        if (sounds.length === 0) return false;

        const scoreBase = ctx.derived.baseCaches[baseSeq].scoreBase;
        const category: ArrangeLibrary.SearchCategory = {
            beat: chordCache.beat.num,
            structCnt: compiledChord.structs.length,
            tsGloup: [scoreBase.rhythm.ts],
            eatHead: chordCache.beat.eatHead,
            eatTail: chordCache.beat.eatTail,
        };

        const [backingPattNo, soundsPattNo] = PianoEditorState.registPattern(
            category,
            null,
            sounds,
            pianoLib,
        );

        relation = {
            chordSeq,
            bkgPatt: backingPattNo,
            sndsPatt: soundsPattNo,
        };
        track.relations.push(relation);
        return true;
    };

    const applyDefaultGuitarVoicing = (
        ctx: OutlineActionContext,
        track: ArrangeState.GuitarTrack,
    ) => {
        const { chordSeq } = ctx.derived.elementCaches[ctx.outline.focus];
        if (chordSeq === -1) return false;

        const chordCache = ctx.derived.chordCaches[chordSeq];
        const compiledChord = chordCache.compiledChord;
        const guitarLib = track.lib;
        if (compiledChord == undefined) return false;

        let relation = track.relations.find(r => r.chordSeq === chordSeq);
        if (relation != undefined) {
            Toast.create({
                ...ToastState.createInitial(),
                x: 12,
                y: 48,
                width: 280,
                text: "Backing is already set.",
            });
            return false;
        }

        const frets = GuitarVoicingResolver.resolve({
            structs: compiledChord.structs,
        });
        if (frets.every(fret => fret == null)) return false;

        const voicingPattNo = GuitarEditorState.registPattern(frets, guitarLib);

        relation = {
            chordSeq,
            bkgPatt: -1,
            sndsPatt: voicingPattNo,
        };
        track.relations.push(relation);
        return true;
    };

    const applyDefaultVoicing = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();
        if (element.type !== "chord") return;

        const track = ctx.outlineSelector.getCurrHarmonizeTrack();

        switch (track.method) {
            case "piano": {
                const applied = applyDefaultPianoVoicing(ctx, track);
                if (!applied) return;
                ctx.commitDataAndRecalculate();
            } break;
            case "guitar": {
                const applied = applyDefaultGuitarVoicing(ctx, track);
                if (!applied) return;
                ctx.commitDataAndRecalculate();
            } break;
        }
    };

    const removePianoBacking = (
        ctx: OutlineActionContext,
        track: ArrangeState.PianoTrack,
    ) => {
        const { chordSeq } = ctx.derived.elementCaches[ctx.outline.focus];
        if (chordSeq === -1) return false;

        const relationIndex = track.relations.findIndex(r => r.chordSeq === chordSeq);
        if (relationIndex === -1) return false;

        track.relations.splice(relationIndex, 1);
        PianoEditorState.deleteUnreferUnit(track);
        return true;
    };

    const getPianoRemoveBackingWarnings = (
        ctx: OutlineActionContext,
        track: ArrangeState.PianoTrack,
    ) => {
        const { chordSeq } = ctx.derived.elementCaches[ctx.outline.focus];
        const pianoLib = track.lib;
        if (chordSeq === -1) return [];

        const relation = track.relations.find(r => r.chordSeq === chordSeq);
        if (relation == undefined) return [];

        const warnings: string[] = [];
        const isLastRelationRef = (target: "bkgPatt" | "sndsPatt", pattNo: number) => {
            if (pattNo === -1) return false;
            return track.relations.filter(r => r.chordSeq !== chordSeq).every(r => r[target] !== pattNo);
        };
        const isRegularBacking = (pattNo: number) => {
            return pianoLib.regulars.some(regular => regular.backingNo === pattNo);
        };
        const isRegularSounds = (pattNo: number) => {
            return pianoLib.regulars.some(regular => regular.soundsNos.includes(pattNo));
        };

        if (
            relation.bkgPatt !== -1 &&
            !isRegularBacking(relation.bkgPatt) &&
            isLastRelationRef("bkgPatt", relation.bkgPatt)
        ) {
            warnings.push("The piano backing pattern will also be deleted from the library.");
        }
        if (
            relation.sndsPatt !== -1 &&
            !isRegularSounds(relation.sndsPatt) &&
            isLastRelationRef("sndsPatt", relation.sndsPatt)
        ) {
            warnings.push("The piano voicing pattern will also be deleted from the library.");
        }

        return warnings;
    };

    const getGuitarRemoveBackingWarnings = (
        ctx: OutlineActionContext,
        track: ArrangeState.GuitarTrack,
    ) => {
        const { chordSeq } = ctx.derived.elementCaches[ctx.outline.focus];
        if (chordSeq === -1) return [];

        const relation = track.relations.find(r => r.chordSeq === chordSeq);
        if (relation == undefined || relation.sndsPatt === -1) return [];

        const hasOtherRef = track.relations
            .filter(r => r.chordSeq !== chordSeq)
            .some(r => r.sndsPatt === relation.sndsPatt);
        if (hasOtherRef) return [];

        return ["The guitar voicing pattern will also be deleted from the library."];
    };

    const getRemoveBackingWarnings = (ctx: OutlineActionContext) => {
        const element = ctx.outlineSelector.getCurrentElement();
        if (element.type !== "chord") return [];

        const track = ctx.outlineSelector.getCurrHarmonizeTrack();
        switch (track.method) {
            case "piano": return getPianoRemoveBackingWarnings(ctx, track);
            case "guitar": return getGuitarRemoveBackingWarnings(ctx, track);
        }
    };

    const confirmLibraryPatternDelete = (
        warnings: string[],
        callback: () => void,
    ) => {
        if (warnings.length === 0) {
            callback();
            return;
        }

        ConfirmDialog.open({
            tone: "danger",
            title: "Delete Arrange",
            messageLines: [
                "This arrange is the last reference to one or more library patterns.",
                ...warnings,
                "Continue?",
            ],
            choices: [
                {
                    label: "Delete",
                    role: "proceed",
                    callback,
                },
            ],
        });
    };

    const removeBackingFromContext = (ctx: OutlineActionContext) => {
        const element = ctx.outlineSelector.getCurrentElement();
        if (element.type !== "chord") return false;

        const track = ctx.outlineSelector.getCurrHarmonizeTrack();

        switch (track.method) {
            case "piano": {
                const removed = removePianoBacking(ctx, track);
                if (!removed) return false;
                return true;
            } break;
            case "guitar": {
                const removed = removeGuitarBacking(ctx, track);
                if (!removed) return false;
                return true;
            } break;
        }

        return false;
    };

    const removeBackingImmediately = () => {
        const ctx = createContext();
        const removed = removeBackingFromContext(ctx);
        if (!removed) return;

        ctx.commitDataAndRecalculate();
    };

    const removeBacking = () => {
        const ctx = createContext();
        confirmLibraryPatternDelete(
            getRemoveBackingWarnings(ctx),
            removeBackingImmediately,
        );
    };

    const deleteChordImmediately = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();
        if (element.type !== "chord") return;

        const chordData = element.data as ElementState.DataChord;
        if (chordData.degree == undefined) return;

        removeBackingFromContext(ctx);
        chordData.degree = undefined;
        ctx.commitDataAndRecalculate();
    };

    const deleteChord = () => {
        const ctx = createContext();
        confirmLibraryPatternDelete(
            getRemoveBackingWarnings(ctx),
            deleteChordImmediately,
        );
    };

    return {
        applyDefaultVoicing,
        clearVoicingIfChordChanged,
        deleteChord,
        openArrangeEditor,
        openArrangeFinder,
        removeBacking,
    };
};

export default createOutlineBackingActions;
