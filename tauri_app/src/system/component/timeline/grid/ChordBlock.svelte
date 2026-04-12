<script lang="ts">
    import type StoreCache from "../../../store/props/storeCache";
    import ArrangeTracksManage from "./arrange/ArrangeTracksManage.svelte";

    export let chordCache: StoreCache.ChordCache;
    export let index: number;
</script>

<div
    class="wrap"
    style:left="{chordCache.viewPosLeft}px"
    style:width="{chordCache.viewPosWidth}px"
>
    <ArrangeTracksManage />
</div>

<style>
    .wrap {
        display: inline-block;
        position: absolute;
        z-index: 1;

        /*background-color: #d70f0fa2;*/
        top: var(--pitch-top-margin);
        /* height: calc(100% - var(--pitch-top-margin)); */
        height: var(--pitch-frame-height);
    }
</style>
