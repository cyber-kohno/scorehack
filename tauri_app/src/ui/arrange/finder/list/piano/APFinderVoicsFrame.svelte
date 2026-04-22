<script lang="ts">
  import { onMount } from "svelte";
  import APFinderVoicItem from "./APFinderVoicItem.svelte";
import type StorePianoEditor from "../../../../../domain/arrange/piano-editor-store";
import type ArrangeLibrary from "../../../../../domain/arrange/arrange-library";
  import { upsertArrangeFinderRecordRef } from "../../../../../state/session-state/arrange-ref-store";

  export let finder: ArrangeLibrary.PianoArrangeFinder;
  export let sndsPatts: StorePianoEditor.SoundsPattern[];
  export let isRecordFocus: boolean;
  export let backingIndex: number;
  export let usageBkg: StorePianoEditor.Preset;

  let ref: HTMLElement | null = null;
  onMount(() => {
    if (ref != null) {
      if (backingIndex === finder.cursor.backing) {
        const left = finder.cursor.sounds * 109;
        ref.scrollTo({ left });
      }
      upsertArrangeFinderRecordRef(backingIndex, ref);
    }
  });
</script>

<div class="wrap" bind:this={ref}>
  {#each sndsPatts as patt, soundsIndex}
    <APFinderVoicItem
      {finder}
      {backingIndex}
      {soundsIndex}
      structCnt={patt.category.structCnt}
      voicingSounds={patt.sounds}
      {isRecordFocus}
      {usageBkg}
    />
  {/each}
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    background-color: rgba(0, 255, 255, 0.47);
    width: 100%;
    height: 100%;
    overflow: hidden;
    white-space: nowrap;
  }
</style>
