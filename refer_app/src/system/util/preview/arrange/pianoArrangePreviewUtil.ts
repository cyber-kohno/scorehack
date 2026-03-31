import type StorePianoEditor from "../../../store/props/arrange/piano/storePianoEditor";
import type StoreCache from "../../../store/props/storeCache";
import StoreMelody from "../../../store/props/storeMelody";
import MusicTheory from "../../musicTheory";
import type PreviewUtil from "../previewUtil";

namespace PianoArrangePreviewUtil {
  /**
   * アレンジのパターンユニットをノーツ情報に変換して返す。
   * @param unit
   * @param chord
   * @returns
   */
  export const convertPatternToNotes = (
    unit: StorePianoEditor.Unit,
    chord: MusicTheory.KeyChordProps,
  ): PreviewUtil.SoundNote[] => {
    const notes: PreviewUtil.SoundNote[] = [];

    const relationStructs = calcRelationStructs(chord);

    const pitchIndexes = unit.voicingSounds.map((v) => {
      const [octaveIndex, structIndex] = v.split(".").map((v) => Number(v));
      const struct = relationStructs[structIndex];
      return (octaveIndex + struct.carryForwardOctave) * 12 + struct.key12;
    });

    /** ペダル要素は0レイヤーでのみ管理するためベースとして保持する */
    const baseCols = unit.layers[0].cols;

    unit.layers.forEach((l) => {
      // console.log(l);
      l.items.forEach((src) => {
        const note = convSrcToNote(src);
        const col = l.cols[note.colIndex];
        const norm: StoreMelody.Norm = col;
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

  const calcRelationStructs = (chord: MusicTheory.KeyChordProps) => {
    const symbolProps = MusicTheory.getSymbolProps(chord.symbol);
    const relationStructs: {
      /** オクターブ繰り上げ */
      carryForwardOctave: number;
      key12: number;
    }[] = symbolProps.structs.map((s) => {
      const tempPitchIndex =
        chord.key12 + MusicTheory.getIntervalFromRelation(s);
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
export default PianoArrangePreviewUtil;
