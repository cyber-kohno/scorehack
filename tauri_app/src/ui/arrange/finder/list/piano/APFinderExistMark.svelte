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
        width: 26px;
        height: 26px;
        /* background-color: rgba(247, 255, 247, 0.425); */
        border: 3px solid rgba(255, 255, 255, 0.788);
        box-sizing: border-box;
        border-radius: 26px;
        z-index: 1;

        /* font-size: 28px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.596);
        line-height: 26px; */
    }
    .inner {
        display: inline-block;
        position: absolute;
        left: 3px;
        top: 3px;
        width: 14px;
        height: 14px;
        /* background-color: rgba(255, 255, 255, 0.622); */
        border: 3px solid rgba(255, 255, 255, 0.774);
        box-sizing: border-box;
        border-radius: 14px;
    }
</style>
