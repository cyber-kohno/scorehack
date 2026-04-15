<script lang="ts">
  import store from "../../../system/store/store";
  import Note from "./Note.svelte";
  import {
    getCurrentMelodyNotes,
    getMelodyCursorMiddle,
    getMelodyScrollLimitProps,
  } from "../../../state/ui-state/melody-ui-store";

  $: notes = getCurrentMelodyNotes($store);
  $: scrollLimitProps = getMelodyScrollLimitProps($store);
  $: cursorMiddle = getMelodyCursorMiddle($store);
</script>

{#if scrollLimitProps != null}
  {#each notes as note, index}
    <Note {note} {index} {scrollLimitProps} {cursorMiddle} />
  {/each}
{/if}
