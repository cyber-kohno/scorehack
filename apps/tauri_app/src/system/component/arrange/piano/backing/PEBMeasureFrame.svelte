<script lang="ts">
  import { refStore } from "../../../../store/global-store";
  import PianoBackingState from "../../../../store/state/data/arrange/piano/piano-backing-state";
  import { getPianoArrange, getPianoBacking } from "../piano-editor-context";
  import BackingMeasureFrame from "../../common/BackingMeasureFrame.svelte";

  const arrange = getPianoArrange();
  const bp = getPianoBacking();

  $: pianoRef = $refStore.arrange.piano;

  $: ts = $arrange.target.scoreBase.rhythm.ts;
  $: beat = $arrange.target.beat;
  $: cols = $bp.getCurLayer().cols;

  $: colRanges = (() => {
    let x = 1;
    let beat = 0;

    return cols.map((col, index) => {
      const width = $bp.getColWidth(col);
      const beatLen = (1 / col.div) * PianoBackingState.getDotRate(col.dot);
      const range = {
        index,
        x,
        width,
        startBeat: beat,
        endBeat: beat + beatLen,
      };

      x += width + 1;
      beat += beatLen;
      if (index === cols.length - 1) x += 1;
      return range;
    });
  })();
  $: frameWidth = $bp.getColFrameWidth();
</script>

<BackingMeasureFrame
  {ts}
  {beat}
  {colRanges}
  {frameWidth}
  bindFrame={(element) => {
    pianoRef.measure = element;
  }}
/>
