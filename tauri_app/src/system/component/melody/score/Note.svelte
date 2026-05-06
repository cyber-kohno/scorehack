<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import Layout from "../../../layout/layout-constant";
  import MelodyState from "../../../store/state/data/melody-state";
  import type RefState from "../../../store/state/ref-state";
  import TonalityTheory from "../../../domain/theory/tonality-theory";
  import Factors from "./Factors.svelte";
  import UnitDisplay from "../UnitDisplay.svelte";
  import { getNoteDisplayUnit, getProtrusionHeight } from "./note-display-util";
  import type ElementState from "../../../store/state/data/element-state";

  export let note: MelodyState.Note;
  export let index: number;
  export let scrollLimitProps: RefState.ScrollLimitProps;
  export let cursorMiddle: number;
  export let beatWidth: number;
  export let isPlayback: boolean;
  export let isCriteria: boolean;
  export let operation: OperationStatus;
  export let cursor: MelodyState.Note;
  export let scoreBase: ElementState.DataInit;
  export let registerEffectRef: (index: number, ref: HTMLElement | null) => void;

  type OperationStatus =
    | "move" // 移動
    | "len" // 長さ
    | "scale" // スケール縛り音程移動
    | "range" // 範囲選択
    | "octave" // オクターブ音程移動
    | "playback" // プレビュー中
    | "focus" // フォーカスの基準
    | "none"; // なし

  let ref: HTMLElement | null = null;

  onMount(() => {
    registerEffectRef(index, ref);
  });

  onDestroy(() => {
    registerEffectRef(index, null);
  });

  $: tonality = scoreBase.tonality;
  $: protrusionHeight = getProtrusionHeight(getNoteDisplayUnit(note, scoreBase.ts));

  $: [isDisp, left, scaleDegreeLabel, width] = (() => {
    const beatSide = MelodyState.calcBeatSide(note);
    const [left, width] = [beatSide.pos, beatSide.len].map(
      (v) => v * beatWidth,
    );
    const middle = left + width / 2;
    const isDisp =
      Math.abs(scrollLimitProps.scrollMiddleX - middle) <=
        scrollLimitProps.rectWidth ||
      Math.abs(cursorMiddle - middle) <= scrollLimitProps.rectWidth;
    const scaleIndex = TonalityTheory.getKeyIndex(note.pitch, tonality.key12);
    const scaleDegreeLabel = TonalityTheory.getScaleDegreeLabel(scaleIndex);
    return [isDisp, left, scaleDegreeLabel, width];
  })();

  $: isScale = (() => {
    return TonalityTheory.isScale(note.pitch, tonality);
  })();

</script>

{#if isDisp}
  <div
    class="column"
    style:left="{left}px"
    style:width="{width}px"
    data-operation={operation}
    data-disable={true}
  >
    <div
      class="effect"
      style:top="{Layout.getPitchTop(note.pitch) - 2 + 30}px"
      bind:this={ref}
    ></div>
    <div
      class="frame"
      style:top="{Layout.getPitchTop(note.pitch) - 2}px"
      data-isScale={isScale}
    >
      {#if !isPlayback}
        {#if !isCriteria}
          <div class="protrusion" style:height="{protrusionHeight}px"></div>
        {:else}
          <UnitDisplay note={cursor} />
        {/if}
        <div class="info">{scaleDegreeLabel}</div>
        <Factors {note} ts={scoreBase.ts} />
      {/if}
    </div>
  </div>
{/if}

<style>
  .column {
    display: inline-block;
    position: absolute;
    top: var(--pitch-top-margin);
    height: var(--pitch-frame-height);
    z-index: 4;
    box-sizing: border-box;
    background-color: #ffffff88;
  }
  .column[data-operation="playback"] {
    background-color: transparent;
  }
  .column[data-operation="focus"] {
    background-color: #ffffff45;
  }
  .column[data-operation="move"] {
    background-color: #7cffc4aa;
  }
  .column[data-operation="len"] {
    background-color: #232affaa;
  }
  .column[data-operation="scale"] {
    background-color: #ffd53faa;
  }
  .column[data-operation="octave"] {
    background-color: #ffa03baa;
  }
  .column[data-operation="range"] {
    background-color: #ff5050aa;
  }

  .effect {
    display: inline-block;
    position: absolute;
    left: 0;
    width: 100%;
    height: 0;
    z-index: 2;
    background: linear-gradient(to bottom, #ff3429d5, #f129ff00);

    transition: height 0.1s;
  }
  .frame {
    display: inline-block;
    position: absolute;
    left: 0;
    width: 100%;
    height: calc(var(--pitch-item-height) + 4px);
    z-index: 2;
    border-radius: 0 12px 12px 0;
    box-sizing: border-box;
    box-shadow: 10px 10px 15px -10px;
    background: linear-gradient(to bottom, #1ccf49d5, #b5e8adac, #1ccf49d5);
  }
  .frame[data-isScale="false"] {
    background: linear-gradient(to bottom, #eacb1dd5, #e8e1adac, #eacb1dd5);
  }

  .protrusion {
    display: inline-block;
    position: absolute;
    left: 0;
    /* top: -10px; */
    bottom: 100%;
    /* height: 10px; */
    width: 8px;
    background-color: #ff00007a;
    /* background-color: ${props => props.isScale ? '#1ccf49d5' : '#eacb1dd5'}; */
    border-radius: 4px 4px 0 0;
  }

  .info {
    display: inline-block;
    position: absolute;
    z-index: 4;
    color: rgba(156, 0, 0, 0.726);
    left: 0;
    top: 32px;
    font-size: 14px;
    font-weight: 600;
  }
</style>
