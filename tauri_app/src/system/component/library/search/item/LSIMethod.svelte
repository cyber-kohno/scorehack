<script lang="ts">
  import type ArrangeState from "../../../../store/state/data/arrange/arrange-state";
  import LSItemFrame from "./common/LSItemFrame.svelte";
  import LSOption from "./common/LSOption.svelte";

  export let isFocus = false;
  export let method!: ArrangeState.ArrangeMedhod;
</script>

<LSItemFrame title="Method" {isFocus}>
  <div class="options">
    <LSOption isActive={method === "piano"}>Piano</LSOption>
    <LSOption isActive={method === "guitar"}>Guitar</LSOption>
  </div>
</LSItemFrame>

<style>
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    width: 100%;
    --ls-option-width: calc((100% - 4px) / 2);
  }
</style>
