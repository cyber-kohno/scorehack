<script lang="ts">
  import StoreMelody from "../../../../domain/melody/melody-store";
  import { getMelodyCursorState } from "../../../../app/melody/melody-cursor-state";
  import { envStore } from "../../../../state/session-state/env-store";
  import useReducerMelody from "../../../store/reducer/reducerMelody";
  import store from "../../../store/store";
  import Note from "./Note.svelte";
  import { getMelodyScrollLimitProps } from "../../../../state/ui-state/melody-ui-store";
  import { timelineViewportStore } from "../../../../state/session-state/timeline-viewport-store";
  import { melodyFocusStore } from "../../../../state/session-state/melody-focus-store";

  $: reducer = useReducerMelody($store);

  $: notes = reducer.getCurrScoreTrack().notes;

  $: scrollLimitProps = (() => {
    $timelineViewportStore;
    return getMelodyScrollLimitProps($store);
  })();

  $: cursorMiddle = (() => {
    const note =
      $melodyFocusStore.focus === -1
        ? getMelodyCursorState($store)
        : notes[$melodyFocusStore.focus];
    const beatSide = StoreMelody.calcBeatSide(note);
    const [left, width] = [beatSide.pos, beatSide.len].map((v) => v * $envStore.beatWidth);
    return left + width / 2;
  })();
</script>

{#if scrollLimitProps != null}
  {#each notes as note, index}
    <Note {note} {index} {scrollLimitProps} {cursorMiddle} />
  {/each}
{/if}
