<script lang="ts">
    import RefState from "../../../store/state/ref-state";
    import { controlStore, dataStore, refStore } from "../../../store/global-store";
    import ShadeNote from "./ShadeNote.svelte";

    $: currentTrackIndex = $controlStore.melody.trackIndex;
    $: isDisp = (i: number) =>
        $controlStore.mode === "melody" &&
        i !== currentTrackIndex;

    $: scoreTracks = $dataStore.scoreTracks;

    $: scrollLimitProps = RefState.getScrollLimitProps($refStore.grid);
</script>

{#if scrollLimitProps != null}
    {#each scoreTracks as track, trackIndex}
        {#if isDisp(trackIndex)}
            {#each track.notes as _, noteIndex}
                <ShadeNote {trackIndex} {noteIndex} {scrollLimitProps} />
            {/each}
        {/if}
    {/each}
{/if}
