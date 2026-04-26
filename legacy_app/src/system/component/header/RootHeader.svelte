<script lang="ts">
  import store from "../../store/store";
  import ModeSwitch from "./ModeSwitch.svelte";

  $: mode = $store.control.mode;
</script>

<div class="wrap">
  <ModeSwitch name="Harmonize" isActive={mode === "harmonize"} />
  <ModeSwitch name="Melody" isActive={mode === "melody"} />
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
