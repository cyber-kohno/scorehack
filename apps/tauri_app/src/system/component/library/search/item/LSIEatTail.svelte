<script lang="ts">
  import LSItemFrame from "./common/LSItemFrame.svelte";
  import LSOption from "./common/LSOption.svelte";

  const values = [-2, -1, 0, 1, 2];
  const format = (value: number) => {
    if (value === 0) return "±0";
    return value > 0 ? `+${value}` : `${value}`;
  };

  export let isFocus = false;
  export let eatTail!: number;
</script>

<LSItemFrame title="Eat Tail" {isFocus}>
  <div class="options">
    {#each values as value}
      <LSOption isActive={eatTail === value}>{format(value)}</LSOption>
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
