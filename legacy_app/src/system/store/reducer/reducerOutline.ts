import StorePianoEditor from "../props/arrange/piano/storePianoEditor";
import type StoreArrange from "../props/arrange/storeArrange";
import type StoreCache from "../props/storeCache";
import StoreMelody from "../props/storeMelody";
import type StoreOutline from "../props/storeOutline";
import type { StoreProps } from "../store";
import ArrangeUtil from "./arrangeUtil";

const useReducerOutline = (lastStore: StoreProps) => {
  const elements = lastStore.data.elements;
  const outline = lastStore.control.outline;

  const getCurrentElement = () => {
    const elementIndex = lastStore.control.outline.focus;
    return lastStore.data.elements[elementIndex];
  };

  const getCurrentInitData = (): StoreOutline.DataInit => {
    const element = getCurrentElement();
    if (element.type !== "init")
      throw new Error("element.typeはinitでなければならない。");
    return element.data;
  };
  const getCurrentSectionData = (): StoreOutline.DataSection => {
    const element = getCurrentElement();
    if (element.type !== "section")
      throw new Error("element.typeはsectionでなければならない。");
    return element.data;
  };
  const getCurrentChordData = (): StoreOutline.DataChord => {
    const element = getCurrentElement();
    if (element.type !== "chord")
      throw new Error("element.typeはchordでなければならない。");
    return element.data;
  };
  const getCurrentTempoData = (): StoreOutline.DataTempo => {
    const element = getCurrentElement();
    if (element.type !== "tempo")
      throw new Error("element.typeはtempoでなければならない。");
    return element.data;
  };
  const getCurrentModulateData = (): StoreOutline.DataModulate => {
    const element = getCurrentElement();
    if (element.type !== "modulate")
      throw new Error("element.typeはmodulateでなければならない。");
    return element.data;
  };

  const insertElement = (element: StoreOutline.Element) => {
    const elements = lastStore.data.elements;
    const focus = lastStore.control.outline.focus;
    const lastChordSeq = lastStore.cache.elementCaches[focus].lastChordSeq;
    // コード要素を追加する場合は、それ以降のコード連番を1つ後ろにズラす
    if (element.type === "chord") {
      const tracks = lastStore.data.arrange.tracks;
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
    const focus = lastStore.control.outline.focus;
    const length = lastStore.data.elements.length;
    const next = focus + val;
    if (next >= 0 && next <= length - 1) lastStore.control.outline.focus = next;
  };

  const renameSectionData = (value: string) => {
    const element = getCurrentElement();
    if (element.type !== "section")
      throw Error(`section要素でない。[${element.type}]`);
    const data: StoreOutline.DataSection = element.data;
    data.name = value;
  };

  const setChordData = (data: StoreOutline.DataChord) => {
    const element = getCurrentElement();
    if (element.type !== "chord")
      throw Error(`chord要素でない。[${element.type}]`);
    element.data = data;
  };

  const syncChordSeqFromNote = (note: StoreMelody.Note) => {
    const cursorPos = StoreMelody.calcBeat(note.norm, note.pos);
    const chord = lastStore.cache.chordCaches.find(
      (c) =>
        c.startBeatNote <= cursorPos &&
        c.startBeatNote + c.lengthBeatNote > cursorPos,
    );
    if (chord == undefined) throw new Error();
    lastStore.control.outline.focus = chord.elementSeq;
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
    const outline = lastStore.control.outline;
    return lastStore.data.arrange.tracks[outline.trackIndex];
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

    const { baseCaches, elementCaches, chordCaches } = lastStore.cache;
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

      const ts = lastStore.cache.baseCaches[chordCache.baseSeq].scoreBase.ts;
      arrange.finder = ArrangeUtil.createFinder({ arrTrack, ts, chordCache });
    });
  };

  const changeHarmonizeTrack = (nextIndex: number) => {
    const outline = lastStore.control.outline;
    const tracks = lastStore.data.arrange.tracks;
    if (tracks[nextIndex] == undefined) throw new Error();

    outline.trackIndex = nextIndex;
  };
  const getCurrHarmonizeTrack = () => {
    const outline = lastStore.control.outline;
    return lastStore.data.arrange.tracks[outline.trackIndex];
  };

  /**
   * フォーカス範囲の要素ブロックを削除する
   */
  const removeFocusElement = () => {
    const { focus, focusLock } = lastStore.control.outline;

    let [st, ed] = [focus, focus];
    if (focusLock !== -1) {
      [st, ed] = focus < focusLock ? [focus, focusLock] : [focusLock, focus];
    }
    const delCnt = ed - st + 1;
    // console.log(`st:${st}, ed:${ed}`);

    const { elementCaches } = lastStore.cache;

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
    const { elementCaches } = lastStore.cache;
    const tracks = lastStore.data.arrange.tracks;
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
          StorePianoEditor.deleteUnreferUnit(track);
          console.log(track);
        }
        // 対象要素以降のコード連番を繰り下げ
        track.relations.forEach((r) => {
          if (r.chordSeq > chordSeq) r.chordSeq--;
        });
      });
    }
    const elements = lastStore.data.elements;
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
