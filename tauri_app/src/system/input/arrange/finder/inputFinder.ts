import PianoBackingState from "../../../store/state/data/arrange/piano/piano-backing-state";
import PianoEditorState from "../../../store/state/data/arrange/piano/piano-editor-state";
import type StoreInput from "../../../store/state/input-state";
import ArrangeUtil from "../../../service/arrange/arrangeUtil";
import useReducerCache from "../../../service/derived/reducerCache";
import type { StoreUtil } from "../../../store/store";
import { get } from "svelte/store";
import { controlStore } from "../../../store/global-store";

const useInputFinder = (storeUtil: StoreUtil) => {
    const { lastStore, commit } = storeUtil;
    const controlStoreValue = get(controlStore);
    lastStore.control = controlStoreValue;

    const outline = controlStoreValue.outline;
    const arrange = outline.arrange;

    const arrangeReducer = ArrangeUtil.useReducer(lastStore);
    const cacheReducer = useReducerCache(lastStore);

    const control = (eventKey: string) => {
        if (arrange == null) throw new Error();
        const finder = arrangeReducer.getPianoFinder();

        // const isEditor = arrange?.editor;

        const arrTrack = arrangeReducer.getCurTrack();

        const element = cacheReducer.getCurElement();
        const chordSeq = element.chordSeq;
        if (chordSeq === -1) throw new Error();

        const moveBackingList = (dir: -1 | 1) => {
            const temp = finder.cursor.backing + dir;
            if (temp >= -1 && temp <= finder.list.length - 1) {
                finder.cursor.sounds = -1;
                // 移動する前に列のスクロールをリセットする
                // adjustPattColumnScroll(finder);
                finder.cursor.backing = temp;
                // adjustPattRecordScroll(finder);
                commit();
            }
        }

        const moveVoicingList = (dir: -1 | 1) => {
            if (finder.cursor.backing === -1) return;
            const voics = finder.list[finder.cursor.backing].voics;
            const temp = finder.cursor.sounds + dir;
            if (temp >= -1 && temp <= voics.length - 1) {
                finder.cursor.sounds = temp;
                // adjustPattColumnScroll(finder);
                commit();
            }
        }

        /**
         * パターンを適用する（アウトラインから直接起動時と、エディタから起動時で分岐）
         */
        const applyPattern = () => {
            if (finder.cursor.backing === -1) return;

            const usageBkg = finder.list[finder.cursor.backing];
            const bkgPattNo = usageBkg.bkgPatt;
            const sndsPattNo = usageBkg.voics[finder.cursor.sounds];
            const lib = arrangeReducer.getPianoLib();
            const bkgPatt = lib.backingPatterns.find(patt => patt.no === bkgPattNo);
            if (bkgPatt == undefined) throw new Error();
            const sndsPatt = lib.soundsPatterns.find(patt => patt.no === sndsPattNo);

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
            }

            // アウトラインから直接ファインダーを開いている場合
            if (arrange.editor == undefined) {
                // ボイシングが選択されていない場合、エディタを開いて適用する
                if (sndsPatt == undefined) {
                    arrange.editor = PianoEditorState.getEditorProps(chordSeq, arrTrack);
                    applyToEditor();
                } else {
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
                    controlStoreValue.outline.arrange = null;
                    cacheReducer.calculate();
                }
            }
            // エディタからファインダーを開いている場合 
            else applyToEditor();
            commit();
        }

        switch (eventKey) {
            case 'Escape':
            case 'w': {
                if (arrange.editor == undefined) outline.arrange = null;
                else delete arrange.finder;
                commit();
                break;
            }
            case 'ArrowLeft': moveVoicingList(-1); break;
            case 'ArrowRight': moveVoicingList(1); break;
            case 'ArrowUp': moveBackingList(-1); break;
            case 'ArrowDown': moveBackingList(1); break;

            case 'Enter': {
                applyPattern();
            } break;
        }
    }

    const getHoldCallbacks = (eventKey: string): StoreInput.Callbacks => {
        if (arrange == null) throw new Error();

        const callbacks: StoreInput.Callbacks = {};

        return callbacks;
    }

    return {
        control,
        getHoldCallbacks
    };
}
export default useInputFinder;
