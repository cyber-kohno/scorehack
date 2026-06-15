<script lang="ts">
  import RhythmTheory from "../../../../domain/theory/rhythm-theory";
  import Layout from "../../../../layout/layout-constant";
  import { refStore } from "../../../../store/global-store";
  import PianoBackingState from "../../../../store/state/data/arrange/piano/piano-backing-state";
  import { getPianoArrange, getPianoBacking } from "../piano-editor-context";

  type MeasureLine = {
    x: number;
    height: number;
    width: number;
    level: "beat" | "eighth" | "sixteenth";
  };

  const arrange = getPianoArrange();
  const bp = getPianoBacking();

  $: pianoRef = $refStore.arrange.piano;

  $: ts = $arrange.target.scoreBase.rhythm.ts;
  $: beatDiv16Count = RhythmTheory.getBeatDiv16Count(ts);
  $: beatRate = beatDiv16Count / 4;
  $: sixteenthBeat = beatRate / beatDiv16Count;
  $: startOffsetBeatNote =
    ($arrange.target.beat.eatHead / beatDiv16Count) * beatRate;
  $: beatWidth = Layout.arrange.piano.DIV1_WIDTH / beatRate;
  $: requiredBeatNote =
    ($arrange.target.beat.num +
      (-$arrange.target.beat.eatHead + $arrange.target.beat.eatTail) /
        beatDiv16Count) *
    beatRate;
  $: cols = $bp.getCurLayer().cols;

  $: colRanges = (() => {
    let x = 1;
    let beat = 0;

    return cols.map((col, index) => {
      const width = $bp.getColWidth(col);
      const beatLen = (1 / col.div) * PianoBackingState.getDotRate(col.dot);
      const range = {
        index,
        x,
        width,
        startBeat: beat,
        endBeat: beat + beatLen,
      };

      x += width + 1;
      beat += beatLen;
      if (index === cols.length - 1) x += 1;
      return range;
    });
  })();

  $: totalBeatNote = colRanges[colRanges.length - 1]?.endBeat ?? 0;
  $: displayBeatNote = Math.max(totalBeatNote, requiredBeatNote);
  $: totalWidth = Math.max(
    $bp.getColFrameWidth(),
    displayBeatNote * beatWidth + 2,
  );
  $: overLengthLeft = getDisplayXFromBeat(requiredBeatNote);
  $: overLengthWidth =
    overLengthLeft == undefined ? 0 : Math.max(0, totalWidth - overLengthLeft);

  const getXFromBeat = (beat: number) => {
    const range = colRanges.find(
      (range) => range.startBeat <= beat + 1e-9 && beat <= range.endBeat + 1e-9,
    );

    if (range == undefined) return undefined;
    if (Math.abs(range.endBeat - range.startBeat) <= 1e-9) return range.x;

    const rate = (beat - range.startBeat) / (range.endBeat - range.startBeat);
    return range.x + range.width * rate;
  };

  const getDisplayXFromBeat = (beat: number) => {
    const x = getXFromBeat(beat);
    if (x != undefined) return x;

    const last = colRanges[colRanges.length - 1];
    if (last == undefined) return 1 + beat * beatWidth;

    return last.x + last.width + (beat - last.endBeat) * beatWidth;
  };

  $: measureLines = (() => {
    const lines: MeasureLine[] = [];
    if (displayBeatNote <= 0) return lines;

    const minUnitIndex = Math.floor(startOffsetBeatNote / sixteenthBeat - 1e-9);
    const maxUnitIndex = Math.ceil(
      (startOffsetBeatNote + displayBeatNote) / sixteenthBeat - 1e-9,
    );
    for (let unitIndex = minUnitIndex; unitIndex <= maxUnitIndex; unitIndex++) {
      const beat = unitIndex * sixteenthBeat - startOffsetBeatNote;
      if (beat < -1e-9) continue;
      if (beat > displayBeatNote + 1e-9) break;

      const x = getDisplayXFromBeat(beat);
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

<div class="wrap" bind:this={pianoRef.measure}>
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
  .wrap {
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
