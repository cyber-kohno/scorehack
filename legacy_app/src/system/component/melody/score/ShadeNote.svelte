<script lang="ts">
  import Layout from "../../../const/layout";
  import StoreMelody from "../../../store/props/storeMelody";
  import type StoreRef from "../../../store/props/storeRef";
  import store from "../../../store/store";

  export let trackIndex: number;
  export let noteIndex: number;
  export let scrollLimitProps: StoreRef.ScrollLimitProps;

  const COLOR_ARR = ["#faa", "#aabeff", "#ffa", "#afa", "#aff", "#ced"];

  $: noteColor = COLOR_ARR[trackIndex % COLOR_ARR.length];

  let ref: HTMLElement | null = null;
  $: {
    if (ref != null) {
      const refs = $store.ref.trackArr[trackIndex];

      let instance = refs.find((r) => r.seq === noteIndex);
      if (instance == undefined) {
        instance = { seq: noteIndex, ref };
        refs.push(instance);
      } else instance.ref = ref;
    }
  }

  $: scoreTrack = $store.data.scoreTracks[trackIndex];
  $: note = scoreTrack.notes[noteIndex];
  $: [isDisp, left, width] = (() => {
    const beatSide = StoreMelody.calcBeatSide(note);
    const [left, width] = [beatSide.pos, beatSide.len].map(
      (v) => v * $store.env.beatWidth
    );
    const isDisp =
      Math.abs(scrollLimitProps.scrollMiddleX - (left + width / 2)) <=
      scrollLimitProps.rectWidth;
    return [isDisp, left, width];
  })();

  const PL = Layout.pitch;
  const MARGIN = -10;
</script>

{#if isDisp}
  <div class="itemwrap" style:left="{left}px" style:width="{width}px">
    <div
      class="effect"
      style:top="{Layout.getPitchTop(note.pitch) - MARGIN + 10}px"
      bind:this={ref}
    ></div>
    <div
      class="note"
      style:top="{Layout.getPitchTop(note.pitch) - MARGIN}px"
      style:height="{PL.ITEM_HEIGHT + MARGIN * 2}px"
      style:background-color={noteColor}
    ></div>
  </div>
{/if}

<style>
  .itemwrap {
    display: inline-block;
    position: absolute;
    top: var(--pitch-top-margin);
    height: var(--pitch-frame-height);
    z-index: 1;
    box-sizing: border-box;
    /* background-color: rgba(240, 248, 255, 0.201); */
  }

  .effect {
    display: inline-block;
    position: absolute;
    left: 0;
    width: 100%;
    height: 0;
    z-index: 2;
    background: linear-gradient(to bottom, #ffeb0ed5, #f129ff00);

    transition: height 0.1s;
  }
  .note {
    display: inline-block;
    position: absolute;
    left: 0;
    width: 100%;
    z-index: 2;
    border-radius: 0 12px 12px 0;
  }
</style>
