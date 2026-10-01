<script lang="ts">
  import { onDestroy, tick } from "svelte";
  import { get } from "svelte/store";
  import Layout from "../../../layout/layout-constant";
  import createArrangeSelector from "../../../service/arrange/arrange-selector";
  import { controlStore, dataStore, refStore } from "../../../store/global-store";
  import DrumEditorState from "../../../store/state/data/arrange/drum/drum-editor-state";

  let colRefs: HTMLElement[] = [];

  const syncColRefs = (colCount: number) => {
    const refState = get(refStore);
    refState.arrange.drum.cols = [];
    Array.from({ length: colCount }, (_, colIndex) => {
      const ref = colRefs[colIndex];
      if (ref == undefined) return;
      refState.arrange.drum.cols.push({ colIndex, ref });
    });
    refStore.set({ ...refState });
  };

  const clearColRefs = () => {
    const refState = get(refStore);
    refState.arrange.drum.cols = [];
    refStore.set({ ...refState });
  };

  onDestroy(clearColRefs);

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
  $: label = DrumEditorState.getCriteriaDivLabel(
    criteriaDiv,
    arrange.target.scoreBase.rhythm.ts,
  );
  $: cols = Array.from({ length: colCount }, (_, index) => index);
  $: tick().then(() => syncColRefs(colCount));
</script>

<div class="frame">
  <div class="content" style:width={`${colWidth * colCount + 1}px`}>
    {#each cols as index}
      <div
        class="col"
        class:beat-head={index % criteriaDiv === 0}
        style:width={`${colWidth}px`}
        bind:this={colRefs[index]}
      >
        <div class="inner">
          <span>{label}</span>
        </div>
        {#if editor.control === "col" && editor.phase === "edit" && editor.cursorX === index}
          <div class="focus"></div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .frame {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--ap-backing-len-height);
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.42);
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

  .col {
    display: inline-block;
    position: relative;
    height: 100%;
    box-sizing: border-box;
    background-color: rgb(204, 228, 228);
    border-left: 1px solid rgba(35, 66, 80, 0.32);
  }

  .col.beat-head {
    border-left: 3px solid rgba(35, 66, 80, 0.68);
  }

  .col:last-child {
    border-right: 1px solid rgba(35, 66, 80, 0.32);
  }

  .inner {
    display: inline-block;
    position: relative;
    margin: 1px 0 0 1px;
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    box-sizing: border-box;
    border: 1px solid rgba(48, 48, 48, 0.82);
    border-radius: 2px;
    color: rgb(51, 67, 136);
    font-size: 12px;
    font-weight: 600;
    line-height: 26px;
    overflow: hidden;
    text-align: center;
    text-overflow: clip;
  }

  .inner span {
    display: inline-block;
    min-width: 0;
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
