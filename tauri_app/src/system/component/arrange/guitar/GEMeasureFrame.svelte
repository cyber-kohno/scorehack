<script lang="ts">
  import RhythmTheory from "../../../domain/theory/rhythm-theory";
  import Layout from "../../../layout/layout-constant";
  import createArrangeSelector from "../../../service/arrange/arrange-selector";
  import { controlStore, dataStore, refStore } from "../../../store/global-store";
  import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";
  import BackingMeasureFrame from "../common/BackingMeasureFrame.svelte";

  $: selector = createArrangeSelector({ control: $controlStore, data: $dataStore });
  $: arrange = selector.getArrange();
  $: editor = selector.getGuitarEditor();
  $: backing = (() => {
    const backing = editor.backing;
    if (backing == null) throw new Error();
    return backing;
  })();
  $: guitarRef = $refStore.arrange.guitar;

  $: ts = arrange.target.scoreBase.rhythm.ts;
  $: beat = arrange.target.beat;
  $: beatWidth =
    Layout.arrange.piano.DIV1_WIDTH /
    (RhythmTheory.getBeatDiv16Count(ts) / 4);
  $: colRanges = (() => {
    let x = 1;
    let beat = 0;

    return backing.cols.map((col, index) => {
      const width = GuitarEditorState.getColWidthCriteriaBeatWidth(col, beatWidth);
      const beatLen = (1 / col.div) * GuitarEditorState.getDotRate(col.dot);
      const range = {
        index,
        x,
        width,
        startBeat: beat,
        endBeat: beat + beatLen,
      };

      x += width + 1;
      beat += beatLen;
      if (index === backing.cols.length - 1) x += 1;
      return range;
    });
  })();
  $: frameWidth = backing.cols.reduce((total, col, index) => {
    const width = GuitarEditorState.getColWidthCriteriaBeatWidth(col, beatWidth);
    total += width + 1;
    if (index === backing.cols.length - 1) total += 1;
    return total;
  }, 0);
</script>

<BackingMeasureFrame
  {ts}
  {beat}
  {colRanges}
  {frameWidth}
  bindFrame={(element) => {
    guitarRef.measure = element;
  }}
/>
