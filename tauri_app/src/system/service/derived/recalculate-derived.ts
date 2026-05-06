import Layout from "../../layout/layout-constant";
import ChordTheory from "../../domain/theory/chord-theory";
import RhythmTheory from "../../domain/theory/rhythm-theory";
import TonalityTheory from "../../domain/theory/tonality-theory";
import type DerivedState from "../../store/state/derived-state";
import ElementState from "../../store/state/data/element-state";
import { get } from "svelte/store";
import { dataStore, derivedStore, settingsStore } from "../../store/global-store";

/**
 * dataStore のコミット済み最新状態から derivedStore を再構築する。
 * 未コミットの data snapshot を編集している action 内では直接呼ばず、
 * createCommitDataAndRecalculate 経由して呼ぶ。
 */
export const recalculate = () => {
    const { elements, arrange } = get(dataStore);
    const settings = get(settingsStore);

    const baseCaches: DerivedState.BaseCache[] = [];
    const elementCaches: DerivedState.ElementCache[] = [];
    const chordCaches: DerivedState.ChordCache[] = [];

    const initialScoreBase: ElementState.DataInit = elements[0].data;

    let baseCache: DerivedState.BaseCache = {
        startTime: 0,
        sustainTime: 0,
        startBeat: 0,
        startBeatNote: 0,
        lengthBeat: 0,
        lengthBeatNote: 0,
        viewPosLeft: 0,
        viewPosWidth: 0,
        scoreBase: JSON.parse(JSON.stringify(initialScoreBase)),
        startBar: 1,
        baseSeq: 0
    }

    let startBeat = 0;
    let startBeatNote = 0;
    let elapsedTime = 0;
    let prevEat = 0;

    let lastChordSeq = -1;

    let viewPos = 0;

    let outlineTailPos = ElementState.MARGIN_HEAD;

    let sectionStart: string | undefined = undefined;
    let lastModulate: DerivedState.ModulateCache | undefined = undefined;
    let lastTempo: DerivedState.TempoCache | undefined = undefined;
    let lastTS: DerivedState.TSCache | undefined = undefined;

    let curSection = '';
    elements.forEach((el, i) => {

        const elementCache: DerivedState.ElementCache = {
            // データ要素をディープコピー
            ...JSON.parse(JSON.stringify(el)),
            baseSeq: baseCaches.length,
            elementSeq: i,
            chordSeq: -1,
            lastChordSeq,
            viewHeight: 0,
            outlineTop: outlineTailPos,
            curSection
        }

        // let modulateCache: StoreCache.ModulateCahce | undefined = undefined;
        // let tempoCache: StoreCache.TempoCahce | undefined = undefined;

        switch (el.type) {
            case 'section': {
                const data = el.data as ElementState.DataSection;
                curSection = sectionStart = data.name;
                elementCache.curSection = curSection;
            } break;
            case 'chord': {

                lastChordSeq++;
                elementCache.lastChordSeq = lastChordSeq;

                const data = el.data as ElementState.DataChord;

                let compiledChord: DerivedState.CompiledChord | undefined = undefined;
                if (data.degree != undefined) {
                    const tonality = baseCache.scoreBase.tonality;
                    const chord = ChordTheory.getKeyChordFromDegree(tonality, data.degree);
                    const symbol = ChordTheory.getSymbolProps(chord.symbol);
                    const structs: ChordTheory.ChordStruct[] = symbol.structs.map(s => {
                        if (chord == undefined) throw new Error('chordはundefinedであってはならない。');
                        const interval = ChordTheory.getIntervalFromRelation(s);

                        return {
                            key12: (chord.key12 + interval) % 12,
                            relation: s,
                        }
                    });

                    const on = chord.on;
                    if (on != undefined) {
                        const same = structs.find(s => {
                            return on.key12 === s.key12;
                        });
                        if (same == undefined) {
                            structs.push({
                                key12: on.key12,
                                relation: 'on'
                            });
                        } else {
                            same.relation = 'on';
                        }
                    }

                    compiledChord = { chord, structs };
                }

                /**
                 * 小節跨ぎを判定する
                 * @returns 
                 */
                const judgeStraddle = () => {
                    /** ベース上での経過拍数 */
                    const baseOnBeat = startBeat - baseCache.startBeat;
                    const divCnt = RhythmTheory.getBarDivBeatCount(baseCache.scoreBase.ts);
                    const curBar = Math.floor(baseOnBeat / divCnt);
                    const nextBar = Math.floor((baseOnBeat + data.beat) / divCnt);
                    // 同じ小説に収まっている
                    const isSameBar = curBar === nextBar;
                    // 次の小節の頭に揃っている
                    const isNextFit = (nextBar - curBar === 1 && (baseOnBeat + data.beat) % divCnt === 0);
                    return !(isSameBar || isNextFit);
                };

                const beatDiv16Cnt = RhythmTheory.getBeatDiv16Count(baseCache.scoreBase.ts);
                const beatRate = beatDiv16Cnt / 4;
                const beatSize = data.beat + (prevEat * -1 + data.eat) / beatDiv16Cnt;
                const beatSizeNote = beatSize * beatRate;

                const viewPosLeft = viewPos;
                const viewPosWidth = beatSizeNote * settings.beatWidth;
                viewPos += viewPosWidth;
                // console.log(viewPosLeft);
                // console.log(viewPosWidth);

                const sustainTime = (60000 / baseCache.scoreBase.tempo) * beatSize;
                const isStraddled = judgeStraddle();

                const beat: DerivedState.BeatCache = {
                    num: data.beat,
                    eatHead: prevEat,
                    eatTail: data.eat,
                }

                // アレンジのキャッシュを作成
                const arrs: string[] = [];
                arrange.tracks.forEach((track) => {
                    const relation = track.relations.find(
                        (r) => r.chordSeq === lastChordSeq
                    );
                    if (relation != undefined) {
                        arrs.push(track.name);
                    }
                });
                const chordCache: DerivedState.ChordCache = {
                    chordSeq: lastChordSeq,
                    elementSeq: i,
                    baseSeq: baseCaches.length,
                    beat,
                    compiledChord,
                    startBeat,
                    // lengthBeat: data.beat,
                    lengthBeat: beatSize,
                    startBeatNote,
                    // lengthBeatNote: data.beat * beatRate,
                    lengthBeatNote: beatSizeNote,
                    viewPosLeft,
                    viewPosWidth,
                    sustainTime,
                    startTime: elapsedTime,
                    sectionStart,
                    modulate: lastModulate,
                    tempo: lastTempo,
                    ts: lastTS,
                    arrs,
                    error: isStraddled ? { straddle: true } : undefined,
                };

                startBeat += data.beat;
                startBeatNote += data.beat * beatRate;

                sectionStart = undefined;
                lastModulate = undefined;
                lastTempo = undefined;
                lastTS = undefined;

                chordCaches.push(chordCache);
                elementCache.chordSeq = lastChordSeq;

                // 経過時間の加算
                elapsedTime += sustainTime;
                prevEat = data.eat;
                baseCache.sustainTime += sustainTime;
                baseCache.lengthBeat += data.beat;
                baseCache.lengthBeatNote += data.beat * beatRate;
            } break;
            case 'modulate':
            case 'tempo':
            case 'ts': {

                baseCache.viewPosWidth = viewPos - baseCache.viewPosLeft;
                baseCaches.push(baseCache);

                elementCache.baseSeq++;
                // console.log(baseList);

                // インスタンスを複製
                baseCache = JSON.parse(JSON.stringify(baseCache));

                baseCache.baseSeq++;
                baseCache.viewPosLeft = viewPos;
                // console.log(viewPos);

                baseCache.startTime = elapsedTime;
                // 経過時間をリセット
                baseCache.sustainTime = 0;

                const divCnt = RhythmTheory.getBarDivBeatCount(baseCache.scoreBase.ts);
                baseCache.startBar += Math.ceil(baseCache.lengthBeat / divCnt);

                baseCache.startBeat = baseCache.startBeat + baseCache.lengthBeat;
                baseCache.startBeatNote += baseCache.lengthBeatNote;
                baseCache.lengthBeat = 0;
                baseCache.lengthBeatNote = 0;

                switch (el.type) {
                    case 'modulate': {
                        const data = el.data as ElementState.DataModulate;
                        const tonality = baseCache.scoreBase.tonality;
                        const prevTonality: TonalityTheory.Tonality = JSON.parse(JSON.stringify(tonality));

                        const updateKey12 = (val: number) => {
                            let nextKey12 = tonality.key12 + val;
                            // 負数の場合、整数になるまでオクターブ上げる
                            while (nextKey12 < 0) nextKey12 += 12;
                            tonality.key12 = nextKey12 % 12;
                        }
                        /**スケールを逆転 */
                        const invertScale = () => {
                            tonality.scale = tonality.scale === 'major' ? 'minor' : 'major';
                        }

                        // 転調
                        switch (data.method) {
                            case 'domm': {
                                const val = data.val as number;
                                updateKey12(val * TonalityTheory.DOMMINANT_KEY_COEFFICENT);
                            } break;
                            case 'key': {
                                const val = data.val as number;
                                updateKey12(val);
                            } break;
                            case 'parallel': {
                                invertScale();
                            } break;
                            case 'relative': {
                                let val = TonalityTheory.DOMMINANT_KEY_COEFFICENT * 3;
                                if (tonality.scale === 'minor') val *= -1;
                                updateKey12(val);
                                invertScale();
                            } break;
                        }
                        lastModulate = {
                            prev: prevTonality,
                            next: tonality
                        };
                        elementCache.modulate = lastModulate;
                    } break;
                    case 'tempo': {
                        const data = el.data as ElementState.DataTempo;
                        let tempo = baseCache.scoreBase.tempo;
                        const prev = tempo;

                        switch (data.method) {
                            case 'rate': {
                                tempo = Math.floor(tempo * (data.val / 100));
                            } break;
                            case 'addition': {
                                tempo += data.val;
                            }
                        }
                        lastTempo = {
                            prev, next: tempo
                        };
                        elementCache.tempo = lastTempo;

                        baseCache.scoreBase.tempo = tempo;
                    } break;
                    case 'ts': {
                        const data = el.data as ElementState.DataTS;
                        const prev = JSON.parse(JSON.stringify(baseCache.scoreBase.ts));
                        const next = JSON.parse(JSON.stringify(data.newTS));

                        lastTS = { prev, next };
                        elementCache.ts = lastTS;
                        baseCache.scoreBase.ts = next;
                    } break;
                }
            }
        }
        const getElementViewHeight = () => {
            const EL = Layout.element;
            switch (elementCache.type) {
                case 'init': return (EL.INIT_RECORD_HEIGHT + EL.INIT_RECORD_MARGIN) * 3 + EL.INIT_RECORD_MARGIN;
                case 'section': return EL.SECTION_LABEL_HEIGHT + EL.SECTION_BORDER_HEIGHT + EL.SECTION_TOP_MARGIN + EL.SECTION_BOTTOM_MARGIN;
                case 'chord': {
                    const data = elementCache.data as ElementState.DataChord;
                    let ret = EL.CHORD_SEQ_HEIGHT + EL.CHORD_TIP_HEIGHT + EL.CHORD_DEGREE_HEIGHT;
                    if (data.degree != undefined) ret += EL.CHORD_NAME_HEIGHT;
                    if (chordCaches[lastChordSeq].arrs.length > 0) ret += EL.CHORD_ARR_HEIGHT;
                    return ret;
                }
                case 'modulate':
                case 'tempo':
                case 'ts': return EL.MODULATE_RECRORD_HEIGHT * 3;
            }
            return 0;
        }
        elementCache.viewHeight = getElementViewHeight();
        outlineTailPos += elementCache.viewHeight;
        outlineTailPos += 2; // 上下のボーダー
        outlineTailPos += ElementState.MARGIN_HEAD;

        elementCaches.push(elementCache);
    });

    // 後処理
    baseCache.viewPosWidth = viewPos - baseCache.viewPosLeft;
    baseCaches.push(baseCache);

    derivedStore.set({
        baseCaches, chordCaches, elementCaches, outlineTailPos
    });
};

export const createCommitDataAndRecalculate = (commitData: () => void) => {
    return () => {
        commitData();
        recalculate();
    }
}

export default recalculate;
