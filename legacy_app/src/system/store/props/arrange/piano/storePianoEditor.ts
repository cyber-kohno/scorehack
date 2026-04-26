import type StoreMelody from "../../storeMelody";
import StoreArrange from "../storeArrange";
import type ArrangeLibrary from "../arrangeLibrary";
import StorePianoBacking from "./storePianoBacking";

namespace StorePianoEditor {
  export type Phase = "preset" | "edit" | "preview";
  export type Control = "voicing" | "col" | "record" | "notes";

  export interface Props {
    phase: Phase;
    control: Control;

    preset: PresetBak;
    voicing: Voicing;
    backing: null | StorePianoBacking.EditorProps;

    /** エディタ起動時のソースを保持 */
    lastSource: string;
  }

  export const createInitialProps = (): Props => {
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
    track: StoreArrange.Track,
  ): Props => {
    const props = createInitialProps();
    const relation = track.relations.find((r) => r.chordSeq === chordSeq);
    if (relation != undefined) {
      const lib = track.pianoLib;
      if (lib == undefined) throw new Error();
      // console.log(relation);
      if (relation.bkgPatt !== -1) {
        const bkgPatt = lib.backingPatterns.find(
          (p) => p.no === relation.bkgPatt,
        );
        if (bkgPatt == undefined) throw new Error();
        const bkg = bkgPatt.backing;
        props.backing = StorePianoBacking.createInitialBackingProps();
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
    layers: StorePianoBacking.Layer[];
  }

  export interface BackingPattern extends StoreArrange.Pattern {
    backing: StorePianoBacking.DataProps;

    category: ArrangeLibrary.BackingCategory;
  }
  export interface SoundsPattern extends StoreArrange.Pattern {
    sounds: string[];
    category: ArrangeLibrary.SoundsCategory;
  }
  export type Preset = {
    bkgPatt: number;
    sortNo: number;
    voics: number[];
  };
  export type Lib = {
    backingPatterns: BackingPattern[];
    soundsPatterns: SoundsPattern[];

    presets: Preset[];
  };

  export const createInitialLib = (): Lib => ({
    backingPatterns: [],
    soundsPatterns: [],
    presets: [],
  });

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
   * @param lib ライブラリ
   * @returns アレンジ（バッキング・ボイシング）の識別連番の配列（分割代入で使う想定）
   */
  export const registPattern = (
    category: ArrangeLibrary.SearchCategory,
    backing: StorePianoBacking.DataProps | null,
    sounds: string[],
    lib: Lib,
  ) => {
    let backingPatt: BackingPattern | undefined = undefined;
    if (backing != null) {
      const backingSrc = JSON.stringify(backing);
      // 既存のバッキングパターンを検索
      backingPatt = lib.backingPatterns.find((pat) => {
        const pattSrc = JSON.stringify(pat.backing);
        return backingSrc === pattSrc;
      });
      // 既存のパターンが見つからなかった場合、新規追加
      if (backingPatt == undefined) {
        const maxNo = lib.backingPatterns.reduce(
          (p, n) => (n.no > p ? n.no : p),
          -1,
        );
        backingPatt = {
          no: maxNo + 1,
          backing: JSON.parse(backingSrc),
          category: { ...category },
        };
        lib.backingPatterns.push(backingPatt);
      }
    }

    const soundsSrc = JSON.stringify(sounds);
    // 既存の構成音パターンを検索
    let soundsPatt = lib.soundsPatterns.find((pat) => {
      const pattSrc = JSON.stringify(pat.sounds);
      return soundsSrc === pattSrc;
    });
    // 既存のパターンが見つからなかった場合、新規追加
    if (soundsPatt == undefined) {
      const maxNo = lib.soundsPatterns.reduce(
        (p, n) => (n.no > p ? n.no : p),
        -1,
      );
      soundsPatt = {
        no: maxNo + 1,
        sounds: JSON.parse(soundsSrc),
        category: { ...category },
      };
      lib.soundsPatterns.push(soundsPatt);
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
    track: StoreArrange.Track,
  ): Unit | undefined => {
    const relations = track.relations;
    const relation = relations.find((r) => r.chordSeq === chordSeq);

    if (relation != undefined) {
      const pianoLib = track.pianoLib as StorePianoEditor.Lib;
      const backingPatt = pianoLib.backingPatterns.find(
        (patt) => patt.no === relation.bkgPatt,
      );
      if (backingPatt == null)
        throw new Error("backingPattがundefinedであってはならない。");
      const soundsPatt = pianoLib.soundsPatterns.find(
        (patt) => patt.no === relation.sndsPatt,
      );
      if (soundsPatt == null)
        throw new Error("soundsPattがundefinedであってはならない。");

      return {
        voicingSounds: soundsPatt.sounds,
        layers: backingPatt.backing.layers,
      };
    }
    return undefined;
  };

  export const deleteUnreferUnit = (track: StoreArrange.Track) => {
    const pianoLib = track.pianoLib as StorePianoEditor.Lib;
    StoreArrange.deleteUnreferPattern(
      "bkgPatt",
      pianoLib.backingPatterns,
      (patt: StoreArrange.Pattern) => {
        return pianoLib.presets.find((p) => p.bkgPatt === patt.no) != undefined;
      },
      track,
    );
    StoreArrange.deleteUnreferPattern(
      "sndsPatt",
      pianoLib.soundsPatterns,
      (patt: StoreArrange.Pattern) => {
        const result =
          pianoLib.presets.find((p) => {
            // console.log(`p.voics:${p.voics}, patt.no:${patt.no}`);
            return p.voics.includes(patt.no);
          }) != undefined;
        // console.log(`result: ${result}`);
        return result;
      },
      track,
    );
  };
}

export default StorePianoEditor;
