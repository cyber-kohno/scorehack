<script lang="ts">
  import type ArrangeLibrary from "../../../../../store/props/arrange/arrangeLibrary";
  import type StorePianoEditor from "../../../../../store/props/arrange/piano/storePianoEditor";
  import ArrangeUtil from "../../../../../store/reducer/arrangeUtil";
  import store from "../../../../../store/store";
  import APFinderBacking from "./APFinderBacking.svelte";
  import APFinderVoicsFrame from "./APFinderVoicsFrame.svelte";

    export let finder: ArrangeLibrary.PianoArrangeFinder;
    export let usageBkg: StorePianoEditor.Preset;
    export let backingIndex: number;

    $: [backing, sndsPatts] = (() => {
        const {getCurTrack} = ArrangeUtil.useReducer($store);
        const lib = getCurTrack().pianoLib;
        if(lib == undefined) throw new Error();
        const bkgPatt = lib.backingPatterns.find(
            (bkgPatt) => bkgPatt.no === usageBkg.bkgPatt,
        );
        if (bkgPatt == undefined)
            throw new Error("bkgPattがundefinedであってはならない。");

        // const sndsPatts = lib.soundsPatterns.filter((sndsPatt) => {
        //     // return (
        //     //     sndsPatt.category.structCnt === finder.info.structCnt &&
        //     //     sndsPatt.sounds.length === bkgPatt.backing.recordNum
        //     // );
        //     return usageBkg.voics.includes(sndsPatt.no);
        // });
        const sndsPatts = usageBkg.voics.map(vNo => {
            const sounds = lib.soundsPatterns.find(s=> s.no === vNo);
            if(sounds == undefined) throw new Error('soundsがundefinedであってはならない。');
            return sounds;
        })
        return [bkgPatt.backing, sndsPatts];
    })();

    $: isRecordFocus = backingIndex === finder.cursor.backing;
    $: isRecordApply = backingIndex === finder.apply.backing;
</script>

<div class="wrap">
    {#if isRecordFocus}
        <div class="focus"></div>
    {/if}
    <div class="inner">
        <div class="backing">
            <APFinderBacking
                layers={backing.layers}
                voicingCnt={backing.recordNum}
                {isRecordFocus}
                {isRecordApply}
                usageBkg={usageBkg}
            />
        </div>
        <div class="voicing">
            <APFinderVoicsFrame {finder} {sndsPatts} {isRecordFocus} {backingIndex} {usageBkg}/>
        </div>
    </div>
</div>

<style>
    .wrap {
        display: inline-block;
        position: relative;
        width: calc(100% - 2px);
        height: 70px;
        margin: 1px 0 0 1px;
        background-color: rgb(0, 0, 0);
    }
    .focus {
        display: inline-block;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.206);
        z-index: 1;
    }
    .inner {
        display: inline-block;
        position: relative;
        margin: 2px 0 0 2px;
        width: calc(100% - 4px);
        height: calc(100% - 4px);
        /* box-sizing: border-box;
        border: 1px solid rgba(255, 255, 255, 0.181); */
        * {
            display: inline-block;
            position: relative;
            vertical-align: top;
            height: 100%;
        }
    }
    .voicing {
        width: calc(100% - 150px);
        background-color: rgb(0, 46, 109);
    }
    .backing {
        width: 150px;
        background-color: rgb(133, 4, 8);
    }
</style>
