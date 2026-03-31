import type DataChord from "../../component/outline/element/data/DataChord.svelte";
import type Element from "../../component/outline/element/Element.svelte";
import Layout from "../../const/layout";
import MusicTheory from "../../util/musicTheory";
import type StoreCache from "../props/storeCache";
import StoreOutline from "../props/storeOutline";
import type { StoreProps } from "../store";

const useReducerCache = (lastStore: StoreProps) => {

    const cache = lastStore.cache;

    const calculate = () => {
        const elements = lastStore.data.elements;

        const baseCaches: StoreCache.BaseCache[] = [];
        const elementCaches: StoreCache.ElementCache[] = [];
        const chordCaches: StoreCache.ChordCache[] = [];

        const initialScoreBase: StoreOutline.DataInit = elements[0].data;

        let baseCache: StoreCache.BaseCache = {
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

        let outlineTailPos = StoreOutline.MARGIN_HEAD;

        let sectionStart: string | undefined = undefined;
        let lastModulate: StoreCache.ModulateCahce | undefined = undefined;
        let lastTempo: StoreCache.TempoCahce | undefined = undefined;

        let curSection = '';
        elements.forEach((el, i) => {

            const elementCache: StoreCache.ElementCache = {
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
                    const data = el.data as StoreOutline.DataSection;
                    curSection = sectionStart = data.name;
                    elementCache.curSection = curSection;
                } break;
                case 'chord': {

                    lastChordSeq++;
                    elementCache.lastChordSeq = lastChordSeq;

                    const data = el.data as StoreOutline.DataChord;

                    let compiledChord: StoreCache.CompiledChord | undefined = undefined;
                    if (data.degree != undefined) {
                        const tonality = baseCache.scoreBase.tonality;
                        const chord = MusicTheory.getKeyChordFromDegree(tonality, data.degree);
                        const symbol = MusicTheory.getSymbolProps(chord.symbol);
                        const structs: MusicTheory.ChordStruct[] = symbol.structs.map(s => {
                            if (chord == undefined) throw new Error('chordはundefinedであってはならない。');
                            const interval = MusicTheory.getIntervalFromRelation(s);

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
                        const divCnt = MusicTheory.getBarDivBeatCount(baseCache.scoreBase.ts);
                        const curBar = Math.floor(baseOnBeat / divCnt);
                        const nextBar = Math.floor((baseOnBeat + data.beat) / divCnt);
                        // 同じ小説に収まっている
                        const isSameBar = curBar === nextBar;
                        // 次の小節の頭に揃っている
                        const isNextFit = (nextBar - curBar === 1 && (baseOnBeat + data.beat) % divCnt === 0);
                        return !(isSameBar || isNextFit);
                    };

                    const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(baseCache.scoreBase.ts);
                    const beatRate = beatDiv16Cnt / 4;
                    const beatSize = (data.beat + (prevEat * -1 + data.eat) / beatDiv16Cnt);
                    const beatSizeNote = (data.beat + (prevEat * -1 + data.eat) / beatDiv16Cnt) * beatRate;

                    const viewPosLeft = viewPos;
                    const viewPosWidth = beatSize * lastStore.env.beatWidth;
                    viewPos += viewPosWidth;
                    // console.log(viewPosLeft);
                    // console.log(viewPosWidth);

                    const sustainTime = (60000 / baseCache.scoreBase.tempo) * (data.beat + (-prevEat + data.eat) / 4);

                    const beat: StoreCache.BeatCache = {
                        num: data.beat,
                        eatHead: prevEat,
                        eatTail: data.eat,
                    }

                    // アレンジのキャッシュを作成
                    const arrs: string[] = [];
                    lastStore.data.arrange.tracks.forEach((track) => {
                        const relation = track.relations.find(
                            (r) => r.chordSeq === lastChordSeq
                        );
                        if (relation != undefined) {
                            arrs.push(track.name);
                        }
                    });
                    const chordCache: StoreCache.ChordCache = {
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
                        arrs
                    };

                    // startBeat += data.beat;
                    startBeat += beatSize;
                    // startBeatNote += data.beat * beatRate;
                    startBeatNote += beatSizeNote;

                    sectionStart = undefined;
                    lastModulate = undefined;
                    lastTempo = undefined;

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
                case 'tempo': {

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

                    const divCnt = MusicTheory.getBarDivBeatCount(baseCache.scoreBase.ts);
                    baseCache.startBar += Math.ceil(baseCache.lengthBeat / divCnt);

                    baseCache.startBeat = baseCache.startBeat + baseCache.lengthBeat;
                    baseCache.startBeatNote += baseCache.lengthBeatNote;
                    baseCache.lengthBeat = 0;
                    baseCache.lengthBeatNote = 0;

                    switch (el.type) {
                        case 'modulate': {
                            const data = el.data as StoreOutline.DataModulate;
                            const tonality = baseCache.scoreBase.tonality;
                            const prevTonality: MusicTheory.Tonality = JSON.parse(JSON.stringify(tonality));

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
                                    updateKey12(val * MusicTheory.DOMMINANT_KEY_COEFFICENT);
                                } break;
                                case 'key': {
                                    const val = data.val as number;
                                    updateKey12(val);
                                } break;
                                case 'parallel': {
                                    invertScale();
                                } break;
                                case 'relative': {
                                    let val = MusicTheory.DOMMINANT_KEY_COEFFICENT * 3;
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
                            const data = el.data as StoreOutline.DataTempo;
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
                    }
                }
            }
            const getElementViewHeight = () => {
                const EL = Layout.element;
                switch (elementCache.type) {
                    case 'init': return (EL.INIT_RECORD_HEIGHT + EL.INIT_RECORD_MARGIN) * 3 + EL.INIT_RECORD_MARGIN;
                    case 'section': return EL.SECTION_LABEL_HEIGHT + EL.SECTION_BORDER_HEIGHT + EL.SECTION_TOP_MARGIN + EL.SECTION_BOTTOM_MARGIN;
                    case 'chord': {
                        const data = elementCache.data as DataChord;
                        let ret = EL.CHORD_SEQ_HEIGHT + EL.CHORD_TIP_HEIGHT + EL.CHORD_DEGREE_HEIGHT;
                        if (data.degree != undefined) ret += EL.CHORD_NAME_HEIGHT;
                        if(chordCaches[lastChordSeq].arrs.length > 0) ret += EL.CHORD_ARR_HEIGHT;
                        return ret;
                    }
                    case 'modulate': return EL.MODULATE_RECRORD_HEIGHT * 3;
                }
                return 0;
            }
            elementCache.viewHeight = getElementViewHeight();
            outlineTailPos += elementCache.viewHeight;
            outlineTailPos += 2; // 上下のボーダー
            outlineTailPos += StoreOutline.MARGIN_HEAD;

            elementCaches.push(elementCache);
        });

        // 後処理
        baseCache.viewPosWidth = viewPos - baseCache.viewPosLeft;
        baseCaches.push(baseCache);

        lastStore.cache = {
            baseCaches, chordCaches, elementCaches, outlineTailPos
        }
    };

    const getChordInfoFromElementSeq = (elementSeq: number) => {
        const cache = lastStore.cache;
        const chordSeq = cache.elementCaches[elementSeq].chordSeq;
        if (chordSeq === -1) throw new Error(`elementSeq[${elementSeq}]のchordSeqが存在しない。（コードでない要素でgetChordInfoFromElementSeqを呼び出した。）`);
        return cache.chordCaches[chordSeq];
    }

    const getChordTail = () => {
        const chordCaches = cache.chordCaches;
        return chordCaches[chordCaches.length - 1];
    }
    const getBeatNoteTail = () => {
        const tail = getChordTail();
        return tail.startBeatNote + tail.lengthBeatNote;
    }
    const getChordBlockRight = () => {
        const chordCaches = cache.chordCaches;
        if (chordCaches.length === 0) return 0;
        const chordCache = chordCaches[chordCaches.length - 1];
        return chordCache.viewPosLeft + chordCache.viewPosWidth;
    }

    const getCurElement = () => {
        const { elementCaches } = cache;
        const focus = lastStore.control.outline.focus;
        if (elementCaches[focus] == undefined) throw new Error('elementCacheが生成されていない時に呼び出してはならない。');
        return elementCaches[focus];
    }
    const getCurBase = () => {
        const element = getCurElement();
        return cache.baseCaches[element.baseSeq];
    }
    const getBaseFromBeat = (pos: number) => {
        const base = cache.baseCaches.find(b => {
            return b.startBeatNote <= pos && pos < b.startBeatNote + b.lengthBeatNote;
        });
        if (base == undefined) throw new Error();
        return base;
    }
    const getChordFromBeat = (pos: number) => {
        const chord = cache.chordCaches.find(c => {
            return c.startBeatNote <= pos && pos < c.startBeatNote + c.lengthBeatNote;
        });
        if (chord == undefined) throw new Error();
        return chord;
    }
    const getCurChord = () => {
        const element = getCurElement();
        if (element.chordSeq === -1) throw new Error('コード要素でないところで呼び出された。');
        const chordCache = cache.chordCaches[element.chordSeq];
        return chordCache;
    }

    const getFocusInfo = () => {
        const outline = lastStore.control.outline;
        const elementCache = cache.elementCaches[outline.focus];
        const chordCaches = cache.chordCaches;

        const lastChordSeq = elementCache.lastChordSeq;
        const chordSeq = elementCache.chordSeq;
        let left = 0;
        let width = 20;
        let isChord = false;
        if (chordSeq === -1) {

            if (lastChordSeq !== -1) {
                const chordCache = chordCaches[lastChordSeq];
                left = chordCache.viewPosLeft + chordCache.viewPosWidth;
            }
        } else {
            const chordCache = chordCaches[chordSeq];
            left = chordCache.viewPosLeft;
            width = chordCache.viewPosWidth;
            isChord = true;
        }
        return { left, width, isChord };
    }

    return {
        calculate,

        //アクセサ
        getChordInfoFromElementSeq,
        getBeatNoteTail,
        getChordBlockRight,
        getCurElement,
        getCurBase,
        getCurChord,
        getBaseFromBeat,
        getChordFromBeat,
        getFocusInfo
    };
}

export default useReducerCache;