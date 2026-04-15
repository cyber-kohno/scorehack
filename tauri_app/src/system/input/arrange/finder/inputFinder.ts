import StorePianoBacking from "../../../store/props/arrange/piano/storePianoBacking";
import StorePianoEditor from "../../../store/props/arrange/piano/storePianoEditor";
import type StoreInput from "../../../store/props/storeInput";
import { getCurrentOutlineElementCache } from "../../../../state/cache-state/outline-cache";
import { createCacheActions } from "../../../../app/cache/cache-actions";
import ArrangeUtil from "../../../store/reducer/arrangeUtil";
import useReducerCache from "../../../store/reducer/reducerCache";
import type { StoreUtil } from "../../../store/store";

const useInputFinder = (storeUtil: StoreUtil) => {
    const { lastStore, commit } = storeUtil;

    const outline = lastStore.control.outline;
    const arrange = outline.arrange;

    const arrangeReducer = ArrangeUtil.useReducer(lastStore);
    const { recalculate } = createCacheActions(lastStore);

    const control = (eventKey: string) => {
        if (arrange == null) throw new Error();
        const finder = arrangeReducer.getPianoFinder();

        // const isEditor = arrange?.editor;

        const arrTrack = arrangeReducer.getCurTrack();

        const element = getCurrentOutlineElementCache(lastStore);
        if (element == undefined) throw new Error();
        const chordSeq = element.chordSeq;
        if (chordSeq === -1) throw new Error();

        const moveBackingList = (dir: -1 | 1) => {
            const temp = finder.cursor.backing + dir;
            if (temp >= -1 && temp <= finder.list.length - 1) {
                finder.cursor.sounds = -1;
                // 遘ｻ蜍輔☆繧句燕縺ｫ蛻励・繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ繧偵Μ繧ｻ繝・ヨ縺吶ｋ
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
         * 繝代ち繝ｼ繝ｳ繧帝←逕ｨ縺吶ｋ・医い繧ｦ繝医Λ繧､繝ｳ縺九ｉ逶ｴ謗･襍ｷ蜍墓凾縺ｨ縲√お繝・ぅ繧ｿ縺九ｉ襍ｷ蜍墓凾縺ｧ蛻・ｲ撰ｼ・
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

            // 驕ｸ謚槭＠縺溘ヱ繧ｿ繝ｼ繝ｳ繧偵お繝・ぅ繧ｿ縺ｫ蟇ｾ縺励※驕ｩ逕ｨ縺吶ｋ
            const applyToEditor = () => {
                if (arrange.editor == undefined) throw new Error();
                const editor = arrange.editor as StorePianoEditor.Props;

                const backing = StorePianoBacking.createInitialBackingProps();
                editor.backing = backing;
                backing.layers = JSON.parse(JSON.stringify(bkgPatt.backing.layers));
                backing.recordNum = bkgPatt.backing.recordNum;

                // 繝懊う繧ｷ繝ｳ繧ｰ縺ｯ譛ｪ險ｭ螳壹・蜿ｯ閭ｽ諤ｧ縺後≠繧九◆繧∝・譛溷喧縺励※縺翫￥
                editor.voicing.items.length = 0;
                if (sndsPatt != undefined) {
                    editor.voicing.items = JSON.parse(JSON.stringify(sndsPatt.sounds));
                }
                delete arrange.finder;
            }

            // 繧｢繧ｦ繝医Λ繧､繝ｳ縺九ｉ逶ｴ謗･繝輔ぃ繧､繝ｳ繝繝ｼ繧帝幕縺・※縺・ｋ蝣ｴ蜷・
            if (arrange.editor == undefined) {
                // 繝懊う繧ｷ繝ｳ繧ｰ縺碁∈謚槭＆繧後※縺・↑縺・ｴ蜷医√お繝・ぅ繧ｿ繧帝幕縺・※驕ｩ逕ｨ縺吶ｋ
                if (sndsPatt == undefined) {
                    arrange.editor = StorePianoEditor.getEditorProps(chordSeq, arrTrack);
                    applyToEditor();
                } else {
                    // 繧ｳ繝ｼ繝蛾｣逡ｪ縺ｨ蜿ら・蜈医Λ繧､繝悶Λ繝ｪ縺ｮ邏蝉ｻ倥￠
                    const relations = arrTrack.relations;
                    let relation = relations.find(r => r.chordSeq === chordSeq);
                    if (relation == undefined) {
                        // 譛ｪ螳夂ｾｩ縺ｮ蝣ｴ蜷医・邏舌▼縺代ｒ譁ｰ縺溘↓菴懈・縺励※霑ｽ蜉
                        relation = { chordSeq, bkgPatt: -1, sndsPatt: -1 };
                        relations.push(relation);
                    } else {
                        // 邏蝉ｻ倥￠縺悟､峨ｏ縺｣縺溘％縺ｨ縺ｫ繧医ｊ荳榊盾辣ｧ縺ｮ繝斐い繝弱Λ繧､繝悶Λ繝ｪ縺ｮ繝代ち繝ｼ繝ｳ繧貞炎髯､
                        StorePianoEditor.deleteUnreferUnit(arrTrack);
                    }
                    relation.bkgPatt = bkgPatt.no;
                    relation.sndsPatt = sndsPatt.no;
                    lastStore.control.outline.arrange = null;
                    recalculate();
                }
            }
            // 繧ｨ繝・ぅ繧ｿ縺九ｉ繝輔ぃ繧､繝ｳ繝繝ｼ繧帝幕縺・※縺・ｋ蝣ｴ蜷・
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

