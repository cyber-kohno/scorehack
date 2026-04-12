<script lang="ts">
    import StoreRef from "../../../store/props/storeRef";
    import store from "../../../store/store";
    import ShadeNote from "./ShadeNote.svelte";

    /** 選択中のトラック */
    $: currentTrackIndex = $store.control.melody.trackIndex;

    /** 表示するか否かを判定する */
    $: isDisp = (i: number) =>
        // メロディモード時は、カレントトラックはアクティブ表示するので除外する
        i !== currentTrackIndex ||
        // ハーモニーモード時は全てがシェイドトラックになるため無条件で表示する
        $store.control.mode === "harmonize";

    $: scoreTracks = $store.data.scoreTracks;

    $: scrollLimitProps = StoreRef.getScrollLimitProps($store.ref.grid);
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
