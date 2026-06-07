<script lang="ts">
  import TonalityTheory from "../../../../domain/theory/tonality-theory";
  import LSItemFrame from "./common/LSItemFrame.svelte";
  import LSOption from "./common/LSOption.svelte";

  export let isFocus = false;
  export let root!: number;
</script>

<LSItemFrame title="Root" {isFocus}>
  <div class="options">
    {#each TonalityTheory.PITCH_NAMES as name, pitch}
      <LSOption isActive={root === pitch}>{name}</LSOption>
    {/each}
  </div>
</LSItemFrame>

<style>
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    width: 100%;
    --ls-option-width: calc((100% - 12px) / 4);
  }
</style>
