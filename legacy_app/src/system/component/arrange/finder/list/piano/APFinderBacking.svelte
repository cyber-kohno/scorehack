<script lang="ts">
  import StorePianoBacking from "../../../../../store/props/arrange/piano/storePianoBacking";
  import type StorePianoEditor from "../../../../../store/props/arrange/piano/storePianoEditor";
  import ArrangeUtil from "../../../../../store/reducer/arrangeUtil";
  import store from "../../../../../store/store";
  import APFinderExistMark from "./APFinderExistMark.svelte";


    export let voicingCnt: number;
    export let layers: StorePianoBacking.Layer[];
    export let isRecordFocus: boolean;
    export let isRecordApply: boolean;
    export let usageBkg: StorePianoEditor.Preset;

    const getColWidth = (col: StorePianoBacking.Col) => {
        return StorePianoBacking.getColWidthCriteriaBeatWidth(col, 128);
    };

    $: isPresetExist = (() => {
        const {getCurTrack} = ArrangeUtil.useReducer($store);
        const lib = getCurTrack().pianoLib;
        if(lib == undefined) throw new Error();
        const preset = lib.presets.find(p => p.bkgPatt === usageBkg.bkgPatt);
        return preset != undefined;
    })();
</script>

<div class="wrap" data-apply={isRecordApply}>
    {#if isRecordFocus}
        <div class="focus"></div>
    {/if}
    <APFinderExistMark {isPresetExist} />
    <!-- 両面のレイヤーを描画 -->
    {#each layers as layer, i}
        <div class="layer">
            {#each new Array(voicingCnt) as _, y}
                <div class="record">
                    {#each layer.cols as col, x}
                        <div
                            class="cell-frame"
                            style:width="{getColWidth(col)}px"
                        >
                            <div
                                class="cell"
                                data-layerIndex={i}
                                data-on={layer.items
                                    .map((i) => {
                                        const [x, y] = i.split(".");
                                        return `${x}.${y}`;
                                    })
                                    .includes(`${x}.${voicingCnt - 1 - y}`)}
                            ></div>
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    {/each}
</div>

<style>
    .wrap {
        display: inline-block;
        position: relative;
        margin: 2px 0 0 2px;
        width: calc(100% - 4px);
        height: calc(100% - 2px);
        /* background-color: rgba(255, 255, 255, 0.128); */
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
        background-color: rgba(240, 236, 0, 0.137);
        z-index: 2;
        border: 1px solid rgb(241, 229, 0);
        box-sizing: border-box;
    }
    .layer {
        display: inline-block;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }
    .record {
        display: inline-block;
        position: relative;
        width: 100%;
        height: 4px;
        margin: 1px 0 0 0;
        /* background-color: rgba(255, 255, 255, 0.128); */
    }
    .cell-frame {
        display: inline-block;
        position: relative;
        height: 100%;
        /* background-color: rgb(0, 0, 0); */
        padding: 0 0 0 1px;
        box-sizing: border-box;
        vertical-align: top;
    }
    .cell {
        display: inline-block;
        position: relative;
        width: 100%;
        height: 100%;
    }
    .cell[data-layerIndex="0"] {
        background-color: rgb(98, 226, 34);
    }
    .cell[data-layerIndex="1"] {
        background-color: rgb(218, 185, 0);
    }
    .cell[data-on="false"] {
        background-color: rgba(240, 248, 255, 0.188);
    }
</style>
