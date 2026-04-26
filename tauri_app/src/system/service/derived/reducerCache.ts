import type DataChord from "../../component/outline/element/data/DataChord.svelte";
import type Element from "../../component/outline/element/Element.svelte";
import Layout from "../../layout/layout-constant";
import MusicTheory from "../../domain/theory/music-theory";
import type DerivedState from "../../store/state/derived-state";
import OutlineState from "../../store/state/data/outline-state";
import type { StoreProps } from "../../store/store";
import { get } from "svelte/store";
import { controlStore } from "../../store/global-store";

const useReducerCache = (lastStore: StoreProps) => {
    const control = get(controlStore);
    lastStore.control = control;

    const cache = lastStore.cache;

    const calculate = () => {
        const elements = lastStore.data.elements;

        const baseCaches: DerivedState.BaseCache[] = [];
        const elementCaches: DerivedState.ElementCache[] = [];
        const chordCaches: DerivedState.ChordCache[] = [];

        const initialScoreBase: OutlineState.DataInit = elements[0].data;

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

        let outlineTailPos = OutlineState.MARGIN_HEAD;

        let sectionStart: string | undefined = undefined;
        let lastModulate: DerivedState.ModulateCache | undefined = undefined;
        let lastTempo: DerivedState.TempoCache | undefined = undefined;

        let curSection = '';
        elements.forEach((el, i) => {

            const elementCache: DerivedState.ElementCache = {
                // 郢昴・繝ｻ郢ｧ・ｿ髫補悪・ｴ・ｰ郢ｧ蛛ｵ繝ｧ郢ｧ・｣郢晢ｽｼ郢晏干縺慕ｹ晄鱒繝ｻ
                ...JSON.parse(JSON.stringify(el)),
                baseSeq: baseCaches.length,
                elementSeq: i,
                chordSeq: -1,
                lastChordSeq,
                viewHeight: 0,
                outlineTop: outlineTailPos,
                curSection
            }

            // let modulateCache: DerivedState.ModulateCache | undefined = undefined;
            // let tempoCache: DerivedState.TempoCache | undefined = undefined;

            switch (el.type) {
                case 'section': {
                    const data = el.data as OutlineState.DataSection;
                    curSection = sectionStart = data.name;
                    elementCache.curSection = curSection;
                } break;
                case 'chord': {

                    lastChordSeq++;
                    elementCache.lastChordSeq = lastChordSeq;

                    const data = el.data as OutlineState.DataChord;

                    let compiledChord: DerivedState.CompiledChord | undefined = undefined;
                    if (data.degree != undefined) {
                        const tonality = baseCache.scoreBase.tonality;
                        const chord = MusicTheory.getKeyChordFromDegree(tonality, data.degree);
                        const symbol = MusicTheory.getSymbolProps(chord.symbol);
                        const structs: MusicTheory.ChordStruct[] = symbol.structs.map(s => {
                            if (chord == undefined) throw new Error("chord must not be undefined.");
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
                     * 陝・・・ｯﾂ髴搾ｽｨ邵ｺ蠑ｱ・定崕・､陞ｳ螢ｹ笘・ｹｧ繝ｻ
                     * @returns 
                     */
                    const judgeStraddle = () => {
                        /** 郢晏生繝ｻ郢ｧ・ｹ闕ｳ鄙ｫ縲堤ｸｺ・ｮ驍ｨ遒≫с隲｡閧ｴ辟・*/
                        const baseOnBeat = startBeat - baseCache.startBeat;
                        const divCnt = MusicTheory.getBarDivBeatCount(baseCache.scoreBase.ts);
                        const curBar = Math.floor(baseOnBeat / divCnt);
                        const nextBar = Math.floor((baseOnBeat + data.beat) / divCnt);
                        // 陷ｷ蠕個ｧ陝・臆・ｪ・ｬ邵ｺ・ｫ陷ｿ蠑ｱ竏ｪ邵ｺ・｣邵ｺ・ｦ邵ｺ繝ｻ・・
                        const isSameBar = curBar === nextBar;
                        // 隹ｺ・｡邵ｺ・ｮ陝・・・ｯﾂ邵ｺ・ｮ鬯・ｽｭ邵ｺ・ｫ隰繝ｻ笆ｲ邵ｺ・ｦ邵ｺ繝ｻ・・
                        const isNextFit = (nextBar - curBar === 1 && (baseOnBeat + data.beat) % divCnt === 0);
                        return !(isSameBar || isNextFit);
                    };

                    const beatDiv16Cnt = MusicTheory.getBeatDiv16Count(baseCache.scoreBase.ts);
                    const beatRate = beatDiv16Cnt / 4;
                    const beatSize = (data.beat + (prevEat * -1 + data.eat) / beatDiv16Cnt);
                    const beatSizeNote = (data.beat + (prevEat * -1 + data.eat) / beatDiv16Cnt) * beatRate;

                    const viewPosLeft = viewPos;
                    const viewPosWidth = beatSize * lastStore.settings.beatWidth;
                    viewPos += viewPosWidth;
                    // console.log(viewPosLeft);
                    // console.log(viewPosWidth);

                    const sustainTime = (60000 / baseCache.scoreBase.tempo) * (data.beat + (-prevEat + data.eat) / 4);

                    const beat: DerivedState.BeatCache = {
                        num: data.beat,
                        eatHead: prevEat,
                        eatTail: data.eat,
                    }

                    // 郢ｧ・｢郢晢ｽｬ郢晢ｽｳ郢ｧ・ｸ邵ｺ・ｮ郢ｧ・ｭ郢晢ｽ｣郢昴・縺咏ｹ晢ｽ･郢ｧ蜑・ｽｽ諛医・
                    const arrs: string[] = [];
                    lastStore.data.arrange.tracks.forEach((track) => {
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

                    // 驍ｨ遒≫с隴弱ｋ菫｣邵ｺ・ｮ陷会｣ｰ驍ゅ・
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

                    // 郢ｧ・､郢晢ｽｳ郢ｧ・ｹ郢ｧ・ｿ郢晢ｽｳ郢ｧ・ｹ郢ｧ螳夲ｽ､繝ｻ・｣・ｽ
                    baseCache = JSON.parse(JSON.stringify(baseCache));

                    baseCache.baseSeq++;
                    baseCache.viewPosLeft = viewPos;
                    // console.log(viewPos);

                    baseCache.startTime = elapsedTime;
                    // 驍ｨ遒≫с隴弱ｋ菫｣郢ｧ蛛ｵﾎ懃ｹｧ・ｻ郢昴・繝ｨ
                    baseCache.sustainTime = 0;

                    const divCnt = MusicTheory.getBarDivBeatCount(baseCache.scoreBase.ts);
                    baseCache.startBar += Math.ceil(baseCache.lengthBeat / divCnt);

                    baseCache.startBeat = baseCache.startBeat + baseCache.lengthBeat;
                    baseCache.startBeatNote += baseCache.lengthBeatNote;
                    baseCache.lengthBeat = 0;
                    baseCache.lengthBeatNote = 0;

                    switch (el.type) {
                        case 'modulate': {
                            const data = el.data as OutlineState.DataModulate;
                            const tonality = baseCache.scoreBase.tonality;
                            const prevTonality: MusicTheory.Tonality = JSON.parse(JSON.stringify(tonality));

                            const updateKey12 = (val: number) => {
                                let nextKey12 = tonality.key12 + val;
                                // 髮具｣ｰ隰ｨ・ｰ邵ｺ・ｮ陜｣・ｴ陷ｷ蛹ｻﾂ竏ｵ邏幄ｬｨ・ｰ邵ｺ・ｫ邵ｺ・ｪ郢ｧ荵昶穐邵ｺ・ｧ郢ｧ・ｪ郢ｧ・ｯ郢ｧ・ｿ郢晢ｽｼ郢晉ｴ具ｽｸ鄙ｫ・｡郢ｧ繝ｻ
                                while (nextKey12 < 0) nextKey12 += 12;
                                tonality.key12 = nextKey12 % 12;
                            }
                            /**郢ｧ・ｹ郢ｧ・ｱ郢晢ｽｼ郢晢ｽｫ郢ｧ蟶敖繝ｻ・ｻ・｢ */
                            const invertScale = () => {
                                tonality.scale = tonality.scale === 'major' ? 'minor' : 'major';
                            }

                            // 髴・ｽ｢髫ｱ・ｿ
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
                            const data = el.data as OutlineState.DataTempo;
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
            outlineTailPos += 2; // 闕ｳ雍具ｽｸ荵昴・郢晄㈱繝ｻ郢敖郢晢ｽｼ
            outlineTailPos += OutlineState.MARGIN_HEAD;

            elementCaches.push(elementCache);
        });

        // 陟墓ぁ繝ｻ騾・・
        baseCache.viewPosWidth = viewPos - baseCache.viewPosLeft;
        baseCaches.push(baseCache);

        lastStore.cache = {
            baseCaches, chordCaches, elementCaches, outlineTailPos
        }
    };

    const getChordInfoFromElementSeq = (elementSeq: number) => {
        const cache = lastStore.cache;
        const chordSeq = cache.elementCaches[elementSeq].chordSeq;
        if (chordSeq === -1) throw new Error("elementSeq does not point to a chord.");
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
        const focus = control.outline.focus;
        if (elementCaches[focus] == undefined) throw new Error("elementCache must exist.");
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
        if (element.chordSeq === -1) throw new Error("Current element is not a chord.");
        const chordCache = cache.chordCaches[element.chordSeq];
        return chordCache;
    }

    const getFocusInfo = () => {
        const outline = control.outline;
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

        //郢ｧ・｢郢ｧ・ｯ郢ｧ・ｻ郢ｧ・ｵ
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
