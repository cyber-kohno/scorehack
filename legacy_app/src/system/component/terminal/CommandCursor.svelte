<script lang="ts">
  import { onMount } from "svelte";
  import useReducerTermianl from "../../store/reducer/reducerTerminal";
  import store from "../../store/store";
  import { writable } from "svelte/store";

  const isDisp = writable(true);
  let timerId = -1;
  let prev = "";

  const resetBlinkTimer = () => {
    // 既存のタイマーをクリア
    clearInterval(timerId);
    // 点滅をリセット
    isDisp.set(true);
    // 新しいタイマーを設定
    timerId = setInterval(() => {
      isDisp.update((value) => !value);
    }, 500);
  };

  onMount(() => {
    const unsubscribe = store.subscribe(($store) => {
      const reducer = useReducerTermianl($store);

      try {
        const terminal = reducer.getTerminal();
        const checkKey = `${terminal.outputs.length}-${terminal.focus}`;
        // checkKeyの値が変化した場合にだけタイマーをリセット
        if (prev !== checkKey) {
          resetBlinkTimer();
        }
        prev = checkKey;
      } catch {
        return;
      }
    });

    resetBlinkTimer(); // 初回のタイマー設定

    return () => {
      unsubscribe(); // 購読の解除
      clearInterval(timerId); // タイマーのクリア
    };
  });
</script>

<div class="cursor" data-isDisp={$isDisp} bind:this={$store.ref.cursor}></div>

<style>
  .cursor {
    display: inline-block;
    position: relative;
    margin: 3px 0 0 0;
    width: 2px;
    height: calc(100% - 4px);
    margin-top: 2px;
    background-color: white;
    /* background-color: rgb(0, 255, 0); */
    margin-right: -2px;
  }
  .cursor[data-isDisp="false"] {
    opacity: 0;
  }
</style>
