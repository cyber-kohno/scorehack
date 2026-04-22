<script lang="ts">
import store from "../../../state/root-store";
  import BaseBlock from "./BaseBlock.svelte";
  import ChordBlock from "./ChordBlock.svelte";
  import GridFocus from "./GridFocus.svelte";
  import MelodyCursor from "../../melody/MelodyCursor.svelte";
  import PreviewPositionLine from "../../playback/PreviewPositionLine.svelte";
  import ShadeTracks from "../../melody/score/ShadeTracks.svelte";
  import ActiveTrack from "../../melody/score/ActiveTrack.svelte";
  import TimelineTailMargin from "../TimelineTailMargin.svelte";
  import { isPlaybackActive } from "../../../state/ui-state/playback-ui-store";
  import {
    getTimelineGridScrollLimitProps,
    setTimelineGridRef,
    timelineViewportStore,
  } from "../../../state/session-state/timeline-viewport-store";
  import {
    getTimelineBaseCaches,
    getTimelineChordCaches,
  } from "../../../state/cache-state/timeline-cache";
  import { modeStore } from "../../../state/session-state/mode-store";
  import { melodyFocusStore } from "../../../state/session-state/melody-focus-store";

  $: baseCaches = getTimelineBaseCaches($store);
  $: chordCaches = getTimelineChordCaches($store);

  $: isMelodyMode = (() => $modeStore === "melody")();
  $: isPreview = isPlaybackActive($store);
  $: isDispMelodyCursor =
    isMelodyMode && !isPreview && $melodyFocusStore.focus === -1;

  $: scrollLimitProps = (() => {
    $timelineViewportStore;
    return getTimelineGridScrollLimitProps();
  })();
  let gridRef: HTMLElement | undefined = undefined;
  $: setTimelineGridRef(gridRef);
</script>

<div class="wrap" data-isPreview={isPreview} bind:this={gridRef}>
  {#if scrollLimitProps != null}
    {#each baseCaches as baseCache}
      <BaseBlock {baseCache} {scrollLimitProps} />
    {/each}
    {#each chordCaches as chordCache, index}
      <ChordBlock {chordCache} {index} />
    {/each}
    <TimelineTailMargin />
  {/if}
  <GridFocus />
  {#if isDispMelodyCursor}
    <MelodyCursor />
  {/if}

  <div class="noteswrap" data-isMelodyMode={isMelodyMode}>
    {#if isMelodyMode}
      <ActiveTrack />
    {/if}
    <ShadeTracks />
  </div>

  {#if isPreview}
    <PreviewPositionLine />
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
    display: inline-block;
    position: relative;
  }

  .noteswrap[data-isMelodyMode="false"] {
    opacity: 0.8;
  }
</style>
