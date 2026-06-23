<script lang="ts">
    export let isPresetExist!: boolean;
</script>

{#if isPresetExist}
    <div class="mark">
        <div class="inner"></div>
    </div>
{/if}

<style>
    .mark {
        display: inline-block;
        position: absolute;
        right: 5px;
        top: 5px;
        width: 22px;
        height: 22px;
        /* background-color: rgba(247, 255, 247, 0.425); */
        border: 3px solid rgb(255, 255, 255);
        box-sizing: border-box;
        border-radius: 22px;
        z-index: 1;
        opacity: 0.6;

        /* font-size: 28px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.596);
        line-height: 26px; */
    }
    .inner {
        display: inline-block;
        position: absolute;
        left: 2px;
        top: 2px;
        width: 12px;
        height: 12px;
        /* background-color: rgba(255, 255, 255, 0.622); */
        border: 3px solid rgb(255, 255, 255);
        box-sizing: border-box;
        border-radius: 12px;
    }
</style>
