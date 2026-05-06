import RhythmTheory from "../../../domain/theory/rhythm-theory";
import TonalityTheory from "../../../domain/theory/tonality-theory";
import MelodyState from "../../../store/state/data/melody-state";
import type DerivedState from "../../../store/state/derived-state";
import type PlaybackCacheState from "./playback-cache-state";

/**
 * ノーツ情報を再生できる形式に変換して返す。
 * @param baseCaches
 * @param currentLeft
 * @param note
 * @returns
 */
const convertNoteToPlayer = (
    baseCaches: DerivedState.BaseCache[],
    currentLeft: number,
    note: MelodyState.Note,
    velocity: number,
): PlaybackCacheState.SoundTimePlayer | null => {
    const side = MelodyState.calcBeatSide(note);
    const [left, right] = [side.pos, side.pos + side.len];
    // 1拍（全音符→4分音符）に基準に合わせる
    // .map(p => p * 4);
    // console.log(`left: ${left}, right: ${right}`);
    // プレビュー開始位置より前のノーツは除外する
    if (left < currentLeft) return null;

    /** 開始時間（ミリ秒） */
    let startMs = 0;
    const getTime = (len: number, tempo: number) => {
        return (60000 / tempo) * len;
    };
    const addStart = (len: number, tempo: number) => {
        startMs += getTime(len, tempo);
    };
    /** 持続時間（ミリ秒） */
    let sustainMs = 0;

    // ベースリストを走査する
    // console.log(baseBlocks);
    baseCaches.some((base) => {
        /** ベースの終端 */
        const end = base.startBeatNote + base.lengthBeatNote;
        const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(base.scoreBase.ts);
        const beatRate = beatDiv16Cnt / 4;
        const tempo = base.scoreBase.tempo * beatRate;

        // ベース範囲内のノーツである場合
        if (left < end) {
            // ベースのルールで持続時間を確定
            sustainMs = getTime(right - left, tempo);

            // ベースの開始からノーツまでの長さを加算
            addStart(left - base.startBeatNote, tempo);

            // ノーツ以降のベースは走査する必要がないためブレイク
            return 1;
        }

        // ベース終端以降のノーツである場合、ベースの持続時間を加算する
        // const start = currentLet + base.startBeatNote;
        // addStart(side.left - start, tempo);
        addStart(base.lengthBeatNote, tempo);
    });

    // プレビュー開始位置の考慮を、演奏開始時間に反映させる
    baseCaches.some((base) => {
        /** ベースの終端 */
        const end = base.startBeatNote + base.lengthBeatNote;
        const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(base.scoreBase.ts);
        const beatRate = beatDiv16Cnt / 4;
        const tempo = base.scoreBase.tempo * beatRate;

        // ベース範囲内の開始位置である場合
        if (currentLeft < end) {
            // ベースの開始からノーツまでの長さを加算
            addStart(-(currentLeft - base.startBeatNote), tempo);

            // ノーツ以降のベースは走査する必要がないためブレイク
            return 1;
        }

        // ベース終端以降のノーツである場合、ベースの持続時間を加算する
        addStart(-base.lengthBeatNote, tempo);
    });

    const pitchName = TonalityTheory.getKey12FullName(note.pitch);
    const gain = 5 * (velocity / 10);
    return {
        startMs,
        gain,
        sustainMs,
        pitchName,
        target: "",
    };
};
export default convertNoteToPlayer;
