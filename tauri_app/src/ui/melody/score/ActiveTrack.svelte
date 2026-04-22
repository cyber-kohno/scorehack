<script lang="ts">
import store from "../../../state/root-store";
  import Note from "./Note.svelte";
  import {
    getCurrentMelodyNotes,
    getMelodyCursorMiddle,
    getMelodyScrollLimitProps,
  } from "../../../state/ui-state/melody-ui-store";
  import { timelineViewportStore } from "../../../state/session-state/timeline-viewport-store";

  $: notes = getCurrentMelodyNotes($store);
  $: scrollLimitProps = (() => {
    $timelineViewportStore;
    return getMelodyScrollLimitProps($store);
  })();
  $: cursorMiddle = getMelodyCursorMiddle($store);
</script>

{#if scrollLimitProps != null}
  {#each notes as note, index}
    <Note {note} {index} {scrollLimitProps} {cursorMiddle} />
  {/each}
{/if}
