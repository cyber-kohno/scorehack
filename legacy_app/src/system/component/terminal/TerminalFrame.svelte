<script lang="ts">
  import { onMount } from "svelte";
  import useReducerTermianl from "../../store/reducer/reducerTerminal";
  import store from "../../store/store";
  import CommandCursor from "./CommandCursor.svelte";
  import TerminalOutput from "./TerminalOutput.svelte";
  import useReducerRef from "../../store/reducer/reducerRef";
  import HelperFrame from "./HelperFrame.svelte";

  $: reducer = useReducerTermianl($store);
  // $: {getTerminal} = useReducerTermianl($store);
  $: terminal = reducer.getTerminal();

  $: helper = terminal.helper;

  $: [commandLeft, commandRight] = reducer.splitCommand();

  let lastScrollHeight = 0;
  onMount(() => {
    const unsubscribe = store.subscribe(($store) => {
      setTimeout(() => {
        const ref = $store.ref.terminal;
        if (ref != undefined) {
          if (lastScrollHeight !== ref.scrollHeight) {
            const { adjustTerminalScroll } = useReducerRef($store);
            adjustTerminalScroll();
            lastScrollHeight = ref.scrollHeight;
          }
        }
      }, 0);
      return () => {
        unsubscribe(); // 購読の解除
      };
    });
  });
</script>

<div class="frame">
  <div class="wrap" bind:this={$store.ref.terminal}>
    <div class="outputs">
      {#each terminal.outputs as output}
        <TerminalOutput {output} />
      {/each}
    </div>
    {#if !terminal.wait}
      <div class="command">
        <span class="target">{"$" + terminal.target + ">"}</span>
        <span>{commandLeft}</span><CommandCursor /><span>{commandRight}</span>
      </div>
    {:else}
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
