<script lang="ts">
  import store from "../../../store/store";
  import BaseBlock from "./BaseBlock.svelte";
  import ChordBlock from "./ChordBlock.svelte";
  import GridFocus from "./GridFocus.svelte";
  import MelodyCursor from "../../../../ui/melody/MelodyCursor.svelte";
  import PreviewPositionLine from "../../../../ui/playback/PreviewPositionLine.svelte";
  import StoreRef from "../../../store/props/storeRef";
  import ShadeTracks from "../../../../ui/melody/score/ShadeTracks.svelte";
  import ActiveTrack from "../../../../ui/melody/score/ActiveTrack.svelte";
  import TimelineTailMargin from "../TimelineTailMargin.svelte";
  import { isPlaybackActive } from "../../../../state/ui-state/playback-ui-store";
  import {
    getTimelineBaseCaches,
    getTimelineChordCaches,
  } from "../../../../state/cache-state/timeline-cache";

  $: baseCaches = getTimelineBaseCaches($store);
  $: chordCaches = getTimelineChordCaches($store);

  $: isMelodyMode = (() => $store.control.mode === "melody")();
  $: isPreview = isPlaybackActive($store);
  $: isDispMelodyCursor =
    isMelodyMode && !isPreview && $store.control.melody.focus === -1;

  $: scrollLimitProps = StoreRef.getScrollLimitProps($store.ref.grid);
</script>

<div class="wrap" data-isPreview={isPreview} bind:this={$store.ref.grid}>
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
