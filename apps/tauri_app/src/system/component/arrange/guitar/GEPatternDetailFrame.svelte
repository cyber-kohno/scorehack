<script lang="ts">
  import RhythmTheory from "../../../domain/theory/rhythm-theory";
  import Layout from "../../../layout/layout-constant";
  import createArrangeSelector from "../../../service/arrange/arrange-selector";
  import { controlStore, dataStore, refStore } from "../../../store/global-store";
  import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";

  export let event!: GuitarEditorState.PatternEvent;

  $: selector = createArrangeSelector({ control: $controlStore, data: $dataStore });
  $: arrange = selector.getArrange();
  $: editor = selector.getGuitarEditor();
  $: backing = (() => {
    const backing = editor.backing;
    if (backing == null) throw new Error();
    return backing;
  })();
  $: beatWidth =
    Layout.arrange.piano.DIV1_WIDTH /
    (RhythmTheory.getBeatDiv16Count(arrange.target.scoreBase.rhythm.ts) / 4);
  $: getColWidth = (col: GuitarEditorState.Col) => {
    return GuitarEditorState.getColWidthCriteriaBeatWidth(col, beatWidth);
  };

  $: velocityWidth = `${Math.floor(event.velocity * 5)}%`;
  $: isStroke = event.fromString !== event.toString;
  $: speedWidth = isStroke ? `${Math.floor(event.speed * 5)}%` : "0%";
  $: frameStyle = (() => {
    const pattern = $refStore.arrange.guitar.pattern;
    if (pattern == undefined) return "";
    const rect = pattern.getBoundingClientRect();
    const colLeft = backing.cols
      .slice(0, event.colIndex)
      .reduce((total, col) => total + getColWidth(col) + 1, 1);
    const matrixHeight =
      (Layout.arrange.piano.BACKING_RECORD_HEIGHT + 1) *
      GuitarEditorState.STANDARD_TUNING.length;
    const left = rect.left + colLeft - pattern.scrollLeft;
    const top = rect.top + matrixHeight + 8;
    return `left: ${left}px; top: ${top}px;`;
  })();
</script>

<div class="wrap" data-stroke={isStroke} style={frameStyle}>
  <div class="label">velocity</div>
  <div class="record">
    <div class="value-frame">
      <div class="value" style:width={velocityWidth}></div>
    </div>
  </div>
  {#if isStroke}
    <div class="label">speed</div>
    <div class="record">
      <div class="value-frame">
        <div class="value" style:width={speedWidth}></div>
      </div>
    </div>
  {/if}
</div>

<style>
  .wrap {
    display: inline-block;
    position: fixed;
    width: 200px;
    height: 40px;
    background-color: rgba(216, 223, 223, 0.897);
    border: 1px solid #494949;
    border-radius: 4px;
    z-index: 20;
    white-space: normal;
  }
  .wrap[data-stroke="true"] {
    height: 80px;
  }
  .label {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 20px;
    box-sizing: border-box;
    color: rgb(175, 0, 0);
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
    padding: 0 0 0 2px;
  }
  .record {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 20px;
  }
  .value-frame {
    display: inline-block;
    position: relative;
    margin: 3px 0 0 6px;
    width: calc(100% - 12px);
    height: 14px;
    box-sizing: border-box;
    background-color: rgba(231, 231, 231, 0.897);
    border: 1px solid #000;
  }
  .value {
    display: inline-block;
    height: 100%;
    background-color: rgba(103, 181, 218, 0.897);
  }
</style>
