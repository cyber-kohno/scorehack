<script lang="ts">
  import Layout from "../../../layout/layout-constant";
  import MelodyState from "../../../store/state/data/melody-state";
  import RefState from "../../../store/state/ref-state";
  import { controlStore, dataStore, refStore, settingsStore } from "../../../store/global-store";

  $: trackIndex = $controlStore.melody.trackIndex;
  $: notes = $dataStore.scoreTracks[trackIndex]?.notes ?? [];
  $: scrollLimitProps = RefState.getScrollLimitProps($refStore.grid);
  $: beatWidth = $settingsStore.view.timeline.beatWidth;

  $: visibleNotes = (() => {
    if (scrollLimitProps == null) return [];

    return notes.flatMap((note, index) => {
      const beatSide = MelodyState.calcBeatSide(note);
      const [left, width] = [beatSide.pos, beatSide.len].map((v) => v * beatWidth);
      const middle = left + width / 2;
      const isDisp = Math.abs(scrollLimitProps.scrollMiddleX - middle) <= scrollLimitProps.rectWidth;
      if (!isDisp) return [];

      return [{ index, note, left, width }];
    });
  })();
</script>

{#each visibleNotes as item (item.index)}
  <div class="column" style:left="{item.left}px" style:width="{item.width}px">
    <div
      class="frame"
      style:top="{Layout.getPitchTop(item.note.pitch) - 2}px"
    ></div>
  </div>
{/each}

<style>
  .column {
    display: inline-block;
    position: absolute;
    top: var(--pitch-top-margin);
    height: var(--pitch-frame-height);
    z-index: 2;
    box-sizing: border-box;
  }

  .frame {
    display: inline-block;
    position: absolute;
    left: 0;
    width: 100%;
    height: calc(var(--pitch-item-height) + 4px);
    border-radius: 0 12px 12px 0;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.28);
  }
</style>
