<script lang="ts">
  import ArrangeFrame from "../../system/component/arrange/ArrangeFrame.svelte";
  import ArrangeFinderFrame from "../../system/component/arrange/finder/ArrangeFinderFrame.svelte";
  import TerminalFrame from "../terminal/TerminalFrame.svelte";
  import store from "../../system/store/store";
  import {
    isArrangeEditorVisible,
    isArrangeFinderVisible,
    isTerminalVisible,
  } from "../../state/ui-state/shell-ui-store";
  import AppHeader from "../header/AppHeader.svelte";
  import MainWorkspace from "./MainWorkspace.svelte";

  $: isDispTerminal = isTerminalVisible($store);
  $: isDispArrangeEditor = isArrangeEditorVisible($store);
  $: isDispArrangeFinder = isArrangeFinderVisible($store);
</script>

<div class="wrap">
  <AppHeader />
  <MainWorkspace />
  {#if isDispTerminal}
    <TerminalFrame />
  {/if}
  {#if isDispArrangeEditor}
    <ArrangeFrame />
  {/if}
  {#if isDispArrangeFinder}
    <ArrangeFinderFrame />
  {/if}
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    background-color: rgb(155, 216, 216);
  }
</style>
