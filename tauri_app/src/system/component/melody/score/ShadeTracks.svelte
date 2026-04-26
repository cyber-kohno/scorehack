<script lang="ts">
    import RefState from "../../../store/state/ref-state";
    import { controlStore } from "../../../store/global-store";
    import store from "../../../store/store";
    import ShadeNote from "./ShadeNote.svelte";

    /** 選択中のトラック */
    $: currentTrackIndex = $controlStore.melody.trackIndex;

    /** 表示するか否かを判定する */
    $: isDisp = (i: number) =>
        // メロディモード時は、カレントトラックはアクティブ表示するので除外する
        i !== currentTrackIndex ||
        // ハーモニーモード時は全てがシェイドトラックになるため無条件で表示する
        $controlStore.mode === "harmonize";

    $: scoreTracks = $store.data.scoreTracks;

    $: scrollLimitProps = RefState.getScrollLimitProps($store.ref.grid);
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
