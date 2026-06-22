import type RhythmTheory from "../../domain/theory/rhythm-theory";
import FinderState from "../../store/state/data/arrange/finder-state";
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
    arrTrack: ArrangeState.PianoTrack;
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
    if (arrTrack.method !== "piano") throw new Error();
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
    arrTrack: ArrangeState.PianoTrack;
}) => {
    const { target, arrTrack } = props;

    return createPianoArrangeFinderFromSource({
        ts: target.scoreBase.rhythm.ts,
        beat: target.beat,
        compiledChord: target.compiledChord,
        chordSeq: target.chordSeq,
        arrTrack,
    });
};

const createPianoArrangeFinderFromSource = (props: PianoFinderSource) => {
    const { ts, beat, compiledChord, chordSeq, arrTrack } = props;
    const req: FinderState.SearchRequest = {
        beat: beat.num,
        eatHead: beat.eatHead,
        eatTail: beat.eatTail,
        structCnt: compiledChord.structs.length,
        ts,
    };

    const list = FinderState.searchPianoPatterns({
        req,
        arrTrack,
        isFilterPatternOnly: false,
    });
    const finder: FinderState.PianoArrangeFinder = {
        cursor: { backing: list.length === 0 ? -1 : 0, sounds: -1 },
        apply: { backing: -1, sounds: -1 },
        request: req,
        list,
    };

    if (finder.list.length > 0) {
        // コード連番と参照先ライブラリの紐付け
        const relations = arrTrack.relations;
        const relation = relations.find(r => r.chordSeq === chordSeq);
        if (relation != undefined) {
            const bkgPatt = finder.list.findIndex(f => f.backingNo === relation.bkgPatt);
            if (bkgPatt === -1) throw new Error();
            const sndPatt = finder.list[bkgPatt].soundsNos.findIndex(v => v === relation.sndsPatt);

            if (sndPatt === -1) throw new Error();
            finder.cursor.backing = finder.apply.backing = bkgPatt;
            finder.cursor.sounds = finder.apply.sounds = sndPatt;
        }
    }

    return finder;
};
