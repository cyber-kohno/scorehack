<script lang="ts">
  import { onMount } from "svelte";
  import CommandCursor from "./CommandCursor.svelte";
  import TerminalOutput from "./TerminalOutput.svelte";
  import HelperFrame from "./HelperFrame.svelte";
  import useScrollService from "../../service/common/scroll-service";
  import { controlStore, dataStore, derivedStore, refStore, settingsStore, terminalStore } from "../../store/global-store";
  import useTerminalSelector from "../../service/terminal/terminal-selector";

  $: terminal = $terminalStore;
  $: terminalSelector = terminal == null ? null : useTerminalSelector({ terminal });

  $: helper = terminal?.helper;

  $: [commandLeft, commandRight] = terminalSelector?.splitCommand() ?? ["", ""];

  let lastScrollHeight = 0;
  onMount(() => {
    const unsubscribe = terminalStore.subscribe((terminal) => {
      setTimeout(() => {
        const terminalRef = $refStore.terminal;
        if (terminalRef != undefined) {
          if (lastScrollHeight !== terminalRef.scrollHeight) {
            const { adjustTerminalScroll } = useScrollService({
              control: $controlStore,
              data: $dataStore,
              derived: $derivedStore,
              ref: $refStore,
              settings: $settingsStore,
              terminal,
              commitRef: () => refStore.set({ ...$refStore }),
            });
            adjustTerminalScroll();
            lastScrollHeight = terminalRef.scrollHeight;
          }
        }
      }, 0);
    });

    return () => {
      unsubscribe();
    };
  });
</script>

<div class="frame">
  <div class="wrap" bind:this={$refStore.terminal}>
    <div class="outputs">
      {#each terminal?.outputs ?? [] as output}
        <TerminalOutput {output} />
      {/each}
    </div>
    {#if terminal != null && !terminal.wait}
      <div class="command">
        <span class="target">{"$" + terminal.target + ">"}</span>
        <span>{commandLeft}</span><CommandCursor /><span>{commandRight}</span>
      </div>
    {:else if terminal != null}
      <!-- 待機中はカーソルの点滅のみ表示 -->
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

<style>
  .frame {
    display: inline-block;
    position: absolute;
    z-index: 6;
    top: 10px;
    left: 10px;
    width: 700px;
    height: 700px;
    /* background-color: #003650; */
    background-color: #192055;
    /* border: 2px solid #fb0000; */
    box-sizing: border-box;
    /* opacity: 0.99; */
    box-shadow: 10px 10px 15px -10px;
    /* border-radius: 4px; */
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
    /* background-color: #c2eaef2c; */
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
    /* color: rgb(0, 255, 0); */
    color: white;

    * {
      vertical-align: top;
    }
  }
  .target {
    color: yellow;
  }

  .lastmargin {
    width: 100%;
    height: 100px;
    /* background-color: #ffffff41; */
  }
</style>
