<script lang="ts">
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import store from "../../system/store/store";
  import { setCursorRef } from "../../state/session-state/terminal-session";
  import { getTerminalState } from "../../state/ui-state/terminal-ui-store";

  const isDisp = writable(true);
  let timerId = -1;
  let prev = "";
  let cursorRef: HTMLDivElement | undefined;

  const resetBlinkTimer = () => {
    clearInterval(timerId);
    isDisp.set(true);
    timerId = setInterval(() => {
      isDisp.update((value) => !value);
    }, 500);
  };

  $: setCursorRef($store, cursorRef);

  onMount(() => {
    const unsubscribe = store.subscribe(($store) => {
      const terminal = getTerminalState($store);
      if (terminal == null) return;

      const checkKey = `${terminal.outputs.length}-${terminal.focus}`;
      if (prev !== checkKey) {
        resetBlinkTimer();
      }
      prev = checkKey;
    });

    resetBlinkTimer();

    return () => {
      unsubscribe();
      clearInterval(timerId);
    };
  });
</script>

<div class="cursor" data-isDisp={$isDisp} bind:this={cursorRef}></div>

<style>
  .cursor {
    display: inline-block;
    position: relative;
    margin: 3px 0 0 0;
    width: 2px;
    height: calc(100% - 4px);
    margin-top: 2px;
    background-color: white;
    margin-right: -2px;
  }

  .cursor[data-isDisp="false"] {
    opacity: 0;
  }
</style>
