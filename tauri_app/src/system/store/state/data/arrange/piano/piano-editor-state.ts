import ArrangeState from "../arrange-state";
import type FinderState from "../finder-state";
import PianoBackingState from "./piano-backing-state";

namespace PianoEditorState {
  export type Phase = "preset" | "edit" | "playback";
  export type Control = "voicing" | "col" | "record" | "notes";

  export interface Value {
    phase: Phase;
    control: Control;

    preset: PresetBak;
    voicing: Voicing;
    backing: null | PianoBackingState.EditorProps;

    /** エディタ起動時のソースを保持 */
    lastSource: string;
  }

  export const createInitialProps = (): Value => {
    return {
      backing: null,
      phase: "edit",
      control: "voicing",
      lastSource: "",
      voicing: {
        cursorX: 0,
        cursorY: 0,
        items: [],
      },
      preset: { index: -1, list: [] },
    };
  };

  export const getEditorProps = (
    chordSeq: number,
    track: ArrangeState.PianoTrack,
  ): Value => {
    const props = createInitialProps();
    const relation = track.relations.find((r) => r.chordSeq === chordSeq);
    if (relation != undefined) {
      const lib = track.bank;
      // console.log(relation);
      if (relation.bkgPatt !== -1) {
        const bkgPatt = lib.backingPatterns.find(
          (p) => p.no === relation.bkgPatt,
        );
        if (bkgPatt == undefined) throw new Error();
        const bkg = bkgPatt.backing;
        props.backing = PianoBackingState.createInitialBackingProps();
        props.backing.recordNum = JSON.parse(JSON.stringify(bkg.recordNum));
        props.backing.layers = JSON.parse(JSON.stringify(bkg.layers));
      }

      const sndsPatt = lib.soundsPatterns.find(
        (p) => p.no === relation.sndsPatt,
      );
      if (sndsPatt == undefined) throw new Error();
      const sounds = sndsPatt.sounds;
      props.voicing.items = sounds.slice();
    }
    return props;
  };

  type PresetBak = {
    list: Unit[];
    index: number;
  };

  type Voicing = {
    items: string[];
    cursorX: number;
    cursorY: number;
  };

  export interface Unit {
    // extends ArrangeEditor.Unit {
    voicingSounds: string[];
    layers: PianoBackingState.Layer[] | null;
  }

  export interface BackingPattern extends ArrangeState.Pattern {
    backing: PianoBackingState.DataProps;

    category: FinderState.BackingCategory;
  }
  export interface SoundsPattern extends ArrangeState.Pattern {
    sounds: string[];
    category: FinderState.SoundsCategory;
  }
  export type Regular = {
    backingNo: number;
    sortNo: number;
    soundsNos: number[];
  };
  export type Bank = {
    backingPatterns: BackingPattern[];
    soundsPatterns: SoundsPattern[];

    regulars: Regular[];
  };

  export const createInitialBank = (): Bank => ({
    backingPatterns: [],
    soundsPatterns: [],
    regulars: [],
  });

  export const createPatternData = (editor: Value) => {
    const sounds = JSON.parse(JSON.stringify(editor.voicing.items)) as string[];
    const backing = (() => {
      if (editor.backing == null) return null;

      return {
        recordNum: editor.backing.recordNum,
        layers: editor.backing.layers.map(layer => ({
          cols: JSON.parse(JSON.stringify(layer.cols)) as PianoBackingState.Col[],
          items: layer.items.filter(item => {
            const [x, y] = item.split(".").map(v => Number(v));
            return (
              x >= 0 &&
              x <= layer.cols.length - 1 &&
              y >= 0 &&
              y <= sounds.length - 1
            );
          }),
        })),
      };
    })();

    return {
      sounds,
      backing,
    };
  };

  export const createSnapshot = (editor: Value) => {
    return JSON.stringify(createPatternData(editor));
  };

  // export const getUnitFromEditor = (editor: Props): Unit => {
  //     return {
  //         layers: editor.backing.layers,
  //         voicingSounds: editor.voicing.sounds
  //     }
  // }

