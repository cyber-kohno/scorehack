<script lang="ts">
    import StoreRef from "../../../store/props/storeRef";
    import store from "../../../store/store";
    import { getShadeMelodyTracks } from "../../../../state/ui-state/melody-ui-store";
    import ShadeNote from "./ShadeNote.svelte";

    /** 選択中のトラック */
    $: currentTrackIndex = $store.control.melody.trackIndex;

    /** 表示するか否かを判定する */
    $: isDisp = (i: number) =>
        // メロディモード時は、カレントトラックはアクティブ表示するので除外する
        i !== currentTrackIndex ||
        // ハーモニーモード時は全てがシェイドトラックになるため無条件で表示する
        $store.control.mode === "harmonize";

    $: scoreTracks = getShadeMelodyTracks($store);

    $: scrollLimitProps = StoreRef.getScrollLimitProps($store.ref.grid);
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
