<script lang="ts">
  import type FinderState from "../../../../../store/state/data/arrange/finder-state";
  import type DrumEditorState from "../../../../../store/state/data/arrange/drum/drum-editor-state";
  import ADFinderExistMark from "./ADFinderExistMark.svelte";
  import ADFinderPattern from "./ADFinderPattern.svelte";

  export let finder: FinderState.Drum.Finder;
  export let item: FinderState.Drum.PatternItem;
  export let index: number;
  export let pattern: DrumEditorState.Pattern;
  export let mappings: DrumEditorState.Mapping[];
  export let isRegular: boolean;

  $: isFocus = finder.cursor === index;
  $: isApply = finder.apply === index;
</script>

<div class="wrap" data-focus={isFocus} data-regular={isRegular} data-apply={isApply}>
  {#if isFocus}
    <div class="focus"></div>
  {/if}
  <ADFinderExistMark {isRegular} />
  <div class="label">#{item.patternNo}</div>
  <div class="body">
    <ADFinderPattern {pattern} {mappings} />
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: calc(100% - 4px);
    height: 66px;
    margin: 2px;
    box-sizing: border-box;
    background-color: rgba(18, 53, 61, 0.86);
    color: rgba(238, 250, 255, 0.92);
    overflow: hidden;
  }

  .wrap[data-regular="true"] {
    background-color: rgba(74, 74, 18, 0.92);
  }

  .wrap[data-apply="true"] {
    background-color: rgba(232, 161, 74, 0.62);
  }

  .wrap[data-apply="true"][data-regular="true"] {
    background-color: rgba(186, 134, 53, 0.72);
  }

  .focus {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    border: 1px solid rgb(0, 241, 229);
    box-sizing: border-box;
    background-color: rgba(0, 240, 208, 0.14);
    pointer-events: none;
  }

  .label {
    display: inline-block;
    position: absolute;
    left: 5px;
    top: 4px;
    height: 14px;
    color: rgba(235, 250, 255, 0.72);
    font-size: 11px;
    font-weight: 800;
    line-height: 14px;
    z-index: 1;
  }

  .body {
    display: inline-block;
    position: absolute;
    left: 5px;
    top: 19px;
    width: calc(100% - 10px);
    height: calc(100% - 24px);
    overflow: hidden;
  }
</style>
