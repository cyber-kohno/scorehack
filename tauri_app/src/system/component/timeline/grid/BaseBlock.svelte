<script lang="ts">
  import Layout from "../../../layout/layout-constant";
  import type DerivedState from "../../../store/state/derived-state";
  import RefState from "../../../store/state/ref-state";
  import { controlStore, dataStore, derivedStore, settingsStore } from "../../../store/global-store";
  import RhythmTheory from "../../../domain/theory/rhythm-theory";
  import TonalityTheory from "../../../domain/theory/tonality-theory";
  import useMelodySelector from "../../../service/melody/melody-selector";
    import StoreUtil from "../../../service/common/store-util";

  type PitchType = "tonic" | "other" | "scale";

  export let baseCache: DerivedState.BaseCache;
  export let scrollLimitProps: RefState.ScrollLimitProps;

  $: melodySelector = useMelodySelector({ control: $controlStore, data: $dataStore });

  $: beatDiv16Count = RhythmTheory.getBeatDiv16Count(baseCache.scoreBase.ts);

  $: beatWidth = $settingsStore.beatWidth * (beatDiv16Count / 4);

  $: measureLines = (() => {
    // console.log(baseCache.baseSeq);
    const list: {
      left: number;
      width: number;
    }[] = [];
    const cnt = baseCache.lengthBeat * beatDiv16Count;
    const focusPos = StoreUtil.getTimelineFocusPos($derivedStore, $controlStore);
    for (let i = 0; i < cnt; i++) {
      const left = (beatWidth / beatDiv16Count) * i;
      const absLeft = baseCache.viewPosLeft + left;
      if (
        Math.abs(scrollLimitProps.scrollMiddleX - absLeft) >
          scrollLimitProps.rectWidth &&
        Math.abs(focusPos - absLeft) > scrollLimitProps.rectWidth
      )
        continue;
      let width = 1;
      if (i % beatDiv16Count === 0) width = 3;
      if (i === 0) width = 8;
      list.push({ left, width });
    }
    return list;
  })();

  const LP = Layout.pitch;

  $: pitchItems = (() => {
    const tonality = baseCache.scoreBase.tonality;
    const scaleList =
      tonality.scale === "major"
        ? TonalityTheory.MAJOR_SCALE_INTERVALS
        : TonalityTheory.MINOR_SCALE_INTERVALS;
    const list: {
      top: number;
      type: PitchType;
    }[] = [];
    const melody = $controlStore.melody;
    const focusPitchIndex =
      melody.focus === -1
        ? melody.cursor.pitch
        : melodySelector.getCurrScoreTrack().notes[melody.focus].pitch;
    const focusTop =
      LP.TOP_MARGIN + (LP.NUM - focusPitchIndex) * LP.ITEM_HEIGHT;
    for (let i = 0; i < LP.NUM; i++) {
      const top = LP.TOP_MARGIN + i * LP.ITEM_HEIGHT;
      if (
        Math.abs(scrollLimitProps.scrollMiddleY - top) >
          scrollLimitProps.rectHeight &&
        Math.abs(focusTop - top) > scrollLimitProps.rectHeight
      )
        continue;
      let type: PitchType = "other";

      const pitchIndex = LP.NUM - 1 - i;

      const keyIndex = TonalityTheory.getKeyIndex(pitchIndex, tonality.key12);
      if (keyIndex === 0) type = "tonic";
      else if (scaleList.includes(keyIndex)) type = "scale";
      list.push({ top, type });
    }
    return list;
  })();

  const getRecordColor = (type: PitchType) => {
    switch (type) {
      case "other":
        return "#00000041";
      case "tonic":
        return "#3000ffaa";
      case "scale":
        return "#ffffff48";
    }
  };
</script>

<div
  class="wrap"
  style:left="{baseCache.viewPosLeft}px"
  style:width="{baseCache.viewPosWidth}px"
  data-even={baseCache.baseSeq % 2 === 0}
>
  <!-- 16分音符毎の補助ライン -->
  {#each measureLines as line}
    <div
      class="line"
      style:left="{line.left}px"
      style:width="{line.width}px"
    ></div>
  {/each}

  <!-- 音程の補助ライン -->
  {#each pitchItems as pitch}
    <div
      class="pitch"
      style:top="{pitch.top}px"
      style:background-color={getRecordColor(pitch.type)}
    ></div>
  {/each}
</div>

<style>
  .wrap {
    display: inline-block;
    position: absolute;
    z-index: 1;

    background-color: #3ec9ce70;
    top: 0;
    height: calc(var(--pitch-top-margin) + var(--pitch-frame-height));
  }
  .wrap[data-even="false"] {
    background-color: #3ecea370;
  }

  .line {
    display: inline-block;
    position: absolute;
    z-index: 2;
    top: var(--pitch-top-margin);
    height: calc(100% - var(--pitch-top-margin));
    background-color: rgba(0, 0, 0, 0.303);
  }

  .pitch {
    display: inline-block;
    position: absolute;
    z-index: 2;
    left: 0;
    width: 100%;
    height: var(--pitch-item-height);
    opacity: 0.2;
  }
</style>
