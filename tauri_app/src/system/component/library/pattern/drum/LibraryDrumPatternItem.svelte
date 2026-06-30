<script lang="ts">
  import type FinderState from "../../../../store/state/data/arrange/finder-state";

  export let finder: FinderState.Drum.Finder;
  export let item: FinderState.Drum.PatternItem;
  export let index: number;
  export let isRegular: boolean;

  $: isFocus = finder.cursor === index;
</script>

<div class="wrap" data-focus={isFocus} data-regular={isRegular}>
  {#if isRegular}
    <div class="regular-mark">REG</div>
  {/if}
  <div class="label">Pattern {item.patternNo}</div>
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
    font-size: 14px;
    font-weight: 700;
    line-height: 66px;
    text-align: center;
  }

  .wrap[data-regular="true"] {
    background-color: rgba(74, 55, 18, 0.92);
    color: rgba(255, 241, 204, 0.96);
  }

  .wrap[data-focus="true"] {
    border: 1px solid rgb(0, 241, 229);
    background-color: rgba(0, 240, 208, 0.18);
  }

  .wrap[data-focus="true"][data-regular="true"] {
    background-color: rgba(72, 93, 45, 0.92);
  }

  .regular-mark {
    display: inline-block;
    position: absolute;
    top: 4px;
    right: 5px;
    height: 16px;
    padding: 0 4px;
    box-sizing: border-box;
    border: 1px solid rgba(255, 223, 136, 0.8);
    background-color: rgba(255, 211, 89, 0.22);
    color: rgb(255, 228, 151);
    font-size: 10px;
    font-weight: 800;
    line-height: 14px;
  }

  .label {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
