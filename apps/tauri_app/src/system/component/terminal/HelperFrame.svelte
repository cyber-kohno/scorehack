<script lang="ts">
  import { writable } from "svelte/store";
  import type TerminalState from "../../store/state/terminal-state";
  import { refStore } from "../../store/global-store";
  import HighlightText from "../common/HighlightText.svelte";

  export let helper!: TerminalState.HelperProps;

  //   $: [top, left] = (() => {
  //     const ref = $refStore.cursor;
  //     if (ref != null) {
  //       const { left, bottom } = ref.getBoundingClientRect();
  //       return [bottom, left];
  //     }
  //     throw new Error();
  //   })();
  const pos = writable({ top: -1024, left: -1024 });

  $: headerParts = (() => {
    const [left, ...right] = helper.header.split("/");
    return {
      left: left.trimEnd(),
      right: right.join("/").trimStart(),
    };
  })();
  $: isCommandHeader = headerParts.right === "" && headerParts.left === "command";
  $: isSubCommandHeader = headerParts.right === "sub-command";

  $: {
    const ref = $refStore.cursor;
    setTimeout(() => {
      if (ref != null) {
        const { left, bottom } = ref.getBoundingClientRect();
        pos.update(() => ({ left, top: bottom }));
      }
    }, 0);
  }
</script>

<div
  class="wrap"
  style:top="{$pos.top}px"
  style:left="{$pos.left}px"
  bind:this={$refStore.helper}
>
  <div class="header">
    <span class="header-command" class:header-attention={isCommandHeader}>{headerParts.left}</span>
    {#if headerParts.right !== ""}
      <span class="header-separator"> / </span>
      <span class="header-name" class:header-attention={isSubCommandHeader}>{headerParts.right}</span>
    {/if}
    {#if helper.overview !== ""}
      <span class="header-overview">{helper.overview}</span>
    {/if}
  </div>
  {#each helper.list as item, i}
    <div class="item" data-isFocus={helper.focus === i}>
      <HighlightText baseText={item} keyword={helper.keyword} color="#f44" />
    </div>
  {/each}
</div>

<style>
  .wrap {
    display: inline-block;
    position: absolute;
    width: 350px;
    /* height: 500px; */
    min-height: 24px;
    max-height: 300px;
    z-index: 1001;
    background-color: rgba(3, 8, 46, 0.889);
    border: 1px solid #ffffff92;
    border-radius: 2px;
    overflow: hidden;
    box-shadow: 10px 10px 15px -10px;
  }
  .header {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 24px;
    padding: 0 0 0 6px;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.12);
    border-bottom: 1px solid rgba(255, 255, 255, 0.22);
    color: rgba(232, 248, 255, 0.86);
    font-size: 13px;
    font-weight: 700;
    line-height: 22px;
  }
  .header-command {
    display: inline-block;
    color: rgba(255, 92, 178, 0.92);
  }
  .header-separator {
    display: inline-block;
    color: rgba(232, 248, 255, 0.62);
  }
  .header-name {
    display: inline-block;
    color: rgba(232, 248, 255, 0.9);
  }
  .header-attention {
    color: rgba(255, 234, 89, 0.95);
  }
  .header-overview {
    display: inline-block;
    margin-left: 8px;
    color: rgba(140, 220, 255, 0.62);
    font-weight: 500;
  }
  .item {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 26px;
    background: linear-gradient(to bottom, #ffffff22, #1b48ff2b, #ffffff22);
    color: rgba(140, 220, 255, 0.68);
    font-size: 18px;
    line-height: 22px;
    font-weight: 400;
    padding: 0 0 0 4px;
  }
  .item[data-isFocus="true"] {
    background-color: inherit;
    background-color: rgba(255, 255, 255, 0.384);
  }
</style>
