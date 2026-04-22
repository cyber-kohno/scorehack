<script lang="ts">
  import type StoreCache from "../../../state/cache-state/cache-store";

  export let chordCache: StoreCache.ChordCache;
  export let index: number;

  $: void index;
</script>

<div
  class="wrap"
  style:left="{chordCache.viewPosLeft}px"
  style:width="{chordCache.viewPosWidth}px"
></div>

<style>
  .wrap {
    display: inline-block;
    position: absolute;
    z-index: 1;
    top: var(--pitch-top-margin);
    height: var(--pitch-frame-height);
  }
</style>
