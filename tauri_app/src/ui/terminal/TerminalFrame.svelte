<script lang="ts">
  import { onMount } from "svelte";
  import CommandCursor from "./CommandCursor.svelte";
  import HelperFrame from "./HelperFrame.svelte";
  import TerminalOutput from "./TerminalOutput.svelte";
  import { adjustTerminalScroll } from "../../app/terminal/terminal-scroll";
  import store from "../../system/store/store";
  import {
    getTerminalCommandSegments,
    getTerminalHelper,
    getTerminalOutputs,
    getTerminalState,
    getTerminalTargetPrompt,
    isTerminalWaiting,
  } from "../../state/ui-state/terminal-ui-store";
  import { setTerminalFrameRef } from "../../state/session-state/terminal-session";
  import { getTerminalFrameRef } from "../../state/session-state/terminal-ref-store";

  let terminalRef: HTMLDivElement | undefined;
  let lastScrollHeight = 0;

  $: terminal = getTerminalState($store);
  $: outputs = getTerminalOutputs($store);
  $: helper = getTerminalHelper($store);
  $: isWaiting = isTerminalWaiting($store);
  $: targetPrompt = getTerminalTargetPrompt($store);
  $: [commandLeft, commandRight] = getTerminalCommandSegments($store);
  $: setTerminalFrameRef($store, terminalRef);

  onMount(() => {
    const unsubscribe = store.subscribe(($store) => {
      setTimeout(() => {
        const ref = getTerminalFrameRef();
        if (ref != undefined && lastScrollHeight !== ref.scrollHeight) {
          adjustTerminalScroll($store);
          lastScrollHeight = ref.scrollHeight;
        }
      }, 0);
    });

    return () => {
      unsubscribe();
    };
  });
</script>

{#if terminal != null}
  <div class="frame">
    <div class="wrap" bind:this={terminalRef}>
      <div class="outputs">
        {#each outputs as output}
          <TerminalOutput {output} />
        {/each}
      </div>
      {#if !isWaiting}
        <div class="command">
          <span class="target">{targetPrompt}</span>
          <span>{commandLeft}</span><CommandCursor /><span>{commandRight}</span>
        </div>
      {:else}
        <div class="command">
          <span><CommandCursor /></span>
        </div>
      {/if}
      <div class="lastmargin"></div>
    </div>
  </div>
  {#if helper != null}
    <HelperFrame {helper} />
  {/if}
{/if}

<style>
  .frame {
    display: inline-block;
    position: absolute;
    z-index: 6;
    top: 10px;
    left: 10px;
    width: 700px;
    height: 700px;
    background-color: #192055;
    box-sizing: border-box;
    box-shadow: 10px 10px 15px -10px;
  }

  .wrap {
    display: inline-block;
    position: relative;
    margin: 4px 0 0 4px;
    width: calc(100% - 8px);
    height: calc(100% - 8px);
    background-color: rgba(240, 248, 255, 0.101);
    overflow: hidden;
  }

  .outputs {
    display: inline-block;
    position: relative;
    width: 100%;
  }

  .command {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 24px;
    background-color: #ffffff42;
    font-size: 18px;
    font-weight: 400;
    line-height: 21px;
    color: white;
  }

  .command * {
    vertical-align: top;
  }

  .target {
    color: yellow;
  }

  .lastmargin {
    width: 100%;
    height: 100px;
  }
</style>
