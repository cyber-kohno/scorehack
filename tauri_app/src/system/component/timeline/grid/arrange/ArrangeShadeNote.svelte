<script lang="ts">
  import Layout from "../../../../layout/layout-constant";
  import MelodyState from "../../../../store/state/data/melody-state";
  import type RefState from "../../../../store/state/ref-state";
  import { controlStore, settingsStore } from "../../../../store/global-store";
  import type ArrangeTimelineNoteResolver from "../../../../service/arrange/arrange-timeline-note-resolver";

  export let item: ArrangeTimelineNoteResolver.TimelineNote;
  export let scrollLimitProps: RefState.ScrollLimitProps;

  const COLOR_ARR = [
    "#ff2f91",
    "#ff4fb3",
    "#d936ff",
    "#ff6c9f",
    "#e91e83",
    "#ff3fcf",
  ];

  $: noteColor = COLOR_ARR[item.trackIndex % COLOR_ARR.length];
  $: note = item.note;
  $: [isDisp, left, width, attackWidth, sustainWidth] = (() => {
    const beatSide = MelodyState.calcBeatSide(note);
    const [left, width] = [beatSide.pos, beatSide.len].map(
      (v) => v * $settingsStore.view.timeline.beatWidth,
    );
    const attackWidth = Math.min(width, $settingsStore.view.timeline.beatWidth / 4);
    const sustainWidth = Math.max(0, width - attackWidth);
    const isDisp =
      Math.abs(scrollLimitProps.scrollMiddleX - (left + width / 2)) <=
      scrollLimitProps.rectWidth;
    return [isDisp, left, width, attackWidth, sustainWidth];
  })();

  const HEIGHT = 10;
</script>

{#if isDisp}
  <div
    class="itemwrap"
    style:left="{left}px"
    style:width="{width}px"
    data-muted={item.isMute}
  >
    {#if sustainWidth > 0}
      <div
        class="note sustain"
        style:top="{Layout.getPitchTop(note.pitch) +
          (Layout.pitch.ITEM_HEIGHT - HEIGHT) / 2}px"
        style:left="{attackWidth}px"
        style:width="{sustainWidth}px"
        style:height="{HEIGHT}px"
        style:--note-color={noteColor}
        data-method={item.method}
        data-active={$controlStore.mode === "harmonize"}
      ></div>
    {/if}
    <div
      class="note attack"
      style:top="{Layout.getPitchTop(note.pitch) +
        (Layout.pitch.ITEM_HEIGHT - HEIGHT) / 2}px"
      style:width="{attackWidth}px"
      style:height="{HEIGHT}px"
      style:--note-color={noteColor}
      data-method={item.method}
      data-active={$controlStore.mode === "harmonize"}
    ></div>
  </div>
{/if}

<style>
  .itemwrap {
    display: inline-block;
    position: absolute;
    top: var(--pitch-top-margin);
    height: var(--pitch-frame-height);
    z-index: 2;
    box-sizing: border-box;
    pointer-events: none;
  }

  .itemwrap[data-muted="true"] {
    opacity: 0.22;
  }

  .note {
    display: inline-block;
    position: absolute;
    left: 0;
    min-width: 3px;
    z-index: 2;
    border-radius: 2px;
    background-color: color-mix(in srgb, var(--note-color) 22%, transparent);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
  }

  .note[data-active="true"] {
    background-color: color-mix(in srgb, var(--note-color) 62%, transparent);
  }

  .note.sustain {
    min-width: 0;
    opacity: 0.3;
  }

  .note.attack {
    opacity: 1;
  }

  .note[data-method="guitar"] {
    border-radius: 5px;
  }
</style>
