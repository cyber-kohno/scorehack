<script lang="ts">
  import type StoreOutline from "../../../../store/props/storeOutline";
  import store from "../../../../store/store";
  import MusicTheory from "../../../../util/musicTheory";

  export let data!: StoreOutline.DataChord;
  export let elementSeq!: number;

  $: chordCaches = $store.cache.chordCaches;

  $: chordSeq = chordCaches.findIndex((c) => c.elementSeq == elementSeq);

  $: beatTips = ((): number[] => {
    const chordInfo = chordCaches[chordSeq];
    const eatHead = -chordInfo.beat.eatHead;
    const eatTail = chordInfo.beat.eatTail;
    const beat = chordInfo.beat.num;

    const tips = Array.from({ length: beat }, () => 0);

    if (eatHead != 0) {
      tips[0] = eatHead;
    }
    if (eatTail != 0) {
      tips[tips.length - 1] = eatTail;
    }
    // console.log(`${props.cache.elementSeq}, tip:[${tips.length}]`);
    return tips;
  })();

  $: degreeName = (() => {
    const degree = data.degree;
    let degreeName = "-";
    if (degree != undefined) {
      degreeName = MusicTheory.getDegreeKeyName(degree) + degree.symbol;
      if (degree.on != undefined) {
        degreeName += ` / ${MusicTheory.getDegreeKeyName(degree.on)}`;
      }
    }
    return degreeName;
  })();

  $: chordCache = $store.cache.chordCaches[chordSeq];
  $: chordName = (() => {
    const compiledChord = chordCache.compiledChord;
    if (compiledChord == undefined) return null;
    return MusicTheory.getKeyChordName(compiledChord.chord);
  })();

  const TIP_BASE_WIDTH = 12;
</script>

<div class="wrap">
  <div class="seqdiv">{chordSeq}</div>
  <div class="tipdiv">
    {#each beatTips as tip}
      <div
        class="beattip"
        style:width="{TIP_BASE_WIDTH + tip * 3}px"
        style:background-color={(() => {
          if (tip === 0) return "#cec1cbbc";
          else if (tip < 0) return "#2d22ffbb";
          else if (tip > 0) return "#dc0030bb";
        })()}
      ></div>
    {/each}
  </div>
  <div class="degreediv">{degreeName}</div>
  {#if chordName != null}
    <div class="chorddiv">{chordName}</div>
  {/if}
  <!-- アレンジのチップ -->
  {#if chordCache.arrs.length > 0}
    <div class="arr-frame">
      {#each chordCache.arrs as arr}
        <div class="arr-tip">{arr}</div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #acd3d2;
    border: solid 1px #2e6d77;
    box-sizing: border-box;
    border-radius: 4px;
  }
  .seqdiv {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--chord-seq-height);
    text-align: left;
    padding: 0 0 0 4px;
    box-sizing: border-box;

    font-size: 12px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.699);
    line-height: 15px;
  }
  .tipdiv {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--chord-tip-height);
    text-align: center;
  }

  .beattip {
    display: inline-block;
    position: relative;
    height: calc(100% - 4px);
    margin: 2px 2px 0 2px;
    border: 1px solid #0000005d;
    border-radius: 2px;
    box-sizing: border-box;
  }

  .degreediv {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--chord-degree-height);
    text-align: center;
    font-size: 22px;
    font-weight: 600;
    color: #d4e3e5;
  }
  .chorddiv {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--chord-name-height);
    text-align: center;
    font-size: 16px;
    line-height: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.639);
  }
  .arr-frame {
    display: inline-block;
    position: relative;
    background-color: #ffffff49;
    width: 100%;
    height: var(--chord-arr-height);
    font-size: 22px;
    font-weight: 600;
    color: #ccc;
    padding: 2px 0 0 0;
    box-sizing: border-box;
    vertical-align: top;
    overflow: hidden;
  }
  .arr-tip {
    display: inline-block;
    position: relative;
    background-color: #4478b4af;
    height: 16px;
    font-size: 12px;
    line-height: 16px;
    font-weight: 600;
    color: #ffffff;
    vertical-align: top;
    padding: 0 4px;
    box-sizing: border-box;
    margin: 0 0 0 2px;
  }
</style>
