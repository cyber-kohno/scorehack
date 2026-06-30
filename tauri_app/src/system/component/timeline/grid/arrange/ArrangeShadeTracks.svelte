<script lang="ts">
  import { controlStore, dataStore, derivedStore, refStore } from "../../../../store/global-store";
  import RefState from "../../../../store/state/ref-state";
  import ArrangeTimelineNoteResolver from "../../../../service/arrange/arrange-timeline-note-resolver";
  import ArrangeHitNote from "./ArrangeHitNote.svelte";
  import ArrangeShadeNote from "./ArrangeShadeNote.svelte";

  $: scrollLimitProps = RefState.getScrollLimitProps($refStore.grid);
  $: notes = ArrangeTimelineNoteResolver.resolve(
    $dataStore.arrange.tracks,
    $derivedStore,
  );
  $: visibleNotes = notes.filter((item) => {
    if (item.method !== "drum") return true;
    return $controlStore.mode === "harmonize" &&
      item.trackIndex === $controlStore.outline.trackIndex;
  });
</script>

{#if scrollLimitProps != null}
  {#each visibleNotes as item (`${item.trackIndex}.${item.noteIndex}`)}
    {#if item.kind === "hit"}
      <ArrangeHitNote {item} {scrollLimitProps} />
    {:else}
      <ArrangeShadeNote {item} {scrollLimitProps} />
    {/if}
  {/each}
{/if}
