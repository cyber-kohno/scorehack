<script lang="ts">
  import store from "../../../system/store/store";
  import ShadeNote from "../../../system/component/melody/score/ShadeNote.svelte";
  import {
    getMelodyScrollLimitProps,
    getShadeMelodyTracks,
  } from "../../../state/ui-state/melody-ui-store";
  import { timelineViewportStore } from "../../../state/session-state/timeline-viewport-store";

  $: shadeTracks = getShadeMelodyTracks($store);
  $: scrollLimitProps = (() => {
    $timelineViewportStore;
    return getMelodyScrollLimitProps($store);
  })();
</script>

{#if scrollLimitProps != null}
  {#each shadeTracks as { track, trackIndex }}
    {#each track.notes as _, noteIndex}
      <ShadeNote {trackIndex} {noteIndex} {scrollLimitProps} />
    {/each}
  {/each}
{/if}
