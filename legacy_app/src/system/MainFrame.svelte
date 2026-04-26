<script lang="ts">
    import ArrangeFrame from "./component/arrange/ArrangeFrame.svelte";
    import ArrangeFinderFrame from "./component/arrange/finder/ArrangeFinderFrame.svelte";
    import RootHeader from "./component/header/RootHeader.svelte";
    import OutlineFrame from "./component/outline/OutlineFrame.svelte";
    import TerminalFrame from "./component/terminal/TerminalFrame.svelte";
    import TimelineFrame from "./component/timeline/TimelineFrame.svelte";
    import store from "./store/store";

    $: isDispTerminal = $store.terminal != null;

    $: isDispArrangeEditor = (() => {
        const arrange = $store.control.outline.arrange;
        if (arrange == null) return false;
        return arrange.editor != undefined;
    })();

    $: isDispArrangeFinder = (() => {
        const arrange = $store.control.outline.arrange;
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
