import ChordTheory from "../../domain/theory/chord-theory";
import { createToast } from "../../service/common/toast-service";
import type ArrangeLibrary from "../../store/state/data/arrange/arrange-library";
import type ArrangeState from "../../store/state/data/arrange/arrange-state";
import PianoEditorState from "../../store/state/data/arrange/piano/piano-editor-state";
import ElementState from "../../store/state/data/element-state";
import ToastState from "../../store/state/toast-state";
import type { OutlineActionContext } from "./outline-actions";

const createOutlineBackingActions = (
    createContext: () => OutlineActionContext,
) => {
    const getChordStructCount = (
        ctx: OutlineActionContext,
        chordData: ElementState.DataChord,
    ) => {
        if (chordData.degree == undefined) return 0;

        const tonality = ctx.derivedSelector.getCurBase().scoreBase.tonality;
        const chord = ChordTheory.getKeyChordFromDegree(tonality, chordData.degree);
        return ChordTheory.getStructsFromKeyChord(chord).length;
    };

    const clearPianoVoicing = (
        ctx: OutlineActionContext,
        track: ArrangeState.Track,
        structCount: number,
    ) => {
        const { chordSeq, baseSeq } = ctx.derived.elementCaches[ctx.outline.focus];
        if (chordSeq === -1 || track.pianoLib == undefined) return false;

        const relation = track.relations.find(r => r.chordSeq === chordSeq);
        if (relation == undefined) return false;

        const chordCache = ctx.derived.chordCaches[chordSeq];
        const scoreBase = ctx.derived.baseCaches[baseSeq].scoreBase;
        const category: ArrangeLibrary.SearchCategory = {
            beat: chordCache.beat.num,
            structCnt: structCount,
            tsGloup: [scoreBase.ts],
            eatHead: chordCache.beat.eatHead,
            eatTail: chordCache.beat.eatTail,
        };

        const [, soundsPattNo] = PianoEditorState.registPattern(
            category,
            null,
            [],
            track.pianoLib,
        );

        relation.sndsPatt = soundsPattNo;
        return true;
    };

    const clearVoicingIfStructCountChanged = (
        ctx: OutlineActionContext,
        beforeCount: number,
        afterCount: number,
    ) => {
        if (beforeCount === afterCount) return false;

        const track = ctx.outlineSelector.getCurrHarmonizeTrack();
        switch (track.method) {
            case "piano":
                return clearPianoVoicing(ctx, track, afterCount);
            case "guitar":
                return false;
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
        track: ArrangeState.Track,
    ) => {
        const { chordSeq, baseSeq } = ctx.derived.elementCaches[ctx.outline.focus];
        if (chordSeq === -1) return false;

        const chordCache = ctx.derived.chordCaches[chordSeq];
        const compiledChord = chordCache.compiledChord;
        const pianoLib = track.pianoLib;
        if (compiledChord == undefined || pianoLib == undefined) return false;

        let relation = track.relations.find(r => r.chordSeq === chordSeq);
        if (relation != undefined) {
            createToast({
                ...ToastState.INITIAL,
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
            tsGloup: [scoreBase.ts],
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
            case "guitar":
                return;
        }
    };

    const removePianoBacking = (
        ctx: OutlineActionContext,
        track: ArrangeState.Track,
    ) => {
        const { chordSeq } = ctx.derived.elementCaches[ctx.outline.focus];
        if (chordSeq === -1) return false;

        const relationIndex = track.relations.findIndex(r => r.chordSeq === chordSeq);
        if (relationIndex === -1) return false;

        track.relations.splice(relationIndex, 1);
        PianoEditorState.deleteUnreferUnit(track);
        return true;
    };

    const removeBacking = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();
        if (element.type !== "chord") return;

        const track = ctx.outlineSelector.getCurrHarmonizeTrack();

        switch (track.method) {
            case "piano": {
                const removed = removePianoBacking(ctx, track);
                if (!removed) return;
                ctx.commitDataAndRecalculate();
            } break;
            case "guitar":
                return;
        }
    };

    return {
        applyDefaultVoicing,
        clearVoicingIfStructCountChanged,
        getChordStructCount,
        openArrangeEditor,
        openArrangeFinder,
        removeBacking,
    };
};

export default createOutlineBackingActions;
