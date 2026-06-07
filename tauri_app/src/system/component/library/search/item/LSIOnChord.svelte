<script lang="ts">
  import TonalityTheory from "../../../../domain/theory/tonality-theory";
  import LSItemFrame from "./common/LSItemFrame.svelte";
  import LSOption from "./common/LSOption.svelte";

  export let isFocus = false;
  export let on!: number;
</script>

<LSItemFrame title="On Chord" {isFocus}>
  <div class="none">
    <LSOption isActive={on === -1}>None</LSOption>
  </div>
  <div class="options">
    {#each TonalityTheory.PITCH_NAMES as name, pitch}
      <LSOption isActive={on === pitch}>{name}</LSOption>
    {/each}
  </div>
</LSItemFrame>

<style>
  .none {
    width: 80px;
    margin-bottom: 4px;
  }

  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    width: 100%;
    --ls-option-width: calc((100% - 12px) / 4);
  }
</style>
