<script lang="ts">
    import Layout from "../../../layout/layout-constant";
    import TonalityTheory from "../../../domain/theory/tonality-theory";
    import useMelodySelector from "../../../service/melody/melody-selector";
    import MelodyState from "../../../store/state/data/melody-state";
    import { controlStore, dataStore, derivedStore, playbackStore } from "../../../store/global-store";

    type PitchRecord = {
        top: number;
        isStruct: boolean;
        isRoot: boolean;
        isOn: boolean;
        isScale: boolean;
    };

    $: melodySelector = useMelodySelector({ control: $controlStore, data: $dataStore });

    $: activeNote = (() => {
        const melody = $controlStore.melody;
        if (melody.focus === -1) return melody.cursor;

        return melodySelector.getCurrScoreTrack().notes[melody.focus];
    })();

    $: activeBeat = activeNote == undefined
        ? undefined
        : MelodyState.calcBeat(activeNote.norm, activeNote.pos);

    $: chordCache = activeBeat == undefined
        ? undefined
        : $derivedStore.chordCaches.find((chord) =>
            chord.startBeatNote <= activeBeat && activeBeat < chord.startBeatNote + chord.lengthBeatNote
        );

    $: isOutlineChordFocused =
        $derivedStore.elementCaches[$controlStore.outline.focus]?.chordSeq !== -1;

    $: structPitchClasses = (() => {
        const compiledChord = chordCache?.compiledChord;
        if (compiledChord == undefined) return [];

        return compiledChord.structs.map((struct) => ((struct.key12 % 12) + 12) % 12);
    })();

    $: rootPitchClass = (() => {
        const key12 = chordCache?.compiledChord?.chord.key12;
        if (key12 == undefined) return undefined;

        return ((key12 % 12) + 12) % 12;
    })();

    $: onPitchClass = (() => {
        const key12 = chordCache?.compiledChord?.chord.on?.key12;
        if (key12 == undefined) return undefined;

        return ((key12 % 12) + 12) % 12;
    })();

    $: tonality = (() => {
        if (chordCache == undefined) return undefined;

        return $derivedStore.baseCaches[chordCache.baseSeq]?.scoreBase.tonality;
    })();

    $: pitchRecords = (() => {
        const records: PitchRecord[] = [];
        if (structPitchClasses.length === 0 || tonality == undefined) return records;

        for (let i = 0; i < Layout.pitch.NUM; i++) {
            const pitchIndex = Layout.pitch.NUM - 1 - i;
            const pitchClass = pitchIndex % 12;
            records.push({
                top: Layout.pitch.TOP_MARGIN + i * Layout.pitch.ITEM_HEIGHT,
                isStruct: structPitchClasses.includes(pitchClass),
                isRoot: onPitchClass == undefined && pitchClass === rootPitchClass,
                isOn: pitchClass === onPitchClass,
                isScale: TonalityTheory.isScaleStructPitch(pitchClass, tonality),
            });
        }

        return records;
    })();
</script>

{#if $controlStore.mode === "melody" && $playbackStore.timerKeys == null && isOutlineChordFocused && chordCache != undefined && pitchRecords.length > 0}
    <div
        class="wrap"
        style:left="{chordCache.viewPosLeft}px"
        style:width="{chordCache.viewPosWidth}px"
    >
        {#each pitchRecords as record}
            <div
                class="record"
                data-is-struct={record.isStruct}
                data-is-root={record.isRoot}
                data-is-on={record.isOn}
                data-is-borrowed-struct={record.isStruct && !record.isScale}
                style:top="{record.top + Layout.pitch.ITEM_HEIGHT - 10}px"
            ></div>
        {/each}
    </div>
{/if}

<style>
    .wrap {
        display: inline-block;
        position: absolute;
        z-index: 2;
        height: calc(var(--pitch-top-margin) + var(--pitch-frame-height) + var(--pitch-bottom-margin));
        pointer-events: none;
        background-color: rgba(116, 188, 188, 0.094);
    }

    .record {
        display: inline-block;
        position: absolute;
        left: 0;
        width: 100%;
        height: 10px;
        opacity: 0.6;
    }

    .record[data-is-struct="true"] {
        background-color: rgb(104, 255, 117);
    }

    .record[data-is-borrowed-struct="true"] {
        background-color: rgb(255, 205, 105);
    }

    .record[data-is-root="true"] {
        background-color: rgb(255, 84, 84);
    }

    .record[data-is-on="true"] {
        background-color: rgb(87, 104, 255);
    }
</style>
