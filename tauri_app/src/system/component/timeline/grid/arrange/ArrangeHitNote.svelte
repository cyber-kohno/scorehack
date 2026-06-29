<script lang="ts">
  import Layout from "../../../../layout/layout-constant";
  import MelodyState from "../../../../store/state/data/melody-state";
  import type RefState from "../../../../store/state/ref-state";
  import { controlStore, settingsStore } from "../../../../store/global-store";
  import type ArrangeTimelineNoteResolver from "../../../../service/arrange/arrange-timeline-note-resolver";

  export let item: ArrangeTimelineNoteResolver.HitNote;
  export let scrollLimitProps: RefState.ScrollLimitProps;

  const COLOR_ARR = [
    "#ff2f91",
    "#ff4fb3",
    "#d936ff",
    "#ff6c9f",
    "#e91e83",
    "#ff3fcf",
  ];
  const SIZE = 10;

  $: noteColor = COLOR_ARR[item.trackIndex % COLOR_ARR.length];
  $: note = item.note;
  $: [isDisp, left] = (() => {
    const beatSide = MelodyState.calcBeatSide(note);
    const left = beatSide.pos * $settingsStore.view.timeline.beatWidth;
    const isDisp =
      Math.abs(scrollLimitProps.scrollMiddleX - left) <=
      scrollLimitProps.rectWidth;
    return [isDisp, left];
  })();
</script>

{#if isDisp}
  <div
    class="itemwrap"
    style:left="{left - SIZE / 2}px"
    data-muted={item.isMute}
    data-active={$controlStore.mode === "harmonize"}
  >
    <div
      class="hit"
      style:top="{Layout.getPitchTop(note.pitch) +
        (Layout.pitch.ITEM_HEIGHT - SIZE) / 2}px"
      style:--note-color={noteColor}
    ></div>
  </div>
{/if}

<style>
  .itemwrap {
    display: inline-block;
    position: absolute;
    top: var(--pitch-top-margin);
    width: 10px;
    height: var(--pitch-frame-height);
    z-index: 3;
    box-sizing: border-box;
    pointer-events: none;
    opacity: 0.45;
  }

  .itemwrap[data-active="true"] {
    opacity: 1;
  }

  .itemwrap[data-muted="true"] {
    opacity: 0.22;
  }

  .itemwrap[data-muted="true"][data-active="false"] {
    display: none;
  }

  .hit {
    display: inline-block;
    position: absolute;
    left: 0;
    width: 10px;
    height: 10px;
    z-index: 3;
    box-sizing: border-box;
    border-radius: 50%;
    background-color: color-mix(in srgb, var(--note-color) 86%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--note-color) 48%, black);
  }
</style>
