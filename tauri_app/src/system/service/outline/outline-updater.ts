import PianoEditorState from "../../store/state/data/arrange/piano/piano-editor-state";
import type ArrangeState from "../../store/state/data/arrange/arrange-state";
import type ControlState from "../../store/state/control-state";
import type DataState from "../../store/state/data/data-state";
import type DerivedState from "../../store/state/derived-state";
import type ElementState from "../../store/state/data/element-state";
import { createArrangeFinder } from "../arrange/arrange-finder-factory";
import ChordTheory from "../../domain/theory/chord-theory";
import MelodyState from "../../store/state/data/melody-state";

type Context = {
    control: ControlState.Value;
    data: DataState.Value;
    derived: DerivedState.Value;
};

const createOutlineUpdater = (ctx: Context) => {
    const { control, data, derived } = ctx;
    const { outline } = control;

    const getCurrentElement = () => {
        return data.elements[outline.focus];
    };

    const insertElement = (element: ElementState.Element) => {
        const lastChordSeq = derived.elementCaches[outline.focus].lastChordSeq;

        // コード要素を追加する場合は、それ以降のコード連番を1つ後ろにズラす
        if (element.type === "chord") {
            data.arrange.tracks.forEach(track => {
                // 対象要素以降のコード連番を繰り上げ
                track.relations.forEach(relation => {
                    if (relation.chordSeq > lastChordSeq) relation.chordSeq++;
                });
            });
        }

        data.elements.splice(outline.focus + 1, 0, element);
    };

    const moveFocus = (dir: -1 | 1) => {
        outline.focusLock = -1;
        const next = outline.focus + dir;
        if (next < 0 || next > data.elements.length - 1) return false;

        outline.focus = next;
        return true;
    };

    const moveSection = (dir: -1 | 1) => {
        outline.focusLock = -1;

        // sectionタイプのエレメントが見つかるまで走査
        let tempFocus = outline.focus;
        const isIncrement = () =>
            dir === -1 ? tempFocus > 0 : tempFocus < data.elements.length - 1;

        while (isIncrement()) {
            tempFocus += dir;
            if (
                data.elements[tempFocus].type === "section" ||
                tempFocus === data.elements.length - 1
            ) {
                outline.focus = tempFocus;
                return true;
            }
        }

        return false;
    };

    const setChordData = (chordData: ElementState.DataChord) => {
        const element = getCurrentElement();
        if (element.type !== "chord") {
            throw new Error(`chord要素でない。[${element.type}]`);
        }

        element.data = chordData;
    };

    const modSymbol = (dir: "prev" | "next" | "lower" | "upper") => {
        const chordData = getChordData();
        if (chordData.degree == undefined) return false;

        const symbol = chordData.degree.symbol;
        const symbolProps = ChordTheory.getSymbolProps(symbol);
        let nextSymbol: ChordTheory.ChordSymol | undefined;

        switch (dir) {
            case "prev":
                nextSymbol = ChordTheory.getSameLevelSymbol(symbol, -1);
                break;
            case "next":
                nextSymbol = ChordTheory.getSameLevelSymbol(symbol, 1);
                break;
            case "lower":
                nextSymbol = symbolProps.lower;
                break;
            case "upper":
                nextSymbol = symbolProps.upper;
                break;
        }

        if (nextSymbol == undefined) return false;

        chordData.degree.symbol = nextSymbol;
        return true;
    };

    const modRoot = (dir: -1 | 1) => {
        const chordData = getChordData();
        let isBlank = false;
        if (chordData.degree == undefined) {
            chordData.degree = ChordTheory.getDiatonicDegreeChord("major", 0);
            isBlank = true;
        }

        let nextIndex = ChordTheory.getDegree12Index(chordData.degree);
        if (!isBlank) nextIndex += dir;

        if (!isBlank && (nextIndex < 0 || nextIndex > 11)) return false;

        const degree12 = ChordTheory.getDegree12Props(nextIndex, dir === -1);
        chordData.degree = {
            symbol: chordData.degree.symbol,
            ...degree12,
        };
        return true;
    };

    const modBeat = (dir: -1 | 1) => {
        const chordData = getChordData();
        const beat = chordData.beat + dir;
        if (beat < 1 || beat > 4) return false;

        chordData.beat = beat;
        return true;
    };

    /**
     * コードブロックのケツのシンコペーションを増減する
     * @param dir
     */
    const modEat = (dir: -1 | 1) => {
        const chordData = getChordData();
        const eat = chordData.eat + dir;
        if (eat < -2 || eat > 2) return false;

        chordData.eat = eat;
        return true;
    };

    /**
     * 基準をロックして、範囲指定のフォーカスを移動する
     * @param dir
     */
    const moveRange = (dir: -1 | 1) => {
        // フォーカスが未ロックである場合、現在のフォーカスをロックに設定する
        if (outline.focusLock === -1) outline.focusLock = outline.focus;

        const next = outline.focus + dir;
        if (next < 0 || next > data.elements.length - 1) return false;

        outline.focus = next;
        return true;
    };

    const syncChordSeqFromNote = (note: MelodyState.Note) => {
        const cursorPos = MelodyState.calcBeat(note.norm, note.pos);
        const chord = derived.chordCaches.find(
            c =>
                c.startBeatNote <= cursorPos &&
                c.startBeatNote + c.lengthBeatNote > cursorPos,
        );

        if (chord == undefined) throw new Error();

        outline.focus = chord.elementSeq;
    };

    const removeElementFromIndex = (index: number) => {
        const { chordSeq } = derived.elementCaches[index];

        if (chordSeq !== -1) {
            // コード要素の場合、紐づくユニットの削除
            data.arrange.tracks.forEach(track => {
                // コード連番に紐づくアレンジの関連を検索
                const delIndex = track.relations.findIndex(
                    relation => relation.chordSeq === chordSeq,
                );
                // 関連がある場合、関連も合わせて削除する
                if (delIndex !== -1) {
                    track.relations.splice(delIndex, 1);
                    // 不要なライブラリユニットの削除
                    PianoEditorState.deleteUnreferUnit(track);
                }
                // 対象要素以降のコード連番を繰り下げ
                track.relations.forEach(relation => {
                    if (relation.chordSeq > chordSeq) relation.chordSeq--;
                });
            });
        }

        data.elements.splice(index, 1);
    };

    /**
     * フォーカス範囲の要素ブロックを削除する
     */
    const removeFocusElement = () => {
        const { focus, focusLock } = outline;

        let [start, end] = [focus, focus];
        if (focusLock !== -1) {
            [start, end] = focus < focusLock ? [focus, focusLock] : [focusLock, focus];
        }

        // 一つでもコード要素以外が含まれていたら削除できない
        if (start !== end) {
            const canDelete = derived.elementCaches
                .slice(start, end + 1)
                .find(element => element.type !== "chord") == undefined;

            if (!canDelete) return false;
        }

        // 削除時は逆回転する
        for (let i = end; i >= start; i--) {
            removeElementFromIndex(i);
        }
        outline.focus = start - 1;
        outline.focusLock = -1;
        return true;
    };

    const buildArrange = (
        buildDetail: (props: {
            arrange: ArrangeState.EditorProps;
            arrTrack: ArrangeState.Track;
            chordCache: DerivedState.ChordCache;
        }) => void,
    ) => {
        const track = data.arrange.tracks[outline.trackIndex];

        if (track == undefined) return false;

        const { baseCaches, elementCaches, chordCaches } = derived;
        const { chordSeq, baseSeq } = elementCaches[outline.focus];
        if (chordSeq === -1) return false;

        const chordCache = chordCaches[chordSeq];
        const scoreBase = baseCaches[baseSeq].scoreBase;

        if (chordCache.compiledChord == undefined) return false;

        const target: ArrangeState.Target = {
            scoreBase,
            beat: chordCache.beat,
            compiledChord: chordCache.compiledChord,
            chordSeq: chordCache.chordSeq,
        };

        const arrange: ArrangeState.EditorProps = {
            method: track.method,
            target,
        };
        buildDetail({ arrange, arrTrack: track, chordCache });

        outline.arrange = arrange;
        return true;
    };

    const openArrangeEditor = () => {
        return buildArrange(props => {
            const { arrange, arrTrack, chordCache } = props;

            switch (arrTrack.method) {
                case "piano":
                    arrange.editor = PianoEditorState.getEditorProps(
                        chordCache.chordSeq,
                        arrTrack,
                    );
                    break;
            }
        });
    };

    const openArrangeFinder = () => {
        return buildArrange(props => {
            const { arrange, arrTrack, chordCache } = props;

            const ts = derived.baseCaches[chordCache.baseSeq].scoreBase.ts;
            arrange.finder = createArrangeFinder({ arrTrack, ts, chordCache });
        });
    };

    const getChordData = () => {
        const element = getCurrentElement();
        if (element.type !== "chord") {
            throw new Error(`chord要素でない。[${element.type}]`);
        }
        return element.data as ElementState.DataChord;
    };

    return {
        insertElement,
        moveFocus,
        moveSection,
        openArrangeEditor,
        openArrangeFinder,
        removeFocusElement,
        setChordData,
        syncChordSeqFromNote,
        modBeat,
        modEat,
        modRoot,
        modSymbol,
        moveRange,
    };
};

export default createOutlineUpdater;
