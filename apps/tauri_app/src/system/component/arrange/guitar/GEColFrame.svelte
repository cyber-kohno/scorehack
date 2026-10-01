<script lang="ts">
  import RhythmTheory from "../../../domain/theory/rhythm-theory";
  import Layout from "../../../layout/layout-constant";
  import { refStore, controlStore, dataStore } from "../../../store/global-store";
  import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";
  import createArrangeSelector from "../../../service/arrange/arrange-selector";

  $: selector = createArrangeSelector({ control: $controlStore, data: $dataStore });
  $: arrange = selector.getArrange();
  $: editor = selector.getGuitarEditor();
  $: backing = (() => {
    const backing = editor.backing;
    if (backing == null) throw new Error();
    return backing;
  })();
  $: guitarRef = $refStore.arrange.guitar;

  const getDispName = (col: GuitarEditorState.Col) => {
    const dot = col.dot ?? 0;
    return `${col.div * 4}n${".".repeat(dot)}`;
  };

  $: beatWidth =
    Layout.arrange.piano.DIV1_WIDTH /
    (RhythmTheory.getBeatDiv16Count(arrange.target.scoreBase.rhythm.ts) / 4);

  $: getColWidth = (col: GuitarEditorState.Col) => {
    return GuitarEditorState.getColWidthCriteriaBeatWidth(col, beatWidth);
  };

  $: isFocus = (index: number) => {
    return index === backing.cursorX && editor.control === "col";
  };
</script>

<div class="wrap" bind:this={guitarRef.col}>
  {#each backing.cols as col, index}
    <div class="col" style:width={`${getColWidth(col)}px`}>
      <div class="inner">{getDispName(col)}</div>
      {#if isFocus(index)}
        <div class="focus"></div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--ap-backing-len-height);
    overflow-x: hidden;
    white-space: nowrap;
    * {
      vertical-align: top;
    }
  }

  .col {
    display: inline-block;
    position: relative;
    margin: 0 0 0 1px;
    height: 100%;
    padding: 0;
    background-color: rgb(204, 228, 228);
  }

  .focus {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 237, 134, 0.473);
  }

  .inner {
    display: inline-block;
    position: relative;
    margin: 1px 0 0 1px;
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    box-sizing: border-box;
    border: 1px solid rgb(48, 48, 48);
    border-radius: 2px;
    color: rgb(51, 67, 136);
    font-size: 14px;
    font-weight: 600;
    line-height: 28px;
    overflow: hidden;
    text-align: center;
  }
</style>
