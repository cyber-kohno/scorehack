<script lang="ts">
  import Layout from "../../../const/layout";
  import StoreMelody from "../../../store/props/storeMelody";
  import type StoreRef from "../../../store/props/storeRef";
  import useReducerCache from "../../../store/reducer/reducerCache";
  import store from "../../../store/store";
  import MusicTheory from "../../../util/musicTheory";
  import Factors from "./Factors.svelte";
  import ContextUtil from "../../../store/contextUtil";
  import UnitDisplay from "../UnitDisplay.svelte";
  import useReducerMelody from "../../../store/reducer/reducerMelody";
  import { get } from "svelte/store";

  export let note: StoreMelody.Note;
  export let index: number;
  export let scrollLimitProps: StoreRef.ScrollLimitProps;
  export let cursorMiddle: number;

  const isPreview = ContextUtil.get('isPreview');

  type OperationStatus =
    | "move" // 移動
    | "len" // 長さ
    | "scale" // スケール縛り音程移動
    | "range" // 範囲選択
    | "octave" // オクターブ音程移動
    | "preview" // プレビュー中
    | "focus" // フォーカスの基準
    | "none"; // なし

  let ref: HTMLElement | null = null;
  $: {
    if (ref != null) {
      const trackIndex = $store.control.melody.trackIndex;
      const refs = $store.ref.trackArr[trackIndex];

      let instance = refs.find((r) => r.seq === index);
      if (instance == undefined) {
        instance = { seq: index, ref };
        refs.push(instance);
      } else instance.ref = ref;
    }
  }

  $: tonality = (() => {
    const { getBaseFromBeat } = useReducerCache($store);
    return getBaseFromBeat(StoreMelody.calcBeat(note.norm, note.pos)).scoreBase
      .tonality;
  })();

  $: [isDisp, left, scaleIndex, width] = (() => {
    const beatSide = StoreMelody.calcBeatSide(note);
    const [left, width] = [beatSide.pos, beatSide.len].map(
      (v) => v * $store.env.beatWidth
    );
    const middle = left + width / 2;
    const isDisp =
      Math.abs(scrollLimitProps.scrollMiddleX - middle) <=
        scrollLimitProps.rectWidth ||
      Math.abs(cursorMiddle - middle) <= scrollLimitProps.rectWidth;
    const scaleIndex = (note.pitch - tonality.key12) % 12;
    return [isDisp, left, scaleIndex, width];
  })();

  $: isScale = (() => {
    return MusicTheory.isScale(note.pitch, tonality);
  })();

  $: melody = $store.control.melody;

  $: isCriteria = (() => {
    return $store.control.mode === "melody" && melody.focus === index;
  })();
  $: isFocus = (() => {
    const { getFocusRange } = useReducerMelody($store);
    const istRange = () => {
      const [start, end] = getFocusRange();
      return start <= index && end >= index;
    };
    return $store.control.mode === "melody" && istRange();
  })();

  $: getOperationHighlight = (): OperationStatus => {
    if ($isPreview()) return "preview";
    if (!isFocus) return "focus";

    const input = $store.input;
    if (input.holdD) return "move";
    else if (input.holdF && melody.focusLock === -1) return "len";
    else if (input.holdC) return "scale";
    else if (input.holdX) return "octave";
    else if (input.holdShift || melody.focusLock !== -1) return "range";
    return "none";
  };

</script>

{#if isDisp}
  <div
    class="column"
    style:left="{left}px"
    style:width="{width}px"
    data-operation={getOperationHighlight()}
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
      {#if !$isPreview()}
        {#if !isCriteria}
          <div class="protrusion" style:height="{28 / note.norm.div}px"></div>
        {:else}
          <UnitDisplay {note} />
        {/if}
        <div class="info">{scaleIndex}</div>
        <Factors {note} />
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
  .column[data-operation="preview"] {
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
