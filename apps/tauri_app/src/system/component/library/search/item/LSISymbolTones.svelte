<script lang="ts">
  import ChordTheory from "../../../../domain/theory/chord-theory";
  import LSItemFrame from "./common/LSItemFrame.svelte";
  import LSOption from "./common/LSOption.svelte";

  const tones = ChordTheory.SymbolTable.map((_, index) => index + 3);

  export let isFocus = false;
  export let symbol!: ChordTheory.ChordSymol;

  $: currentTones = ChordTheory.getSymbolProps(symbol).structs.length;
</script>

<LSItemFrame title="Symbol Tones" {isFocus}>
  <div class="options">
    {#each tones as tone}
      <LSOption isActive={currentTones === tone}>{tone}</LSOption>
    {/each}
  </div>
</LSItemFrame>

<style>
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    width: 100%;
    --ls-option-width: calc((100% - 16px) / 5);
  }
</style>
