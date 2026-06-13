<script lang="ts">
  import RhythmTheory from "../../../../../domain/theory/rhythm-theory";
  import PianoBackingState from "../../../../../store/state/data/arrange/piano/piano-backing-state";
  import type PianoEditorState from "../../../../../store/state/data/arrange/piano/piano-editor-state";
  import createArrangeSelector from "../../../../../service/arrange/arrange-selector";
  import APFinderExistMark from "./APFinderExistMark.svelte";
  import { controlStore, dataStore } from "../../../../../store/global-store";


    export let voicingCnt: number;
    export let layers: PianoBackingState.Layer[];
    export let isRecordFocus: boolean;
    export let isRecordApply: boolean;
    export let usageBkg: PianoEditorState.Regular;
    export let ts: RhythmTheory.TimeSignature;

    const BASE_THUMBNAIL_BEAT_WIDTH = 36;

    const getColWidth = (col: PianoBackingState.Col) => {
        const beatWidth = BASE_THUMBNAIL_BEAT_WIDTH / (RhythmTheory.getBeatDiv16Count(ts) / 4);
        return PianoBackingState.getColWidthCriteriaBeatWidth(col, beatWidth);
    };

    $: isPresetExist = (() => {
        const {getCurTrack} = createArrangeSelector({ control: $controlStore, data: $dataStore });
        const track = getCurTrack();
        if (track.method !== "piano") throw new Error();
        const lib = track.bank;
        const regular = lib.regulars.find(p => p.backingNo === usageBkg.backingNo);
        return regular != undefined;
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
