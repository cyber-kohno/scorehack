<script lang="ts">
  import store from "../../system/store/store";
  import { getShellMode } from "../../state/ui-state/shell-ui-store";
  import ModeLabel from "./ModeLabel.svelte";

  $: mode = getShellMode($store);
</script>

<div class="wrap">
  <ModeLabel name="Harmonize" isActive={mode === "harmonize"} />
  <ModeLabel name="Melody" isActive={mode === "melody"} />
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--root-header-height);
    background-color: #a2b7c4;
  }
</style>
