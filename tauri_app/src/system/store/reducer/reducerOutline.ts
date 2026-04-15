import StorePianoEditor from "../props/arrange/piano/storePianoEditor";
import type StoreArrange from "../props/arrange/storeArrange";
import type StoreCache from "../props/storeCache";
import StoreMelody from "../props/storeMelody";
import type {
  OutlineDataChord,
  OutlineDataInit,
  OutlineDataModulate,
  OutlineDataSection,
  OutlineDataTempo,
  OutlineElement,
} from "../../../domain/outline/outline-types";
import { createProjectDataActions } from "../../../app/project-data/project-data-actions";
import {
  getBaseCaches,
  getChordCaches,
  getElementCaches,
} from "../../../state/cache-state/cache-store";
import { getCurrentOutlineElementCache } from "../../../state/cache-state/outline-cache";
import type { StoreProps } from "../store";
import ArrangeUtil from "./arrangeUtil";

const useReducerOutline = (lastStore: StoreProps) => {
  const {
    getOutlineElement,
    getOutlineElements,
    insertOutlineElementAt,
    removeOutlineElementAt,
    getArrangeTrack,
    getArrangeTracks,
  } = createProjectDataActions(lastStore);
  const elements = getOutlineElements();
  const outline = lastStore.control.outline;

  const getCurrentElement = () => {
    const elementIndex = lastStore.control.outline.focus;
    const element = getOutlineElement(elementIndex);
    if (element == undefined) throw new Error();
    return element;
  };

  const getCurrentInitData = (): OutlineDataInit => {
    const element = getCurrentElement();
    if (element.type !== "init")
      throw new Error("Current element type does not match the requested outline data.");
    return element.data;
  };
  const getCurrentSectionData = (): OutlineDataSection => {
    const element = getCurrentElement();
    if (element.type !== "section")
      throw new Error("Current element type does not match the requested outline data.");
    return element.data;
  };
  const getCurrentChordData = (): OutlineDataChord => {
    const element = getCurrentElement();
    if (element.type !== "chord")
      throw new Error("Current element type does not match the requested outline data.");
    return element.data;
  };
  const getCurrentTempoData = (): OutlineDataTempo => {
    const element = getCurrentElement();
    if (element.type !== "tempo")
      throw new Error("Current element type does not match the requested outline data.");
    return element.data;
  };
  const getCurrentModulateData = (): OutlineDataModulate => {
    const element = getCurrentElement();
    if (element.type !== "modulate")
      throw new Error("Current element type does not match the requested outline data.");
    return element.data;
  };

  const insertElement = (element: OutlineElement) => {
    const focus = lastStore.control.outline.focus;
    const lastChordSeq = getCurrentOutlineElementCache(lastStore)?.lastChordSeq ?? -1;
    // 繧ｳ繝ｼ繝芽ｦ∫ｴ繧定ｿｽ蜉縺吶ｋ蝣ｴ蜷医・縲√◎繧御ｻ･髯阪・繧ｳ繝ｼ繝蛾｣逡ｪ繧・縺､蠕後ｍ縺ｫ繧ｺ繝ｩ縺・
    if (element.type === "chord") {
      const tracks = getArrangeTracks();
      tracks.forEach((track) => {
        // 蟇ｾ雎｡隕∫ｴ莉･髯阪・繧ｳ繝ｼ繝蛾｣逡ｪ繧堤ｹｰ繧贋ｸ翫￡
        track.relations.forEach((r) => {
          if (r.chordSeq > lastChordSeq) r.chordSeq++;
        });
      });
    }
    insertOutlineElementAt(focus + 1, element);
  };

  const moveFocus = (val: number) => {
    const focus = lastStore.control.outline.focus;
    const length = getOutlineElements().length;
    const next = focus + val;
    if (next >= 0 && next <= length - 1) lastStore.control.outline.focus = next;
  };

  const renameSectionData = (value: string) => {
    const element = getCurrentElement();
    if (element.type !== "section")
      throw Error(`section隕∫ｴ縺ｧ縺ｪ縺・・${element.type}]`);
    const data: OutlineDataSection = element.data;
    data.name = value;
  };

  const setChordData = (data: OutlineDataChord) => {
    const element = getCurrentElement();
    if (element.type !== "chord")
      throw Error(`chord隕∫ｴ縺ｧ縺ｪ縺・・${element.type}]`);
    element.data = data;
  };

  const syncChordSeqFromNote = (note: StoreMelody.Note) => {
    const cursorPos = StoreMelody.calcBeat(note.norm, note.pos);
    const chord = getChordCaches(lastStore).find(
      (c) =>
        c.startBeatNote <= cursorPos &&
        c.startBeatNote + c.lengthBeatNote > cursorPos,
    );
    if (chord == undefined) throw new Error();
    lastStore.control.outline.focus = chord.elementSeq;
  };

  const moveSectionFocus = (dir: -1 | 1) => {
    // if (isLock) return;
    // section繧ｿ繧､繝励・繧ｨ繝ｬ繝｡繝ｳ繝医′隕九▽縺九ｋ縺ｾ縺ｧ襍ｰ譟ｻ
    let tempFocus = outline.focus;
    const isIncrement = () =>
      dir === -1 ? tempFocus > 0 : tempFocus < elements.length - 1;
    while (isIncrement()) {
      tempFocus += dir;
      if (
        elements[tempFocus].type === "section" ||
        tempFocus === elements.length - 1
      ) {
        outline.focus = tempFocus;
        break;
      }
    }
  };

  const getCurrArrangeTrack = () => {
    const outline = lastStore.control.outline;
    return getArrangeTrack(outline.trackIndex);
  };

  const buildArrange = (
    buildDetail: (props: {
      arrange: StoreArrange.EditorProps;
      arrTrack: StoreArrange.Track;
      chordCache: StoreCache.ChordCache;
    }) => void,
  ) => {
    const track = getCurrArrangeTrack();

    if (track == undefined) return;

    const baseCaches = getBaseCaches(lastStore);
    const elementCaches = getElementCaches(lastStore);
    const chordCaches = getChordCaches(lastStore);
    const { chordSeq, baseSeq } = elementCaches[outline.focus];
    if (chordSeq === -1) return;
    const chordCache = chordCaches[chordSeq];
    const scoreBase = baseCaches[baseSeq].scoreBase;

    if (chordCache.compiledChord == undefined) return;

    const target: StoreArrange.Target = {
      scoreBase,
      beat: chordCache.beat,
      compiledChord: chordCache.compiledChord,
      chordSeq: chordCache.chordSeq,
    };

    const arrange: StoreArrange.EditorProps = {
      method: track.method,
      target,
    };
    buildDetail({ arrange, arrTrack: track, chordCache });

    lastStore.control.outline.arrange = arrange;
  };

  const openArrangeEditor = () => {
    buildArrange((props) => {
      const { arrange, arrTrack, chordCache } = props;

      const getEditor = () => {
        switch (arrTrack.method) {
          case "piano":
            return StorePianoEditor.getEditorProps(
              chordCache.chordSeq,
              arrTrack,
            );
        }
      };
      arrange.editor = getEditor();
    });
  };

  const openArrangeFinder = () => {
    buildArrange((props) => {
      const { arrange, arrTrack, chordCache } = props;

      const ts = getBaseCaches(lastStore)[chordCache.baseSeq].scoreBase.ts;
      arrange.finder = ArrangeUtil.createFinder({ arrTrack, ts, chordCache });
    });
  };

  const changeHarmonizeTrack = (nextIndex: number) => {
    const outline = lastStore.control.outline;
    const tracks = getArrangeTracks();
    if (tracks[nextIndex] == undefined) throw new Error();

    outline.trackIndex = nextIndex;
  };
  const getCurrHarmonizeTrack = () => {
    const outline = lastStore.control.outline;
    const track = getArrangeTrack(outline.trackIndex);
    if (track == undefined) throw new Error();
    return track;
  };

  /**
   * 繝輔か繝ｼ繧ｫ繧ｹ遽・峇縺ｮ隕∫ｴ繝悶Ο繝・け繧貞炎髯､縺吶ｋ
   */
  const removeFocusElement = () => {
    const { focus, focusLock } = lastStore.control.outline;

    let [st, ed] = [focus, focus];
    if (focusLock !== -1) {
      [st, ed] = focus < focusLock ? [focus, focusLock] : [focusLock, focus];
    }
    const delCnt = ed - st + 1;
    // console.log(`st:${st}, ed:${ed}`);

    const elementCaches = getElementCaches(lastStore);

    // 荳縺､縺ｧ繧ゅさ繝ｼ繝芽ｦ∫ｴ莉･螟悶′蜷ｫ縺ｾ繧後※縺・◆繧牙炎髯､縺ｧ縺阪↑縺・
    if (st !== ed) {
      let canDelete = true;
      for (let i = st; i <= ed; i++) {
        if (elementCaches[i].type !== "chord") {
          canDelete = false;
          break;
        }
      }
      if (!canDelete) return;
    }

    // 蜑企勁譎ゅ・騾・屓霆｢縺吶ｋ
    for (let i = ed; i >= st; i--) {
      removeElementFromIndex(i);
    }
    outline.focus = st - 1;
    outline.focusLock = -1;
  };

  /**
   * 謖・ｮ壹＠縺溘う繝ｳ繝・ャ繧ｯ繧ｹ縺ｮ隕∫ｴ繧貞炎髯､縺吶ｋ
   * 繧ｳ繝ｼ繝峨・蝣ｴ蜷医・縲・｣蜍輔＠縺ｦ繧｢繝ｬ繝ｳ繧ｸ縺ｨ縺ｮ邏舌▼縺代ｂ隗｣髯､縺励・
   * 繧ｳ繝ｼ繝峨す繝ｼ繧ｱ繝ｳ繧ｹ縺ｮ隱ｿ謨ｴ繧り｡後≧
   * @param index
   */
  const removeElementFromIndex = (index: number) => {
    const elementCaches = getElementCaches(lastStore);
    const tracks = getArrangeTracks();
    const { chordSeq } = elementCaches[index];

    if (chordSeq !== -1) {
      // console.log(`chordSeq: ${chordSeq}`);
      // 繧ｳ繝ｼ繝芽ｦ∫ｴ縺ｮ蝣ｴ蜷医∫ｴ舌▼縺上Θ繝九ャ繝医・蜑企勁
      tracks.forEach((track) => {
        // 繧ｳ繝ｼ繝蛾｣逡ｪ縺ｫ邏舌▼縺上い繝ｬ繝ｳ繧ｸ縺ｮ髢｢騾｣繧呈､懃ｴ｢
        const delIndex = track.relations.findIndex(
          (r) => r.chordSeq === chordSeq,
        );
        // 髢｢騾｣縺後≠繧句ｴ蜷医・未騾｣繧ょ粋繧上○縺ｦ蜑企勁縺吶ｋ
        if (delIndex !== -1) {
          track.relations.splice(delIndex, 1);
          // 荳崎ｦ√↑繝ｩ繧､繝悶Λ繝ｪ繝ｦ繝九ャ繝医・蜑企勁
          StorePianoEditor.deleteUnreferUnit(track);
          console.log(track);
        }
        // 蟇ｾ雎｡隕∫ｴ莉･髯阪・繧ｳ繝ｼ繝蛾｣逡ｪ繧堤ｹｰ繧贋ｸ九￡
        track.relations.forEach((r) => {
          if (r.chordSeq > chordSeq) r.chordSeq--;
        });
      });
    }
    removeOutlineElementAt(index);
  };

  return {
    getCurrentElement,
    getCurrentSectionData,
    getCurrentChordData,
    getCurrentInitData,
    getCurrentModulateData,
    getCurrentTempoData,
    insertElement,
    removeFocusElement,
    moveFocus,
    renameSectionData,
    setChordData,
    syncChordSeqFromNote,
    moveSectionFocus,
    openArrangeEditor,
    openArrangeFinder,
    changeHarmonizeTrack,
    getCurrHarmonizeTrack,
  };
};

export default useReducerOutline;



