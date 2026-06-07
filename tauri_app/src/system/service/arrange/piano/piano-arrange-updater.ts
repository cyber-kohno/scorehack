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

export type PianoVoicingToggleResult = {
    activated: boolean;
    pitch?: number;
};

const createPianoArrangeUpdater = (ctx: Context) => {
    const { arrange, arrTrack } = ctx;

    const getPianoFinder = () => {
        if (arrange.method !== "piano" || arrange.finder == undefined) throw new Error();
        return arrange.finder as ArrangeLibrary.PianoArrangeFinder;
    };

    const getPianoEditor = () => {
        if (arrange.method !== "piano" || arrange.editor == undefined) throw new Error();
        return arrange.editor as PianoEditorState.Value;
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
        const structs = arrange.target.compiledChord.structs;
        const { voicing } = getVoicingContext();
        const key = `${voicing.cursorX}.${voicing.cursorY}`;
        let result: PianoVoicingToggleResult;

        if (!voicing.items.includes(key)) {
            voicing.items.push(key);
            const struct = structs[voicing.cursorY];
            result = {
                activated: true,
                pitch: struct == undefined
                    ? undefined
                    : struct.key12 + voicing.cursorX * 12,
            };
        } else {
            const pos = voicing.items.findIndex(s => s === key);
            voicing.items.splice(pos, 1);
            result = { activated: false };
        }

        voicing.items.sort((a, b) => {
            const [ax, ay] = a.split(".").map(s => Number(s));
            const [bx, by] = b.split(".").map(s => Number(s));
            return ax * 10 + ay - (bx * 10 + by);
        });

        return result;
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

    const getBacking = () => {
        const backing = getPianoEditor().backing;
        if (backing == null) throw new Error();
        return backing;
    };

    const getCurrentBackingLayer = () => {
        const backing = getBacking();
        return backing.layers[backing.layerIndex];
    };

    const updateBackingNotePosition = (
        item: string,
        updater: (note: PianoBackingState.NoteItem) => PianoBackingState.NoteItem,
    ) => {
        return PianoBackingState.formatNoteItem(
            updater(PianoBackingState.convNotesInfo(item)),
        );
    };

    const moveBackingColCursor = (dir: -1 | 1) => {
        const backing = getBacking();
        const cols = getCurrentBackingLayer().cols;
        const next = backing.cursorX + dir;

        if (next < 0 || next > cols.length - 1) return false;

        backing.cursorX = next;
        return true;
    };

    const createInitialBackingCol = (): PianoBackingState.Col => {
        const backing = getBacking();
        const layer = getCurrentBackingLayer();
        const source = backing.cursorX >= 0 ? layer.cols[backing.cursorX] : undefined;

        return {
            div: source?.div ?? 1,
            dot: source?.dot,
            tuplets: source?.tuplets ?? 1,
            pedal: 0,
        };
    };

    const insertBackingCol = () => {
        const backing = getBacking();
        const layer = getCurrentBackingLayer();
        const cols = layer.cols;
        if (cols.length > Layout.arrange.piano.BACKING_COL_MAX) return false;

        const insertIndex = backing.cursorX + 1;
        cols.splice(insertIndex, 0, createInitialBackingCol());
        layer.items.forEach((item, i) => {
            const note = PianoBackingState.convNotesInfo(item);
            if (insertIndex <= note.colIndex) {
                layer.items[i] = updateBackingNotePosition(item, (note) => ({
                    ...note,
                    colIndex: note.colIndex + 1,
                }));
            }
        });
        return true;
    };

    const deleteBackingCol = () => {
        const backing = getBacking();
        const layer = getCurrentBackingLayer();
        const cols = layer.cols;
        if (backing.cursorX === -1) return false;

        for (let i = layer.items.length - 1; i >= 0; i--) {
            const item = layer.items[i];
            const note = PianoBackingState.convNotesInfo(item);
            if (backing.cursorX === note.colIndex) layer.items.splice(i, 1);
        }
        layer.items.forEach((item, i) => {
            const note = PianoBackingState.convNotesInfo(item);
            if (backing.cursorX < note.colIndex) {
                layer.items[i] = updateBackingNotePosition(item, (note) => ({
                    ...note,
                    colIndex: note.colIndex - 1,
                }));
            }
        });

        cols.splice(backing.cursorX, 1);
        if (backing.cursorX > 0) backing.cursorX--;
        if (cols.length === 0) backing.cursorX = -1;
        return true;
    };

    const setBackingColDiv = (div: number) => {
        const backing = getBacking();
        const col = getCurrentBackingLayer().cols[backing.cursorX];
        if (col == undefined) return false;

        col.div = div / 4;
        col.dot = undefined;
        return true;
    };

    const toggleBackingColDot = () => {
        const backing = getBacking();
        const col = getCurrentBackingLayer().cols[backing.cursorX];
        if (col == undefined || col.div >= 4) return false;

        switch (col.dot) {
            case undefined:
                col.dot = 1;
                break;
            case 1:
                col.dot = undefined;
                break;
        }
        return true;
    };

    const toggleBackingPedal = () => {
        const backing = getBacking();
        const cols = getCurrentBackingLayer().cols;
        const index = backing.cursorX;
        if (index === -1) return false;

        const col = cols[index];
        const prevState = index >= 1 ? cols[index - 1].pedal : 0;
        switch (col.pedal) {
            case 0:
                for (let i = index; i < cols.length; i++) {
                    if (cols[i].pedal === 1) break;
                    cols[i].pedal = 1;
                }
                break;
            case 1:
                if (prevState === 1) {
                    col.pedal = 2;
                } else {
                    for (let i = index; i < cols.length; i++) {
                        cols[i].pedal = 0;
                    }
                }
                break;
            case 2:
                for (let i = index; i < cols.length; i++) {
                    cols[i].pedal = 0;
                }
                break;
        }
        return true;
    };

    const moveBackingRecordCursor = (dir: -1 | 1) => {
        const backing = getBacking();
        const next = backing.cursorY + dir;
        if (next < 0 || next > backing.recordNum - 1) return false;

        backing.cursorY = next;
        return true;
    };

    const insertBackingRecord = () => {
        const backing = getBacking();
        if (backing.recordNum >= Layout.arrange.piano.BACKING_RECORD_MAX) return false;

        backing.recordNum++;
        if (backing.recordNum === 1) {
            backing.cursorY = 0;
            return true;
        }

        backing.layers.forEach((layer) => {
            layer.items.forEach((item, i) => {
                const note = PianoBackingState.convNotesInfo(item);
                if (backing.cursorY < note.recordIndex) {
                    layer.items[i] = updateBackingNotePosition(item, (note) => ({
                        ...note,
                        recordIndex: note.recordIndex + 1,
                    }));
                }
            });
        });
        return true;
    };

    const deleteBackingRecord = () => {
        const backing = getBacking();
        if (backing.recordNum < 1) return false;

        backing.layers.forEach((layer) => {
            for (let i = layer.items.length - 1; i >= 0; i--) {
                const item = layer.items[i];
                const note = PianoBackingState.convNotesInfo(item);
                if (backing.cursorY === note.recordIndex) layer.items.splice(i, 1);
            }
            layer.items.forEach((item, i) => {
                const note = PianoBackingState.convNotesInfo(item);
                if (backing.cursorY < note.recordIndex) {
                    layer.items[i] = updateBackingNotePosition(item, (note) => ({
                        ...note,
                        recordIndex: note.recordIndex - 1,
                    }));
                }
            });
        });

        backing.recordNum--;
        if (backing.recordNum === 0) backing.cursorY = -1;
        if (backing.cursorY > 0) backing.cursorY--;
        return true;
    };

    const adjustBackingNoteCursorRange = () => {
        const backing = getBacking();
        const layer = getCurrentBackingLayer();

        if (backing.cursorX < 0) backing.cursorX = 0;
        if (backing.cursorY < 0) backing.cursorY = 0;
        if (backing.cursorX > layer.cols.length - 1) backing.cursorX = layer.cols.length - 1;
        if (backing.cursorY > backing.recordNum - 1) backing.cursorY = backing.recordNum - 1;
    };

    const moveBackingNoteCursor = (dir: { x?: -1 | 1; y?: -1 | 1 }) => {
        const backing = getBacking();
        backing.cursorX += dir.x ?? 0;
        backing.cursorY += dir.y ?? 0;
        adjustBackingNoteCursorRange();
    };

    const toggleBackingNote = () => {
        const backing = getBacking();
        const layer = getCurrentBackingLayer();
        if (backing.cursorX === -1 || backing.cursorY === -1) return false;

        const key = `${backing.cursorX}.${backing.cursorY}`;
        const noteKeys = PianoBackingState.convRemoveOptionNotes(layer.items);
        const pos = noteKeys.findIndex((item) => item === key);
        if (pos === -1) layer.items.push(key);
        else layer.items.splice(pos, 1);
        return true;
    };

    const modifyBackingNote = (modifier: (note: PianoBackingState.NoteItem) => PianoBackingState.NoteItem) => {
        const backing = getBacking();
        const layer = getCurrentBackingLayer();
        const itemIndex = layer.items.findIndex((item) => {
            const note = PianoBackingState.convNotesInfo(item);
            return note.colIndex === backing.cursorX && note.recordIndex === backing.cursorY;
        });
        if (itemIndex === -1) return false;

        const item = layer.items[itemIndex];
        layer.items[itemIndex] = PianoBackingState.formatNoteItem(
            modifier(PianoBackingState.convNotesInfo(item)),
        );
        return true;
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
            const editor = arrange.editor as PianoEditorState.Value;

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
        const patternData = PianoEditorState.createPatternData(editor);
        // 検索用カテゴリの作成
        const category: ArrangeLibrary.SearchCategory = {
            beat: beatCache.num,
            structCnt: compiledChord.structs.length,
            tsGloup: [scoreBase.rhythm.ts],
            eatHead: beatCache.eatHead,
            eatTail: beatCache.eatTail,
        };
        // 新しいパターンの場合は登録してパターンNoをそれぞれ取得
        const [backingPattNo, soundsPattNo] = PianoEditorState.registPattern(
            category,
            patternData.backing,
            patternData.sounds,
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
        deleteBackingCol,
        deleteBackingRecord,
        insertBackingCol,
        insertBackingRecord,
        modifyBackingNote,
        moveBackingColCursor,
        moveBackingNoteCursor,
        moveBackingRecordCursor,
        openFinderFromEditor,
        shiftControl,
        shiftLayer,
        setBackingColDiv,
        toggleBackingColDot,
        toggleBackingNote,
        toggleBackingPedal,
        toggleVoicing,
    };
};

export default createPianoArrangeUpdater;
