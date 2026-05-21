<script lang="ts">
  import { dataStore, derivedStore, refStore } from "../../../../store/global-store";
  import RefState from "../../../../store/state/ref-state";
  import ArrangeTimelineNoteResolver from "../../../../service/arrange/arrange-timeline-note-resolver";
  import ArrangeShadeNote from "./ArrangeShadeNote.svelte";

  $: scrollLimitProps = RefState.getScrollLimitProps($refStore.grid);
  $: notes = ArrangeTimelineNoteResolver.resolve(
    $dataStore.arrange.tracks,
    $derivedStore,
  );
</script>

{#if scrollLimitProps != null}
  {#each notes as item (`${item.trackIndex}.${item.noteIndex}`)}
    <ArrangeShadeNote {item} {scrollLimitProps} />
  {/each}
{/if}
