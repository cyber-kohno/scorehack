import type RhythmTheory from "../../domain/theory/rhythm-theory";
import ArrangeLibrary from "../../store/state/data/arrange/arrange-library";
import type ArrangeState from "../../store/state/data/arrange/arrange-state";
import type DerivedState from "../../store/state/derived-state";

export type ArrangeFinderProps = {
    ts: RhythmTheory.TimeSignature;
    chordCache: DerivedState.ChordCache;
    arrTrack: ArrangeState.Track;
};

type PianoFinderSource = {
    ts: RhythmTheory.TimeSignature;
    beat: DerivedState.BeatCache;
    compiledChord: DerivedState.CompiledChord;
    chordSeq: number;
    arrTrack: ArrangeState.Track;
};

/**
 * メソッドに応じたファインダーを生成して返す
 */
export const createArrangeFinder = (props: ArrangeFinderProps) => {
    switch (props.arrTrack.method) {
        case "piano":
            return createPianoArrangeFinder(props);
    }
};

/**
 * ピアノ用のファインダーを生成して返す。
 */
export const createPianoArrangeFinder = (props: ArrangeFinderProps) => {
    const { ts, chordCache: chord, arrTrack } = props;
    const compiledChord = chord.compiledChord;
    if (compiledChord == undefined) throw new Error();

    return createPianoArrangeFinderFromSource({
        ts,
        beat: chord.beat,
        compiledChord,
        chordSeq: chord.chordSeq,
        arrTrack,
    });
};

export const createPianoArrangeFinderFromTarget = (props: {
    target: ArrangeState.Target;
    arrTrack: ArrangeState.Track;
}) => {
    const { target, arrTrack } = props;

    return createPianoArrangeFinderFromSource({
        ts: target.scoreBase.ts,
        beat: target.beat,
        compiledChord: target.compiledChord,
        chordSeq: target.chordSeq,
        arrTrack,
    });
};

const createPianoArrangeFinderFromSource = (props: PianoFinderSource) => {
    const { ts, beat, compiledChord, chordSeq, arrTrack } = props;
    const req: ArrangeLibrary.SearchRequest = {
        beat: beat.num,
        eatHead: beat.eatHead,
        eatTail: beat.eatTail,
        structCnt: compiledChord.structs.length,
        ts,
    };

    const finder: ArrangeLibrary.PianoArrangeFinder = {
        cursor: { backing: -1, sounds: -1 },
        apply: { backing: -1, sounds: -1 },
        request: req,
        list: ArrangeLibrary.searchPianoPatterns({
            req,
            arrTrack,
            isFilterPatternOnly: false,
        }),
    };

    if (finder.list.length > 0) {
        // コード連番と参照先ライブラリの紐付け
        const relations = arrTrack.relations;
        const relation = relations.find(r => r.chordSeq === chordSeq);
        if (relation != undefined) {
            const bkgPatt = finder.list.findIndex(f => f.bkgPatt === relation.bkgPatt);
            const sndPatt = finder.list[bkgPatt].voics.findIndex(v => v === relation.sndsPatt);

            if (bkgPatt === -1 || sndPatt === -1) throw new Error();
            finder.cursor.backing = finder.apply.backing = bkgPatt;
            finder.cursor.sounds = finder.apply.sounds = sndPatt;
        }
    }

    return finder;
};
