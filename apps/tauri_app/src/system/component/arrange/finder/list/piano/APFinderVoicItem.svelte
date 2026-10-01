<script lang="ts">
  import type FinderState from "../../../../../store/state/data/arrange/finder-state";
  import type PianoEditorState from "../../../../../store/state/data/arrange/piano/piano-editor-state";
  import createArrangeSelector from "../../../../../service/arrange/arrange-selector";


    import PbPresetExistMark from "./APFinderExistMark.svelte";
  import { controlStore, dataStore } from "../../../../../store/global-store";

    export let finder: FinderState.PianoArrangeFinder;
    export let backingIndex: number;
    export let soundsIndex: number;
    export let structCnt: number;
    export let voicingSounds: string[];
    export let isRecordFocus: boolean;
    export let usageBkg: PianoEditorState.Regular;

    $: isPresetExist = (() => {
        const {getCurTrack} = createArrangeSelector({ control: $controlStore, data: $dataStore });
        const track = getCurTrack();
        if (track.method !== "piano") throw new Error();
        const lib = track.bank;
        const regular = lib.regulars.find((p) => p.backingNo === usageBkg.backingNo);
        if (regular == undefined) return false;
        const sndsNo = usageBkg.soundsNos[soundsIndex];
        const regularSndsNo = regular.soundsNos.find((v) => v === sndsNo);
        return regularSndsNo != undefined;
    })();

    $: isVoicApply = (()=>{
        if(backingIndex !== finder.apply.backing) return false;
        return soundsIndex === finder.apply.sounds;
    })();
</script>

<div class="wrap" data-apply={isVoicApply} data-finder-sounds-index={soundsIndex}>
    {#if isRecordFocus && soundsIndex === finder.cursor.sounds}
        <div class="focus"></div>
    {/if}
    <PbPresetExistMark {isPresetExist} />
    <div class="inner">
        {#each new Array(structCnt) as _, y}
            <div class="record">
                {#each new Array(8) as _, x}
                    <div
                        class="cell"
                        data-on={voicingSounds.includes(`${x}.${y}`)}
                    ></div>
                {/each}
            </div>
        {/each}
    </div>
</div>

<style>
    .wrap {
        display: inline-block;
        position: relative;
        margin: 0 1px 0 0;
        width: 98px;
        height: 100%;
        background-color: rgba(0, 26, 48, 0.479);
        box-sizing: border-box;
        white-space: initial;
    }
    .wrap[data-apply=true] {
        background-color: rgba(232, 161, 74, 0.623);
    }
    .focus {
        display: inline-block;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 240, 208, 0.137);
        z-index: 1;
        border: 1px solid rgb(0, 241, 229);
        box-sizing: border-box;
    }
    .inner {
        display: inline-block;
        position: relative;
        margin: 9px 0 0 4px;
        width: calc(100% - 8px);
        height: calc(100% - 18px);
        /* background-color: rgba(193, 210, 224, 0.479); */
    }
    .record {
        display: inline-block;
        position: relative;
        width: 100%;
        height: 6px;
        margin: 1px 0 0 0;
        /* background-color: rgba(240, 248, 255, 0.438); */
    }
    .cell {
        display: inline-block;
        position: relative;
        width: 10px;
        height: 100%;
        margin: 0 0 0 1px;
        background-color: rgba(240, 248, 255, 0.188);
    }
    .cell[data-on="true"] {
        background-color: rgb(34, 191, 226);
    }
</style>
