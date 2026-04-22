import StoreMelody from "../../domain/melody/melody-store";
import type {
  OutlineDataChord,
  OutlineDataInit,
  OutlineDataModulate,
  OutlineDataSection,
  OutlineDataTempo,
  OutlineElement,
} from "../../domain/outline/outline-types";
import {
  changeOutlineHarmonizeTrack,
  getCurrentOutlineHarmonizeTrack,
  moveOutlineFocus,
  moveOutlineSectionFocus,
} from "./outline-navigation";
import {
  getCurrentOutlineChordData,
  getCurrentOutlineElement,
  getCurrentOutlineInitData,
  getCurrentOutlineModulateData,
  getCurrentOutlineSectionData,
  getCurrentOutlineTempoData,
} from "./outline-state";
import {
  getCurrentOutlineArrangeTrack,
  openOutlineArrangeEditor,
  openOutlineArrangeFinder,
} from "./outline-arrange";
import {
  canRemoveOutlineRange,
  getOutlineChordSeqAtElementIndex,
  removeOutlineArrangeRelationsForChord,
  shiftOutlineArrangeRelationsAfterChordInsert,
} from "./outline-relations";
import { createProjectDataActions } from "../project-data/project-data-actions";
import { getChordCaches, getElementCaches } from "../../state/cache-state/cache-store";
import { getCurrentOutlineElementCache } from "../../state/cache-state/outline-cache";
import {
  getOutlineFocusState,
  setOutlineFocus,
  setOutlineFocusLock,
} from "../../state/session-state/outline-focus-store";
import type { RootStoreToken } from "../../state/root-store";

const useReducerOutline = (rootStoreToken: RootStoreToken) => {
  const lastStore = rootStoreToken;
  const {
    getOutlineElement,
    getOutlineElements,
    insertOutlineElementAt,
    removeOutlineElementAt,
    getArrangeTracks,
  } = createProjectDataActions(lastStore);
  const elements = getOutlineElements();

  const getCurrentElement = () => {
    return getCurrentOutlineElement(lastStore);
  };

  const getCurrentInitData = (): OutlineDataInit => {
    return getCurrentOutlineInitData(lastStore);
  };
  const getCurrentSectionData = (): OutlineDataSection => {
    return getCurrentOutlineSectionData(lastStore);
  };
  const getCurrentChordData = (): OutlineDataChord => {
    return getCurrentOutlineChordData(lastStore);
  };
  const getCurrentTempoData = (): OutlineDataTempo => {
    return getCurrentOutlineTempoData(lastStore);
  };
  const getCurrentModulateData = (): OutlineDataModulate => {
    return getCurrentOutlineModulateData(lastStore);
  };

  const insertElement = (element: OutlineElement) => {
    const focus = getOutlineFocusState().focus;
    const lastChordSeq = getCurrentOutlineElementCache(lastStore)?.lastChordSeq ?? -1;
    if (element.type === "chord") {
      shiftOutlineArrangeRelationsAfterChordInsert(lastStore, lastChordSeq);
    }
    insertOutlineElementAt(focus + 1, element);
  };

  const moveFocus = (val: number) => {
    moveOutlineFocus(lastStore, val);
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
    setOutlineFocus(chord.elementSeq);
  };

  const moveSectionFocus = (dir: -1 | 1) => {
    moveOutlineSectionFocus(lastStore, dir);
  };

  const getCurrArrangeTrack = () => {
    return getCurrentOutlineArrangeTrack(lastStore);
  };

  const openArrangeEditor = () => {
    openOutlineArrangeEditor(lastStore);
  };

  const openArrangeFinder = () => {
    openOutlineArrangeFinder(lastStore);
  };

  const changeHarmonizeTrack = (nextIndex: number) => {
    changeOutlineHarmonizeTrack(lastStore, nextIndex);
  };
  const getCurrHarmonizeTrack = () => {
    return getCurrentOutlineHarmonizeTrack(lastStore);
  };

  /**
   * 繝輔か繝ｼ繧ｫ繧ｹ遽・峇縺ｮ隕∫ｴ繝悶Ο繝・け繧貞炎髯､縺吶ｋ
   */
  const removeFocusElement = () => {
    const { focus, focusLock } = getOutlineFocusState();

    let [st, ed] = [focus, focus];
    if (focusLock !== -1) {
      [st, ed] = focus < focusLock ? [focus, focusLock] : [focusLock, focus];
    }
    if (!canRemoveOutlineRange(lastStore, st, ed)) return;

    for (let i = ed; i >= st; i--) {
      removeElementFromIndex(i);
    }
    setOutlineFocus(st - 1);
    setOutlineFocusLock(-1);
  };

  /**
   * 謖・ｮ壹＠縺溘う繝ｳ繝・ャ繧ｯ繧ｹ縺ｮ隕∫ｴ繧貞炎髯､縺吶ｋ
   * 繧ｳ繝ｼ繝峨・蝣ｴ蜷医・縲・｣蜍輔＠縺ｦ繧｢繝ｬ繝ｳ繧ｸ縺ｨ縺ｮ邏舌▼縺代ｂ隗｣髯､縺励・
   * 繧ｳ繝ｼ繝峨す繝ｼ繧ｱ繝ｳ繧ｹ縺ｮ隱ｿ謨ｴ繧り｡後≧
   * @param index
   */
  const removeElementFromIndex = (index: number) => {
    const chordSeq = getOutlineChordSeqAtElementIndex(lastStore, index);

    if (chordSeq !== -1) {
      removeOutlineArrangeRelationsForChord(lastStore, chordSeq);
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






