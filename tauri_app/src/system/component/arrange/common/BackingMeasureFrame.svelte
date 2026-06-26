<script lang="ts" context="module">
  export type ColumnRange = {
    index: number;
    x: number;
    width: number;
    startBeat: number;
    endBeat: number;
  };
</script>

<script lang="ts">
  import RhythmTheory from "../../../domain/theory/rhythm-theory";
  import Layout from "../../../layout/layout-constant";
  import type DerivedState from "../../../store/state/derived-state";

  type MeasureLine = {
    x: number;
    height: number;
    width: number;
    level: "beat" | "eighth" | "sixteenth";
  };

  export let ts: RhythmTheory.TimeSignature;
  export let beat: DerivedState.BeatCache;
  export let colRanges: ColumnRange[] = [];
  export let frameWidth = 0;
  export let bindFrame: (element: HTMLDivElement) => void = () => {};

  let frame: HTMLDivElement;

  $: if (frame != undefined) bindFrame(frame);

  $: beatDiv16Count = RhythmTheory.getBeatDiv16Count(ts);
  $: beatRate = beatDiv16Count / 4;
  $: sixteenthBeat = beatRate / beatDiv16Count;
  $: startOffsetBeatNote = (beat.eatHead / beatDiv16Count) * beatRate;
  $: beatWidth = Layout.arrange.piano.DIV1_WIDTH / beatRate;
  $: requiredBeatNote =
    (beat.num + (-beat.eatHead + beat.eatTail) / beatDiv16Count) * beatRate;
  $: totalBeatNote = colRanges[colRanges.length - 1]?.endBeat ?? 0;
  $: displayBeatNote = Math.max(totalBeatNote, requiredBeatNote);
  $: totalWidth = Math.max(frameWidth, displayBeatNote * beatWidth + 2);
  $: overLengthLeft = getDisplayXFromBeat(requiredBeatNote);
  $: overLengthWidth =
    overLengthLeft == undefined ? 0 : Math.max(0, totalWidth - overLengthLeft);

  const getXFromBeat = (beatNote: number) => {
    const range = colRanges.find(
      (range) =>
        range.startBeat <= beatNote + 1e-9 && beatNote <= range.endBeat + 1e-9,
    );

    if (range == undefined) return undefined;
    if (Math.abs(range.endBeat - range.startBeat) <= 1e-9) return range.x;

    const rate =
      (beatNote - range.startBeat) / (range.endBeat - range.startBeat);
    return range.x + range.width * rate;
  };

  const getDisplayXFromBeat = (beatNote: number) => {
    const x = getXFromBeat(beatNote);
    if (x != undefined) return x;

    const last = colRanges[colRanges.length - 1];
    if (last == undefined) return 1 + beatNote * beatWidth;

    return last.x + last.width + (beatNote - last.endBeat) * beatWidth;
  };

  $: measureLines = (() => {
    const lines: MeasureLine[] = [];
    if (displayBeatNote <= 0) return lines;

    const minUnitIndex = Math.floor(startOffsetBeatNote / sixteenthBeat - 1e-9);
    const maxUnitIndex = Math.ceil(
      (startOffsetBeatNote + displayBeatNote) / sixteenthBeat - 1e-9,
    );
    for (let unitIndex = minUnitIndex; unitIndex <= maxUnitIndex; unitIndex++) {
      const beatNote = unitIndex * sixteenthBeat - startOffsetBeatNote;
      if (beatNote < -1e-9) continue;
      if (beatNote > displayBeatNote + 1e-9) break;

      const x = getDisplayXFromBeat(beatNote);
      if (x == undefined) continue;

      const level =
        unitIndex % beatDiv16Count === 0
          ? "beat"
          : unitIndex % 2 === 0
            ? "eighth"
            : "sixteenth";
      lines.push({
        x,
        width: level === "beat" ? 3 : level === "eighth" ? 2 : 1,
        height: level === "beat" ? 22 : level === "eighth" ? 16 : 10,
        level,
      });
    }

    return lines;
  })();
</script>

<div class="measure-wrap" bind:this={frame}>
  <div class="content" style:width={`${totalWidth}px`}>
    {#if displayBeatNote > requiredBeatNote + 1e-9 && overLengthWidth > 0}
      <div
        class="over-length"
        style:left={`${overLengthLeft}px`}
        style:width={`${overLengthWidth}px`}
      ></div>
    {/if}
    {#each measureLines as line}
      <div
        class="line"
        data-level={line.level}
        style:left={`${line.x}px`}
        style:width={`${line.width}px`}
        style:height={`${line.height}px`}
      ></div>
    {/each}
  </div>
</div>

<style>
  .measure-wrap {
    display: inline-block;
    position: relative;
    width: calc(100% - 8px);
    height: var(--ap-backing-measure-height);
    background-color: #b0d7de;
    margin: 0 4px;
    overflow: hidden;
    white-space: nowrap;
    * {
      vertical-align: top;
    }
  }

  .content {
    display: inline-block;
    position: relative;
    height: 100%;
  }

  .line {
    display: inline-block;
    position: absolute;
    z-index: 1;
    top: 0;
    background-color: rgb(69, 118, 173);
  }

  .over-length {
    display: inline-block;
    position: absolute;
    z-index: 0;
    top: 0;
    height: 100%;
    background-color: rgba(255, 99, 99, 0.4);
  }

  .line[data-level="eighth"] {
    opacity: 0.78;
  }

  .line[data-level="sixteenth"] {
    opacity: 0.48;
  }
</style>
