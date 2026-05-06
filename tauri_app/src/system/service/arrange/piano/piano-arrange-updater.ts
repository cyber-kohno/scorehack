import Layout from "../../../layout/layout-constant";
import ChordTheory from "../../../domain/theory/chord-theory";
import type ArrangeLibrary from "../../../store/state/data/arrange/arrange-library";
import type ArrangeState from "../../../store/state/data/arrange/arrange-state";
import PianoBackingState from "../../../store/state/data/arrange/piano/piano-backing-state";
import PianoEditorState from "../../../store/state/data/arrange/piano/piano-editor-state";
import { createPianoArrangeFinderFromTarget } from "../arrange-finder-factory";

type Context = {
    arrange: ArrangeState.EditorProps;
    arrTrack: ArrangeState.Track;
};

const createPianoArrangeUpdater = (ctx: Context) => {
    const { arrange, arrTrack } = ctx;

    const getPianoFinder = () => {
        if (arrange.method !== "piano" || arrange.finder == undefined) throw new Error();
        return arrange.finder as ArrangeLibrary.PianoArrangeFinder;
    };

    const getPianoEditor = () => {
        if (arrange.method !== "piano" || arrange.editor == undefined) throw new Error();
        return arrange.editor as PianoEditorState.Props;
    };

    const getPianoLib = () => {
        if (arrTrack.method !== "piano" || arrTrack.pianoLib == undefined) throw new Error();
        return arrTrack.pianoLib;
    };

    const moveFinderBacking = (dir: -1 | 1) => {
        const finder = getPianoFinder();
        const temp = finder.cursor.backing + dir;

        if (temp < -1 || temp > finder.list.length - 1) return false;

        finder.cursor.sounds = -1;
        // 移動する前に列のスクロールをリセットする
        // adjustPattColumnScroll(finder);
        finder.cursor.backing = temp;
        // adjustPattRecordScroll(finder);
        return true;
    };

    const moveFinderVoicing = (dir: -1 | 1) => {
        const finder = getPianoFinder();

        if (finder.cursor.backing === -1) return false;

        const voics = finder.list[finder.cursor.backing].voics;
        const temp = finder.cursor.sounds + dir;

        if (temp < -1 || temp > voics.length - 1) return false;

        finder.cursor.sounds = temp;
        // adjustPattColumnScroll(finder);
        return true;
    };

    const openFinderFromEditor = () => {
        arrange.finder = createPianoArrangeFinderFromTarget({
            target: arrange.target,
            arrTrack,
        });
    };

    const getVoicingContext = () => {
        const editor = getPianoEditor();
        const compiledChord = arrange.target.compiledChord;
        const structs = compiledChord.structs;
        let structCnt = structs.length;
        const onChord = compiledChord.chord.on;

        if (onChord != undefined) {
            const rel = ChordTheory.getRelationFromInterval(onChord.key12);
            if (!structs.map(s => s.relation).includes(rel)) structCnt++;
        }

        return {
            voicing: editor.voicing,
            structCnt,
        };
    };

    const adjustVoicingCursor = () => {
        const { voicing, structCnt } = getVoicingContext();
        const octaveMax = Layout.arrange.piano.VOICING_OCTAVE_MAX;

        if (voicing.cursorX < 0) voicing.cursorX = 0;
        if (voicing.cursorY < 0) voicing.cursorY = 0;
        if (voicing.cursorX > octaveMax - 1) voicing.cursorX = octaveMax - 1;
        if (voicing.cursorY > structCnt - 1) voicing.cursorY = structCnt - 1;
    };

    const moveVoicingCursor = (dir: { x?: -1 | 1; y?: -1 | 1 }) => {
        const { voicing } = getVoicingContext();

        voicing.cursorX += dir.x ?? 0;
        voicing.cursorY += dir.y ?? 0;
        adjustVoicingCursor();
    };

    const toggleVoicing = () => {
        const { voicing } = getVoicingContext();
        const key = `${voicing.cursorX}.${voicing.cursorY}`;

        if (!voicing.items.includes(key)) {
            voicing.items.push(key);
        } else {
            const pos = voicing.items.findIndex(s => s === key);
            voicing.items.splice(pos, 1);
        }

        voicing.items.sort((a, b) => {
            const [ax, ay] = a.split(".").map(s => Number(s));
            const [bx, by] = b.split(".").map(s => Number(s));
            return ax * 10 + ay - (bx * 10 + by);
        });
    };

    const shiftControl = (next: PianoEditorState.Control) => {
        const editor = getPianoEditor();

        editor.control = next;
        // editor.phase = 'target';
        // PBEditor.initCursor(editor);
    };

    const shiftLayer = () => {
        const editor = getPianoEditor();
        const backing = editor.backing;
        if (backing == null) throw new Error();

        backing.layerIndex = backing.layerIndex === 0 ? 1 : 0;
        backing.cursorX = -1;
        editor.control = "record";
    };

    /**
     * パターンを適用する（アウトラインから直接起動時と、エディタから起動時で分岐）
     */
    const applyFinderPattern = () => {
        const finder = getPianoFinder();

        if (finder.cursor.backing === -1) return { control: false, data: false, closeArrange: false };

        const usageBkg = finder.list[finder.cursor.backing];
        const bkgPattNo = usageBkg.bkgPatt;
        const sndsPattNo = usageBkg.voics[finder.cursor.sounds];
        const lib = getPianoLib();
        const bkgPatt = lib.backingPatterns.find(patt => patt.no === bkgPattNo);
        if (bkgPatt == undefined) throw new Error();
        const sndsPatt = lib.soundsPatterns.find(patt => patt.no === sndsPattNo);

        const chordSeq = arrange.target.chordSeq;

        // 選択したパターンをエディタに対して適用する
        const applyToEditor = () => {
            if (arrange.editor == undefined) throw new Error();
            const editor = arrange.editor as PianoEditorState.Props;

            const backing = PianoBackingState.createInitialBackingProps();
            editor.backing = backing;
            backing.layers = JSON.parse(JSON.stringify(bkgPatt.backing.layers));
            backing.recordNum = bkgPatt.backing.recordNum;

            // ボイシングは未設定の可能性があるため初期化しておく
            editor.voicing.items.length = 0;
            if (sndsPatt != undefined) {
                editor.voicing.items = JSON.parse(JSON.stringify(sndsPatt.sounds));
            }
            delete arrange.finder;
        };

        // アウトラインから直接ファインダーを開いている場合
        if (arrange.editor == undefined) {
            // ボイシングが選択されていない場合、エディタを開いて適用する
            if (sndsPatt == undefined) {
                arrange.editor = PianoEditorState.getEditorProps(chordSeq, arrTrack);
                applyToEditor();
                return { control: true, data: false, closeArrange: false };
            }

            // コード連番と参照先ライブラリの紐付け
            const relations = arrTrack.relations;
            let relation = relations.find(r => r.chordSeq === chordSeq);
            if (relation == undefined) {
                // 未定義の場合は紐づけを新たに作成して追加
                relation = { chordSeq, bkgPatt: -1, sndsPatt: -1 };
                relations.push(relation);
            } else {
                // 紐付けが変わったことにより不参照のピアノライブラリのパターンを削除
                PianoEditorState.deleteUnreferUnit(arrTrack);
            }
            relation.bkgPatt = bkgPatt.no;
            relation.sndsPatt = sndsPatt.no;
            return { control: true, data: true, closeArrange: true };
        }

        // エディタからファインダーを開いている場合
        applyToEditor();
        return { control: true, data: false, closeArrange: false };
    };

    /**
     * エディタのアレンジをコード要素に適用する
     */
    const applyArrange = () => {
        const editor = getPianoEditor();

        const compiledChord = arrange.target.compiledChord;
        const scoreBase = arrange.target.scoreBase;
        const beatCache = arrange.target.beat;
        const chordSeq = arrange.target.chordSeq;

        // パターンの登録
        const pianoLib = arrTrack.pianoLib;
        if (pianoLib == undefined) throw new Error();

        // 有効チャンネル外のノーツは削除する
        const backing = editor.backing;
        let backingData: PianoBackingState.DataProps | null = null;
        if (backing != null) {
            backing.layers.forEach(l => {
                l.items = l.items.filter(item => {
                    const [x, y] = item.split(".").map(v => Number(v));
                    return (
                        x >= 0 &&
                        x <= l.cols.length - 1 &&
                        y >= 0 &&
                        y <= editor.voicing.items.length - 1
                    );
                });
            });
            backingData = {
                layers: JSON.parse(JSON.stringify(backing.layers)),
                recordNum: backing.recordNum,
            };
        }
        const sounds = JSON.parse(JSON.stringify(editor.voicing.items));
        // 検索用カテゴリの作成
        const category: ArrangeLibrary.SearchCategory = {
            beat: beatCache.num,
            structCnt: compiledChord.structs.length,
            tsGloup: [scoreBase.ts],
            eatHead: beatCache.eatHead,
            eatTail: beatCache.eatTail,
        };
        // 新しいパターンの場合は登録してパターンNoをそれぞれ取得
        const [backingPattNo, soundsPattNo] = PianoEditorState.registPattern(
            category,
            backingData,
            sounds,
            pianoLib,
        );

        // コード連番と参照先ライブラリの紐付け
        const relations = arrTrack.relations;
        const relation = relations.find(r => r.chordSeq === chordSeq);
        if (relation == undefined) {
            // 未定義の場合は新規追加
            relations.push({
                chordSeq,
                bkgPatt: backingPattNo,
                sndsPatt: soundsPattNo,
            });
        } else {
            // 既定義の場合は更新
            relation.bkgPatt = backingPattNo;
            relation.sndsPatt = soundsPattNo;

            // 紐付けが変わったことにより不参照のピアノライブラリのパターンを削除
            PianoEditorState.deleteUnreferUnit(arrTrack);
        }
    };

    return {
        applyArrange,
        applyFinderPattern,
        moveFinderBacking,
        moveFinderVoicing,
        moveVoicingCursor,
        openFinderFromEditor,
        shiftControl,
        shiftLayer,
        toggleVoicing,
    };
};

export default createPianoArrangeUpdater;
