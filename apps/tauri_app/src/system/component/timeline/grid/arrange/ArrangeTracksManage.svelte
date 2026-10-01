<script lang="ts">
  import type DerivedState from "../../../../store/state/derived-state";

  export let chordCache: DerivedState.ChordCache;

  $: hasOverLengthError =
    chordCache.error.arrange.overLengthTrackIndexes.length > 0;
</script>

{#if hasOverLengthError}
  <div class="over-length-blind"></div>
{/if}

<style>
  .over-length-blind {
    display: inline-block;
    position: absolute;
    inset: 0;
    z-index: 1;
    background-color: rgba(169, 0, 0, 0.38);
    pointer-events: none;
  }
</style>
