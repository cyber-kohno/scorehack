import { get } from "svelte/store";
import PianoEditorState from "../../store/state/data/arrange/piano/piano-editor-state";
import type ArrangeState from "../../store/state/data/arrange/arrange-state";
import type DerivedState from "../../store/state/derived-state";
import MelodyState from "../../store/state/data/melody-state";
import type OutlineState from "../../store/state/data/outline-state";
import type { StoreProps } from "../../store/store";
import ArrangeUtil from "../arrange/arrangeUtil";
import { controlStore, dataStore, derivedStore } from "../../store/global-store";

const useReducerOutline = () => {
  const data = get(dataStore);
  const control = get(controlStore);
  const cache = get(derivedStore);
  const elements = data.elements;
  const outline = control.outline;

  const getCurrentElement = () => {
    const elementIndex = control.outline.focus;
    return data.elements[elementIndex];
  };

  const getCurrentInitData = (): OutlineState.DataInit => {
    const element = getCurrentElement();
    if (element.type !== "init")
      throw new Error("element.typeはinitでなければならない。");
    return element.data;
  };
  const getCurrentSectionData = (): OutlineState.DataSection => {
    const element = getCurrentElement();
    if (element.type !== "section")
      throw new Error("element.typeはsectionでなければならない。");
    return element.data;
  };
  const getCurrentChordData = (): OutlineState.DataChord => {
    const element = getCurrentElement();
    if (element.type !== "chord")
      throw new Error("element.typeはchordでなければならない。");
    return element.data;
  };
  const getCurrentTempoData = (): OutlineState.DataTempo => {
    const element = getCurrentElement();
    if (element.type !== "tempo")
      throw new Error("element.typeはtempoでなければならない。");
    return element.data;
  };
  const getCurrentModulateData = (): OutlineState.DataModulate => {
    const element = getCurrentElement();
    if (element.type !== "modulate")
      throw new Error("element.typeはmodulateでなければならない。");
    return element.data;
  };

  const insertElement = (element: OutlineState.Element) => {
    const elements = data.elements;
    const focus = control.outline.focus;
    const lastChordSeq = cache.elementCaches[focus].lastChordSeq;
    // コード要素を追加する場合は、それ以降のコード連番を1つ後ろにズラす
    if (element.type === "chord") {
      const tracks = data.arrange.tracks;
      tracks.forEach((track) => {
        // 対象要素以降のコード連番を繰り上げ
        track.relations.forEach((r) => {
          if (r.chordSeq > lastChordSeq) r.chordSeq++;
        });
      });
    }
    elements.splice(focus + 1, 0, element);
  };

  const moveFocus = (val: number) => {
    const focus = control.outline.focus;
    const length = data.elements.length;
    const next = focus + val;
    if (next >= 0 && next <= length - 1) control.outline.focus = next;
  };

  const renameSectionData = (value: string) => {
    const element = getCurrentElement();
    if (element.type !== "section")
      throw Error(`section要素でない。[${element.type}]`);
    const data: OutlineState.DataSection = element.data;
    data.name = value;
  };

  const setChordData = (data: OutlineState.DataChord) => {
    const element = getCurrentElement();
    if (element.type !== "chord")
      throw Error(`chord要素でない。[${element.type}]`);
    element.data = data;
  };

  const syncChordSeqFromNote = (note: MelodyState.Note) => {
    const cursorPos = MelodyState.calcBeat(note.norm, note.pos);
    const chord = cache.chordCaches.find(
      (c) =>
        c.startBeatNote <= cursorPos &&
        c.startBeatNote + c.lengthBeatNote > cursorPos,
    );
    if (chord == undefined) throw new Error();
    control.outline.focus = chord.elementSeq;
  };

  const moveSectionFocus = (dir: -1 | 1) => {
    // if (isLock) return;
    // sectionタイプのエレメントが見つかるまで走査
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
    const outline = control.outline;
    return data.arrange.tracks[outline.trackIndex];
  };

  const buildArrange = (
    buildDetail: (props: {
      arrange: ArrangeState.EditorProps;
      arrTrack: ArrangeState.Track;
      chordCache: DerivedState.ChordCache;
    }) => void,
  ) => {
    const track = getCurrArrangeTrack();

    if (track == undefined) return;

    const { baseCaches, elementCaches, chordCaches } = cache;
    const { chordSeq, baseSeq } = elementCaches[outline.focus];
    if (chordSeq === -1) return;
    const chordCache = chordCaches[chordSeq];
    const scoreBase = baseCaches[baseSeq].scoreBase;

    if (chordCache.compiledChord == undefined) return;

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

    control.outline.arrange = arrange;
  };

  const openArrangeEditor = () => {
    buildArrange((props) => {
      const { arrange, arrTrack, chordCache } = props;

      const getEditor = () => {
        switch (arrTrack.method) {
          case "piano":
            return PianoEditorState.getEditorProps(
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

      const ts = cache.baseCaches[chordCache.baseSeq].scoreBase.ts;
      arrange.finder = ArrangeUtil.createFinder({ arrTrack, ts, chordCache });
    });
  };

  const changeHarmonizeTrack = (nextIndex: number) => {
    const outline = control.outline;
    const tracks = data.arrange.tracks;
    if (tracks[nextIndex] == undefined) throw new Error();

    outline.trackIndex = nextIndex;
  };
  const getCurrHarmonizeTrack = () => {
    const outline = control.outline;
    return data.arrange.tracks[outline.trackIndex];
  };

  /**
   * フォーカス範囲の要素ブロックを削除する
   */
  const removeFocusElement = () => {
    const { focus, focusLock } = control.outline;

    let [st, ed] = [focus, focus];
    if (focusLock !== -1) {
      [st, ed] = focus < focusLock ? [focus, focusLock] : [focusLock, focus];
    }
    const delCnt = ed - st + 1;
    // console.log(`st:${st}, ed:${ed}`);

    const { elementCaches } = cache;

    // 一つでもコード要素以外が含まれていたら削除できない
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

    // 削除時は逆回転する
    for (let i = ed; i >= st; i--) {
      removeElementFromIndex(i);
    }
    outline.focus = st - 1;
    outline.focusLock = -1;
  };

  /**
   * 指定したインデックスの要素を削除する
   * コードの場合は、連動してアレンジとの紐づけも解除し、
   * コードシーケンスの調整も行う
   * @param index
   */
  const removeElementFromIndex = (index: number) => {
    const { elementCaches } = cache;
    const tracks = data.arrange.tracks;
    const { chordSeq } = elementCaches[index];

    if (chordSeq !== -1) {
      // console.log(`chordSeq: ${chordSeq}`);
      // コード要素の場合、紐づくユニットの削除
      tracks.forEach((track) => {
        // コード連番に紐づくアレンジの関連を検索
        const delIndex = track.relations.findIndex(
          (r) => r.chordSeq === chordSeq,
        );
        // 関連がある場合、関連も合わせて削除する
        if (delIndex !== -1) {
          track.relations.splice(delIndex, 1);
          // 不要なライブラリユニットの削除
          PianoEditorState.deleteUnreferUnit(track);
          console.log(track);
        }
        // 対象要素以降のコード連番を繰り下げ
        track.relations.forEach((r) => {
          if (r.chordSeq > chordSeq) r.chordSeq--;
        });
      });
    }
    const elements = data.elements;
    elements.splice(index, 1);
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
