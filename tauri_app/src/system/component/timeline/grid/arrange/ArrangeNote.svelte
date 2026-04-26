<script lang="ts">
    export let note!: TimelineStore.Note;

    $: noteBean = (() => {
        const keyIndex = note.pitch;
        return {
            ...OutlineUtil.getNoteRect(note, $store.env),
            keyIndex,
        };
    })();
</script>

<div
    class="note"
    style="
            top: {noteBean.y}px;
            left: {noteBean.x}px;
            width: {noteBean.width}px;
            height: {noteBean.height}px;
        "
></div>

<style>
    .note {
        display: inline-block;
        position: absolute;
        z-index: 2;
        /* border: 1px solid #00233f9c; */
        /* border-radius: 8px; */
        box-sizing: border-box;
        /* font-size: 12px;
        color: rgba(0, 24, 133, 0.726);
        font-weight: 600;
        padding: 0 0 0 4px; */
        box-shadow: 10px 10px 15px -10px;
        background-color: rgba(255, 0, 85, 0.562);
    }
</style>