  /**
   * アレンジ（バッキング・ボイシング）パターンを検索（なければ登録）し、識別連番を返す
   * @param category 検索用のカテゴリ
   * @param backing バッキング
   * @param sounds ボイシング
   * @param bank バンク
   * @returns アレンジ（バッキング・ボイシング）の識別連番の配列（分割代入で使う想定）
   */
  export const registPattern = (
    category: FinderState.SearchCategory,
    backing: PianoBackingState.DataProps | null,
    sounds: string[],
    bank: Bank,
  ) => {
    let backingPatt: BackingPattern | undefined = undefined;
    if (backing != null) {
      const backingSrc = JSON.stringify(backing);
      // 既存のバッキングパターンを検索
      backingPatt = bank.backingPatterns.find((pat) => {
        const pattSrc = JSON.stringify(pat.backing);
        return backingSrc === pattSrc;
      });
      // 既存のパターンが見つからなかった場合、新規追加
      if (backingPatt == undefined) {
        const maxNo = bank.backingPatterns.reduce(
          (p, n) => (n.no > p ? n.no : p),
          -1,
        );
        backingPatt = {
          no: maxNo + 1,
          backing: JSON.parse(backingSrc),
          category: { ...category },
        };
        bank.backingPatterns.push(backingPatt);
      }
    }

    const soundsSrc = JSON.stringify(sounds);
    // 既存の構成音パターンを検索
    let soundsPatt = bank.soundsPatterns.find((pat) => {
      const pattSrc = JSON.stringify(pat.sounds);
      return soundsSrc === pattSrc;
    });
    // 既存のパターンが見つからなかった場合、新規追加
    if (soundsPatt == undefined) {
      const maxNo = bank.soundsPatterns.reduce(
        (p, n) => (n.no > p ? n.no : p),
        -1,
      );
      soundsPatt = {
        no: maxNo + 1,
        sounds: JSON.parse(soundsSrc),
        category: { ...category },
      };
      bank.soundsPatterns.push(soundsPatt);
    }
    return [backingPatt == null ? -1 : backingPatt.no, soundsPatt.no];
  };

  /**
   * コードに割り当てられているアレンジパターンを検索して返す。
   * 割り当てられていない場合undefinedを返す。
   * @param chordSeq
   * @param track
   * @returns
   */
  export const getArrangePatternFromRelation = (
    chordSeq: number,
    track: ArrangeState.PianoTrack,
  ): Unit | undefined => {
    const relations = track.relations;
    const relation = relations.find((r) => r.chordSeq === chordSeq);

    if (relation != undefined) {
      const pianoLib = track.bank;
      const soundsPatt = pianoLib.soundsPatterns.find(
        (patt) => patt.no === relation.sndsPatt,
      );
      if (soundsPatt == null)
        throw new Error("soundsPatt must exist.");

      if (relation.bkgPatt === -1) {
        return {
          voicingSounds: soundsPatt.sounds,
          layers: null,
        };
      }

      const backingPatt = pianoLib.backingPatterns.find(
        (patt) => patt.no === relation.bkgPatt,
      );
      if (backingPatt == null)
        throw new Error("backingPatt must exist.");

      return {
        voicingSounds: soundsPatt.sounds,
        layers: backingPatt.backing.layers,
      };
    }
    return undefined;
  };

  export const isBackingRegular = (bank: Bank, backingNo: number) => {
    return bank.regulars.some((regular) => regular.backingNo === backingNo);
  };

  export const isSoundsRegular = (bank: Bank, soundsNo: number) => {
    return bank.regulars.some((regular) => regular.soundsNos.includes(soundsNo));
  };

  export const deleteBackingPattern = (bank: Bank, backingNo: number) => {
    const index = bank.backingPatterns.findIndex((pattern) => pattern.no === backingNo);
    if (index !== -1) bank.backingPatterns.splice(index, 1);
  };

  export const deleteSoundsPattern = (bank: Bank, soundsNo: number) => {
    const index = bank.soundsPatterns.findIndex((pattern) => pattern.no === soundsNo);
    if (index !== -1) bank.soundsPatterns.splice(index, 1);
  };

  export const deleteUnreferUnit = (track: ArrangeState.PianoTrack) => {
    const pianoLib = track.bank;
    ArrangeState.deleteUnreferPattern(
      "bkgPatt",
      pianoLib.backingPatterns,
      (patt: ArrangeState.Pattern) => {
        return isBackingRegular(pianoLib, patt.no);
      },
      track,
    );
    ArrangeState.deleteUnreferPattern(
      "sndsPatt",
      pianoLib.soundsPatterns,
      (patt: ArrangeState.Pattern) => {
        return isSoundsRegular(pianoLib, patt.no);
      },
      track,
    );
  };
}

export default PianoEditorState;
