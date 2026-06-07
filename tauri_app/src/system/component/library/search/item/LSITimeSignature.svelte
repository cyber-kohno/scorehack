<script lang="ts">
  import RhythmTheory from "../../../../domain/theory/rhythm-theory";
  import LSItemFrame from "./common/LSItemFrame.svelte";
  import LSOption from "./common/LSOption.svelte";

  const tsNames = RhythmTheory.getTSNames();

  export let isFocus = false;
  export let ts!: RhythmTheory.TimeSignature;

  $: currentName = RhythmTheory.formatTS(ts);
</script>

<LSItemFrame title="Time Signature" {isFocus}>
  <div class="options">
    {#each tsNames as name}
      <LSOption isActive={currentName === name}>{name}</LSOption>
    {/each}
  </div>
</LSItemFrame>

<style>
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    width: 100%;
    --ls-option-width: calc((100% - 8px) / 3);
  }
</style>
