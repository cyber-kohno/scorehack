<script lang="ts">
    import store from "../../../store/store";
    import {
        getMelodyScrollLimitProps,
        getShadeMelodyTracks,
    } from "../../../../state/ui-state/melody-ui-store";
    import { melodyTrackStore } from "../../../../state/session-state/melody-track-store";
    import { modeStore } from "../../../../state/session-state/mode-store";
    import { timelineViewportStore } from "../../../../state/session-state/timeline-viewport-store";
    import ShadeNote from "./ShadeNote.svelte";

    /** 選択中のトラック */
    $: currentTrackIndex = $melodyTrackStore;

    /** 表示するか否かを判定する */
    $: isDisp = (i: number) =>
        // メロディモード時は、カレントトラックはアクティブ表示するので除外する
        i !== currentTrackIndex ||
        // ハーモニーモード時は全てがシェイドトラックになるため無条件で表示する
        $modeStore === "harmonize";

    $: scoreTracks = getShadeMelodyTracks($store);

    $: scrollLimitProps = (() => {
        $timelineViewportStore;
        return getMelodyScrollLimitProps($store);
    })();
</script>

{#if scrollLimitProps != null}
    {#each scoreTracks as trackInfo}
        {#if isDisp(trackInfo.trackIndex)}
            {#each trackInfo.track.notes as _, noteIndex}
                <ShadeNote trackIndex={trackInfo.trackIndex} {noteIndex} {scrollLimitProps} />
            {/each}
        {/if}
    {/each}
{/if}
