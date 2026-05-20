<script lang="ts">
  import { onMount } from "svelte";
  import Layout from "../../../layout/layout-constant";
  import TonalityTheory from "../../../domain/theory/tonality-theory";
  import { controlStore, refStore } from "../../../store/global-store";  import PitchFocus from "./PitchFocus.svelte";

  // let ref: HTMLElement | undefined = undefined;
  // onMount(() => ($refStore.pitch = ref));

  const pitchNames = [...Array(Layout.pitch.NUM).keys()]
    .map((v) => TonalityTheory.getPitchKey(v).reverse().join(""))
    // 音程は低い順に下から並べる
    .reverse();

  $: isMelodyMode = $controlStore.mode === "melody";
</script>

<div class="wrap" bind:this={$refStore.pitch}>
  <div class="content">
    <div class="top-margin"></div>
    {#each pitchNames as pitch}
      <div class="item">{pitch}</div>
    {/each}
    <div class="bottom-margin"></div>
  </div>
  {#if isMelodyMode}
    <PitchFocus />
  {/if}
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    background-color: #16c450;
    width: var(--pitch-width);
    height: 100%;
    overflow: hidden;
    vertical-align: top;
  }
  .content {
    display: inline-block;
    position: relative;
    width: 100%;
    height: calc(
      var(--pitch-top-margin) + var(--pitch-frame-height) +
        var(--pitch-bottom-margin)
    );
  }
  .top-margin {
    display: inline-block;
    position: relative;
    background-color: #a6d2d8;
    width: 100%;
    height: var(--pitch-top-margin);
  }
  .bottom-margin {
    display: inline-block;
    position: relative;
    background-color: #a6d2d8;
    width: 100%;
    height: var(--pitch-bottom-margin);
  }
  .item {
    display: inline-block;
    position: relative;
    background-color: #82c0cf;
    width: 100%;
    height: var(--pitch-item-height);
    border: 1px solid #00000063;
    box-sizing: border-box;
    padding: 0 0 0 2px;
    font-size: 22px;
    font-weight: 600;
    line-height: 24px;
    color: #fafaffb2;
  }
</style>
