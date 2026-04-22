import Layout from "../../styles/tokens/layout-tokens";
import StorePianoBacking from "../../domain/arrange/piano-backing-store";
import type { StoreProps } from "../../state/root-store";
import { getArrangePianoRefs } from "../../state/session-state/arrange-ref-store";
import { smoothScrollLeft } from "../viewport/scroll-actions";
import { getPianoArrangeEditor } from "./arrange-state";

export const adjustPianoEditorColumnScroll = (lastStore: StoreProps) => {
  const backing = getPianoArrangeEditor(lastStore).backing;
  const pianoRef = getArrangePianoRefs();
  if (
    pianoRef.col == undefined ||
    pianoRef.table == undefined ||
    pianoRef.pedal == undefined ||
    backing == null
  ) {
    return;
  }

  const width = pianoRef.col.getBoundingClientRect().width;
  const getColWidth = (col: StorePianoBacking.Col) =>
    StorePianoBacking.getColWidthCriteriaBeatWidth(
      col,
      Layout.arrange.piano.DIV1_WIDTH,
    );

  const currMiddle = backing.layers[backing.layerIndex].cols.reduce(
    (total, cur, i) => {
      const colWidth = getColWidth(cur);
      if (i < backing.cursorX) total += colWidth;
      else if (i === backing.cursorX) total += colWidth / 2;
      return total;
    },
    0,
  );
  const left = currMiddle - width / 2;
  smoothScrollLeft(lastStore, [pianoRef.col, pianoRef.table, pianoRef.pedal], left);
};
