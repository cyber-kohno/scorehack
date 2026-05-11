import type PianoEditorState from "../../../store/state/data/arrange/piano/piano-editor-state";
import MelodyState from "../../../store/state/data/melody-state";
import ChordTheory from "../../../domain/theory/chord-theory";
import type PlaybackCacheState from "../timeline/playback-cache-state";

namespace PianoArrangePlaybackUtil {
  /**
   * アレンジのパターンユニットをノーツ情報に変換して返す。
   * @param unit
   * @param chord
   * @returns
   */
  export const convertPatternToNotes = (
    unit: PianoEditorState.Unit,
    chord: ChordTheory.KeyChordProps,
    option?: { sustainBeat?: number },
  ): PlaybackCacheState.SoundNote[] => {
    const notes: PlaybackCacheState.SoundNote[] = [];

    const relationStructs = calcRelationStructs(chord);

    const pitchIndexes = unit.voicingSounds.map((v) => {
      const [octaveIndex, structIndex] = v.split(".").map((v) => Number(v));
      const struct = relationStructs[structIndex];
      if (struct == undefined) return undefined;
      return (octaveIndex + struct.carryForwardOctave) * 12 + struct.key12;
    });

    if (unit.layers == null) {
      const sustainBeat = option?.sustainBeat;
      if (sustainBeat == undefined) return notes;

      pitchIndexes.forEach((pitch) => {
        if (pitch == undefined) return;
        notes.push({
          norm: { div: 1 },
          pos: 0,
          len: sustainBeat,
          pitch,
          velocity: 10,
        });
      });
      return notes;
    }

    /** ペダル要素は0レイヤーでのみ管理するためベースとして保持する */
    const baseCols = unit.layers[0].cols;

    unit.layers.forEach((l) => {
      // console.log(l);
      l.items.forEach((src) => {
        const note = convSrcToNote(src);
        const col = l.cols[note.colIndex];
        const norm: MelodyState.Norm = col;
        const criteriaRate = 1 / norm.div / (norm.tuplets ?? 1);
        // カラム（音価）より位置を取得
        const pos = l.cols.reduce((prev, cur, i) => {
          let ret = prev;
          const curRate = 1 / cur.div / (cur.tuplets ?? 1);
          const len = getDotRate(cur.dot);
          if (note.colIndex > i) {
            ret += len * (curRate / criteriaRate);
          }
          return ret;
        }, 0);
        let len = getDotRate(col.dot);

        /**
         * 基準になるペダルの位置情報を返す
         * @returns カラム[インデックス、位置（長さ）]
         */
        const getPedalCriteria = () => {
          let curPos = 0;
          for (let i = 0; i < baseCols.length; i++) {
            const curCol = baseCols[i];
            const curRate = 1 / curCol.div / (curCol.tuplets ?? 1);
            const len = getDotRate(curCol.dot);
            const colLen = len * (curRate / criteriaRate);
            if (pos >= curPos && pos < curPos + colLen) {
              return [i, curPos];
            }
            curPos += colLen;
          }
          return [-1, 0];
        };
        const [baseColIndex, baseColPos] = getPedalCriteria();
        // console.log(`layer:${layerIndex}, ${note.colIndex}-${note.recordIndex} pedalIndex:[${baseColIndex}]`);

        // ペダルが踏まれている場合、ペダルを考慮した音価に上書きする
        if (baseColIndex !== -1 && baseCols[baseColIndex].pedal !== 0) {
          let pedalLen = 0;
          for (let i = baseColIndex; i < baseCols.length; i++) {
            const curCol = baseCols[i];
            const curRate = 1 / curCol.div / (curCol.tuplets ?? 1);
            const len = getDotRate(curCol.dot);
            const colLen = len * (curRate / criteriaRate);
            // ペダル開始要素のみPOSの差分を考慮する
            if (i === baseColIndex) {
              const adjust = pos - baseColPos;
              // console.log(`layer:${layerIndex}, ${note.colIndex}-${note.recordIndex} baseColPos:[${baseColPos}], pos:[${pos}]`);
              pedalLen += colLen - adjust;
            } else {
              // 踏みっぱなし以外は切る
              if (curCol.pedal !== 1) break;
              pedalLen += colLen;
            }
          }
          // ペダルの方が長ければ上書きする
          if (len < pedalLen) len = pedalLen;
        }
        const pitch = pitchIndexes[note.recordIndex];
        if (pitch == undefined) return;
        const velocity = note.velocity;
        notes.push({ pos, len, pitch, norm, velocity });
      });
    });
    return notes;
  };

  const getDotRate = (dot: number | undefined) => {
    switch (dot) {
      case undefined:
        return 1;
      case 1:
        return 1.5;
      case 2:
        return 1.75;
    }
    throw new Error(`dotが想定していないパターンの値。[${dot}]`);
  };

  /**
   * ノーツのソース情報（文字列）をオブジェクトに変換して返す
   * @param src
   * @returns
   */
  const convSrcToNote = (src: string) => {
    const items = src.split(".").map((v) => Number(v));
    const [colIndex, recordIndex] = items;
    let velocity = 10;
    let delay = 0;
    if (items.length !== 2) {
      velocity = items[2];
      delay = items[3];
    }
    return { colIndex, recordIndex, velocity, delay };
  };

  const calcRelationStructs = (chord: ChordTheory.KeyChordProps) => {
    const symbolProps = ChordTheory.getSymbolProps(chord.symbol);
    const relationStructs: {
      /** オクターブ繰り上げ */
      carryForwardOctave: number;
      key12: number;
    }[] = symbolProps.structs.map((s) => {
      const tempPitchIndex =
        chord.key12 + ChordTheory.getIntervalFromRelation(s);
      return {
        carryForwardOctave: Math.floor(tempPitchIndex / 12),
        key12: tempPitchIndex % 12,
      };
    });
    // console.log(chord);
    // オンコードを構成音に足す
    if (chord.on != undefined) {
      const on = chord.on;
      if (!relationStructs.map((r) => r.key12).includes(on.key12)) {
        relationStructs.push({
          key12: on.key12,
          carryForwardOctave: 0,
        });
        // console.log(relationStructs);
        relationStructs.sort((a, b) => a.key12 - b.key12);
        // console.log(relationStructs);
      }
    }
    return relationStructs;
  };
}

export default PianoArrangePlaybackUtil;
