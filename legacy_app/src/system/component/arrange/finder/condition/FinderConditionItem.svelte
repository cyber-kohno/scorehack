<script lang="ts">
    export let title!: string;
    export let value!: string;
    export let width!: number;
</script>

<div class="item" style:width="{width}px">
    <span>{`${title}: `}</span>
    <span class="value">{value}</span>
</div>

<style>
    .item {
        display: inline-block;
        position: relative;
        background-color: rgba(138, 255, 239, 0.459);
        width: 90px;
        height: calc(100% - 10px);
        margin: 5px 0 0 4px;
        padding: 0 8px;
        border: 1px solid rgb(17, 0, 255);
        border-radius: 4px;
        box-sizing: border-box;
        text-align: left;
    }
    .item > span {
        font-size: 16px;
        font-weight: 600;
        color: rgb(220, 255, 253);
        line-height: 24px;
    }
    .item > .value {
        color: rgb(56, 76, 255);
    }
</style>
