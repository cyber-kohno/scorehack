<script lang="ts">    import BaseBlock from "./BaseBlock.svelte";
    import ChordBlock from "./ChordBlock.svelte";
    import GridFocus from "./GridFocus.svelte";
    import Cursor from "../../melody/Cursor.svelte";
    import RefState from "../../../store/state/ref-state";
    import ShadeTracks from "../../melody/score/ShadeTracks.svelte";
    import ActiveTrack from "../../melody/score/ActiveTrack.svelte";
    import PreviewPosLine from "./PreviewPosLine.svelte";
    import TimelineTailMargin from "../TimelineTailMargin.svelte";
    import { controlStore, derivedStore, playbackStore, refStore } from "../../../store/global-store";

    $: cache = $derivedStore;

    $: isMelodyMode = (() => $controlStore.mode === "melody")();

    $: isPlayback = $playbackStore.timerKeys != null;
    $: isArrangeEditorActive = $controlStore.outline.arrange?.editor != undefined;
    $: isPreview = isPlayback && !isArrangeEditorActive;
    /** メロディのカーソル */
    $: isDispMelodyCursor =
        isMelodyMode && !isPlayback && $controlStore.melody.focus === -1;

    $: scrollLimitProps = RefState.getScrollLimitProps($refStore.grid);
</script>

<div class="wrap" data-isPreview={isPreview} bind:this={$refStore.grid}>
    {#if scrollLimitProps != null}
        {#each cache.baseCaches as baseCache}
            <BaseBlock {baseCache} {scrollLimitProps} />
        {/each}
        {#each cache.chordCaches as chordCache, index}
            <ChordBlock {chordCache} {index} />
        {/each}
        <!-- タイムライン終端の余白 -->
        <TimelineTailMargin />
    {/if}
    <!-- アウトラインのフォーカス位置の表示（コード要素と区切り要素[赤線]で区別） -->
    <GridFocus />
    {#if isDispMelodyCursor}
        <Cursor />
    {/if}

    <div class="noteswrap" data-isMelodyMode={isMelodyMode}>
        {#if isMelodyMode}
            <ActiveTrack />
        {/if}
        <ShadeTracks />
    </div>

    {#if isPreview}
        <PreviewPosLine />
    {/if}
</div>

<style>
    .wrap {
        display: inline-block;
        position: relative;
        width: calc(100% - var(--pitch-width));
        height: 100%;
        overflow: hidden;
        vertical-align: top;
    }
    .wrap[data-isPreview="true"] {
        background-color: rgba(0, 0, 0, 0.712);
    }

    .noteswrap {
        /* background-color: #647d92; */
        display: inline-block;
        position: relative;
    }
    .noteswrap[data-isMelodyMode="false"] {
        opacity: 0.8;
    }
</style>
