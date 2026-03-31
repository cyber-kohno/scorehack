<script lang="ts">
    import ContextUtil from "../../../../store/contextUtil";
    import store from "../../../../store/store";
    import MusicTheory from "../../../../util/musicTheory";

    $: arrange = ContextUtil.get("arrange");
    $: editor = ContextUtil.get("pianoEditor");
    $: bp = ContextUtil.get("backingProps");
    $: backing = $bp.backing;

    $: structs = (() => {
        const chord = $arrange.target.compiledChord;
        return chord.structs;
    })();

    $: getSoundName = (index: number) => {
        if ($editor.voicing.items.length - 1 < index) return "";
        const item = $editor.voicing.items[index];
        const items = item.split(".");
        const struct = structs[Number(items[1])];
        const octaveIndex = Number(items[0]);
        return MusicTheory.getKey12FullName(struct.key12 + octaveIndex * 12);
    };

    $: isFocus = (index: number) => {
        return (
            index === backing.cursorY &&
            $editor.control === "record" &&
            $editor.phase === "edit"
        );
    };
</script>

<div class="wrap">
    {#each Array.from({ length: backing.recordNum }, (_, i) => backing.recordNum - 1 - i) as index}
        <div class="record">
            <div class="struct">
                {getSoundName(index)}
            </div>
            {#if isFocus(index)}
                <div class="focus"></div>
            {/if}
        </div>
    {/each}
</div>

<style>
    .wrap {
        display: inline-block;
        position: relative;
        width: 100%;
        height: var(--ap-backing-table-height);
        /* background-color: #bbcdd2; */
    }

    .record {
        display: inline-block;
        position: relative;
        margin: 1px 0 0 0;
        width: 100%;
        height: var(--ap-backing-record-height);
        padding: 0;
        background-color: rgb(204, 228, 228);
    }
    .struct {
        display: inline-block;
        position: relative;
        margin: 1px;
        background-color: rgba(209, 209, 209, 0.411);
        border-radius: 2px;
        border: 1px solid rgb(48, 48, 48);
        box-sizing: border-box;
        width: calc(100% - 2px);
        height: calc(100% - 2px);
        color: rgb(255, 21, 21);
        font-weight: 600;
        font-size: 14px;
        line-height: 24px;
        padding: 0 0 0 4px;
    }
    .focus {
        display: inline-block;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 237, 134, 0.473);
    }
</style>
