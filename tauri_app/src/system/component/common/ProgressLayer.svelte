<script lang="ts">
  import { onDestroy } from "svelte";
  import { progressStore } from "../../store/global-store";

  $: progress = $progressStore;
  $: rate = progress == null
    ? 0
    : Math.max(0, Math.min(1, progress.value / progress.total));

  onDestroy(() => {
    progress?.onDestroy?.();
  });
</script>

{#if progress != null}
  <div
    class="progress"
    style:left="{progress.x}px"
    style:top="{progress.y}px"
    style:width="{progress.width}px"
    style:height="{progress.height}px"
  >
    <div class="bar" style:width={`${rate * 100}%`}></div>
  </div>
{/if}

<style>
  .progress {
    position: fixed;
    z-index: 9998;
    box-sizing: border-box;
    border: 1px solid rgba(48, 13, 33, 0.62);
    background-color: rgba(229, 245, 248, 0.42);
    overflow: hidden;
    pointer-events: none;
  }

  .bar {
    display: inline-block;
    position: relative;
    height: 100%;
    background-color: rgba(205, 36, 61, 0.82);
    vertical-align: top;
  }
</style>
