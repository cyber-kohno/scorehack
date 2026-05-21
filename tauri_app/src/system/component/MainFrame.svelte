<script lang="ts">  import { controlStore, terminalStore, trackManagerStore } from "../store/global-store";
  import ArrangeFrame from "./arrange/ArrangeFrame.svelte";
  import ArrangeFinderFrame from "./arrange/finder/ArrangeFinderFrame.svelte";
  import ConfirmDialogLayer from "./common/ConfirmDialogLayer.svelte";
  import FloatingTextInputLayer from "./common/FloatingTextInputLayer.svelte";
  import RootHeader from "./header/RootHeader.svelte";
  import OutlineFrame from "./outline/OutlineFrame.svelte";
  import TerminalFrame from "./terminal/TerminalFrame.svelte";
  import TimelineFrame from "./timeline/TimelineFrame.svelte";
  import ToastLayer from "./common/ToastLayer.svelte";
  import TrackManagerFrame from "./track/TrackManagerFrame.svelte";

    $: isDispTerminal = $terminalStore != null;
    $: isDispTrackManager = $trackManagerStore != null && $controlStore.outline.arrange == null;

    $: isDispArrangeEditor = (() => {
        const arrange = $controlStore.outline.arrange;
        if (arrange == null) return false;
        return arrange.editor != undefined;
    })();

    $: isDispArrangeFinder = (() => {
        const arrange = $controlStore.outline.arrange;
        if (arrange == null) return false;
        return arrange.finder != undefined;
    })();
</script>

<div class="wrap">
    <RootHeader />
    <div class="main">
        <OutlineFrame />
        <TimelineFrame />
    </div>
    {#if isDispTerminal}
        <TerminalFrame />
    {/if}
    {#if isDispArrangeEditor}
        <ArrangeFrame />
    {/if}
    {#if isDispArrangeFinder}
        <ArrangeFinderFrame />
    {/if}
    {#if isDispTrackManager}
        <TrackManagerFrame />
    {/if}
    <ConfirmDialogLayer />
    <FloatingTextInputLayer />
    <ToastLayer />
</div>

<style>
    .wrap {
        display: inline-block;
        position: relative;
        width: 100%;
        height: 100%;
        background-color: rgb(155, 216, 216);
    }

    .main {
        display: inline-block;
        position: relative;
        width: 100%;
        height: calc(100% - var(--root-header-height));
        background-color: #aced09;
    }
</style>
