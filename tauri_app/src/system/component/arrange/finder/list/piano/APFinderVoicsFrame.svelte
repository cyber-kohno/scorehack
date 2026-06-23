<script lang="ts">
  import { refStore } from "../../../../../store/global-store";
  import { onMount } from "svelte";
  import APFinderVoicItem from "./APFinderVoicItem.svelte";
  import type PianoEditorState from "../../../../../store/state/data/arrange/piano/piano-editor-state";
  import type FinderState from "../../../../../store/state/data/arrange/finder-state";
  export let finder: FinderState.PianoArrangeFinder;
  export let sndsPatts: PianoEditorState.SoundsPattern[];
  export let isRecordFocus: boolean;
  export let backingIndex: number;
  export let usageBkg: PianoEditorState.Regular;

  const VOICING_CELL_WIDTH = 109;
  const getScrollLeft = (frame: HTMLElement, soundsIndex: number) => {
    const rect = frame.getBoundingClientRect();
    const targetCenter = soundsIndex * VOICING_CELL_WIDTH + VOICING_CELL_WIDTH / 2;
    return Math.max(0, targetCenter - rect.width / 2);
  };

  let ref: HTMLElement | null = null;
  onMount(() => {
    if (ref != null) {
      const finderRefs = $refStore.arrange.finder;

      let instance = finderRefs.records.find((r) => r.seq === backingIndex);

      if (backingIndex === finder.cursor.backing) {
        const left = getScrollLeft(ref, finder.cursor.sounds);
        ref.scrollTo({ left });
      }
      if (instance == undefined) {
        instance = { seq: backingIndex, ref };
        finderRefs.records.push(instance);
      } else instance.ref = ref;
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
