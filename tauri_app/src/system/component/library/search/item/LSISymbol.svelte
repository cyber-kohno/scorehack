<script lang="ts">
  import ChordTheory from "../../../../domain/theory/chord-theory";
  import LSItemFrame from "./common/LSItemFrame.svelte";
  import LSOption from "./common/LSOption.svelte";

  export let isFocus = false;
  export let symbol!: ChordTheory.ChordSymol;

  $: symbols = (() => {
    const tones = ChordTheory.getSymbolProps(symbol).structs.length;
    return ChordTheory.SymbolTable[tones - 3];
  })();
</script>

<LSItemFrame title="Symbol" {isFocus}>
  <div class="options">
    {#each symbols as item}
      <LSOption isActive={symbol === item}>{item}</LSOption>
    {/each}
  </div>
</LSItemFrame>

<style>
  .options {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 4px;
    width: 100%;
    height: 124px;
    --ls-option-width: calc((100% - 8px) / 3);
  }
</style>
