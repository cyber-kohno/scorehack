<script lang="ts">
import StorePianoBacking from "../../../../domain/arrange/piano-backing-store";
    import {
        getArrangeEditorBackingContext,
        getArrangeEditorPianoEditorContext,
    } from "../../piano-editor-context";
    import { setArrangePianoColRef } from "../../../../state/session-state/arrange-ref-store";

    let colRef: HTMLElement | undefined = undefined;
    const editor = getArrangeEditorPianoEditorContext();
    const bp = getArrangeEditorBackingContext();
    $: backing = $bp.backing;
    $: setArrangePianoColRef(colRef);

    $: isFocus = (index: number) => {
        return (
            index === backing.cursorX &&
            $editor.control === "col" &&
            $editor.phase === "edit"
        );
    };
    $: getDispName = (col: StorePianoBacking.Col) => {
        const dot = col.dot ?? 0;
        return `${col.div}${".".repeat(dot)}`;
    };
</script>

<div class="wrap" bind:this={colRef}>
    {#each $bp.getCurLayer().cols as col, index}
        <div class="col" style:width={`${$bp.getColWidth(col)}px`}>
            <div class="inner">{getDispName(col)}</div>
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
        height: var(--ap-backing-len-height);
        * {
            vertical-align: top;
        }
        overflow-x: hidden;
        white-space: nowrap;
    }
    .col {
        display: inline-block;
        position: relative;
        margin: 0 0 0 1px;
        height: 100%;
        padding: 0;
        background-color: rgb(204, 228, 228);
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
    .inner {
        display: inline-block;
        position: relative;
        margin: 1px 0 0 1px;
        border-radius: 2px;
        border: 1px solid rgb(48, 48, 48);
        box-sizing: border-box;
        width: calc(100% - 2px);
        height: calc(100% - 2px);

        font-size: 14px;
        font-weight: 600;
        color: rgb(51, 67, 136);
        line-height: 28px;
        text-align: center;
    }
</style>
