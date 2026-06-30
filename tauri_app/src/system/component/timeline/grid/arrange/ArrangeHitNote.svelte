<script lang="ts">
  import Layout from "../../../../layout/layout-constant";
  import MelodyState from "../../../../store/state/data/melody-state";
  import type RefState from "../../../../store/state/ref-state";
  import { controlStore, settingsStore } from "../../../../store/global-store";
  import type ArrangeTimelineNoteResolver from "../../../../service/arrange/arrange-timeline-note-resolver";
  import DrumHitIcon from "../../../common/DrumHitIcon.svelte";

  export let item: ArrangeTimelineNoteResolver.HitNote;
  export let scrollLimitProps: RefState.ScrollLimitProps;

  const SIZE = 18;

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
    style:left="{left - 1}px"
    data-muted={item.isMute}
    data-active={$controlStore.mode === "harmonize"}
  >
    <div
      class="hit"
      style:top="{Layout.getPitchTop(note.pitch) +
        (Layout.pitch.ITEM_HEIGHT - SIZE) / 2}px"
    >
      <DrumHitIcon kind={item.markKind} size={SIZE} />
    </div>
  </div>
{/if}

<style>
  .itemwrap {
    display: inline-block;
    position: absolute;
    top: var(--pitch-top-margin);
    width: 18px;
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
    width: 18px;
    height: 18px;
    z-index: 3;
    box-sizing: border-box;
  }
</style>
