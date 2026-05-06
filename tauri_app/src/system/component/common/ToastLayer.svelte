<script lang="ts">
  import { onDestroy } from "svelte";
  import { toastStore } from "../../store/global-store";

  let timer: ReturnType<typeof setTimeout> | null = null;

  const clearTimer = () => {
    if (timer == null) return;
    clearTimeout(timer);
    timer = null;
  };

  $: toast = $toastStore;

  $: {
    clearTimer();
    if (toast != null) {
      timer = setTimeout(() => {
        toastStore.set(null);
      }, toast.durationMs);
    }
  }

  onDestroy(clearTimer);
</script>

{#if toast != null}
  <div
    class="toast"
    style:left="{toast.x}px"
    style:top="{toast.y}px"
    style:width="{toast.width}px"
  >
    {toast.text}
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    z-index: 10000;
    box-sizing: border-box;
    padding: 7px 10px;
    border-radius: 6px;
    background-color: #d20097f2;
    /* border: solid 1px #fefefeb9; */
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    line-height: 18px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    box-shadow: 0 4px 12px #00000055;
    pointer-events: none;
  }
</style>
