<script lang="ts">
  import Layout from "../../../layout/layout-constant";
  import createArrangeSelector from "../../../service/arrange/arrange-selector";
  import { controlStore, dataStore } from "../../../store/global-store";
  import DrumEditorState from "../../../store/state/data/arrange/drum/drum-editor-state";
  import DEHitMark from "./DEHitMark.svelte";

  $: selector = createArrangeSelector({ control: $controlStore, data: $dataStore });
  $: arrange = selector.getArrange();
  $: editor = selector.getDrumEditor();
  $: criteriaDiv = DrumEditorState.getEffectiveCriteriaDiv(
    editor.criteriaDiv,
    arrange.target.beat,
    arrange.target.scoreBase.rhythm.ts,
  );
  $: colCount = DrumEditorState.getColumnCount(
    criteriaDiv,
    arrange.target.beat,
    arrange.target.scoreBase.rhythm.ts,
  );
  $: colWidth = Layout.arrange.piano.DIV1_WIDTH / criteriaDiv;
  $: cols = Array.from({ length: colCount }, (_, index) => {
    const colDiv = editor.colDivs.find(item => item.index === index);
    const div = colDiv?.div ?? 1;
    return { index, div, width: colWidth / div };
  });
  $: cells = cols.flatMap((col) => {
    return Array.from({ length: col.div }, (_, splitIndex) => ({
      key: `${col.index}.${splitIndex}`,
      width: col.width,
    }));
  });
  $: hitKeys = new Set(editor.hits.map((hit) => `${hit.colIndex}.${hit.recordIndex}`));
</script>

<div class="frame">
  <div class="content" style:width={`${colWidth * colCount + 1}px`}>
    {#each Array.from({ length: editor.records.length }, (_, i) => editor.records.length - 1 - i) as recordIndex}
      <div class="record">
        {#each cells as cell, cellIndex (cell.key)}
          <div class="cell" style:width={`${cell.width}px`}>
            <div class="inner"></div>
            {#if hitKeys.has(`${cellIndex}.${recordIndex}`)}
              <DEHitMark />
            {/if}
            {#if editor.control === "hits" && editor.phase === "edit" && editor.cursorX === cellIndex && editor.cursorY === recordIndex}
              <div class="focus"></div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .frame {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.32);
    color: #234250;
    font-size: 14px;
    font-weight: 700;
    overflow: hidden;
    white-space: nowrap;
    * {
      vertical-align: top;
    }
  }

  .content {
    display: inline-block;
    position: relative;
    height: 100%;
  }

  .record {
    display: block;
    position: relative;
    margin: 1px 0 0 0;
    height: var(--ap-backing-record-height);
    padding: 0;
  }

  .cell {
    display: inline-block;
    position: relative;
    margin: 0 0 0 1px;
    height: 100%;
    padding: 0;
    background-color: rgba(60, 53, 128, 0.685);
    border-radius: 2px;
  }

  .inner {
    display: inline-block;
    position: relative;
    margin: 5px 0;
    width: 100%;
    height: calc(100% - 10px);
    box-sizing: border-box;
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
</style>
