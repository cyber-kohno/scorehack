<script lang="ts">
  import { controlStore, dataStore, trackManagerStore } from "../../store/global-store";

  $: trackManager = $trackManagerStore;
  $: isMelody = $controlStore.mode === "melody";
  $: title = isMelody ? "Melody Tracks" : "Harmony Tracks";
  $: activeIndex = isMelody ? $controlStore.melody.trackIndex : $controlStore.outline.trackIndex;
  $: tracks = isMelody ? $dataStore.scoreTracks : $dataStore.arrange.tracks;
</script>

{#if trackManager != null}
  <div class="frame">
    <div class="header">
      <span>{title}</span>
    </div>
    <div class="list">
      {#each tracks as track, index}
        <div
          class="item"
          class:focus={trackManager.focus === index}
          class:active={activeIndex === index}
          data-muted={track.isMute}
        >
          <span class="mark">{activeIndex === index ? "*" : ""}</span>
          <span class="name">{track.name}</span>
          <span class="mute">{track.isMute ? "MUTE" : ""}</span>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .frame {
    display: inline-block;
    position: absolute;
    z-index: 5;
    top: var(--arrange-frame-y);
    left: var(--arrange-frame-x);
    width: 360px;
    padding: 6px;
    box-sizing: border-box;
    background-color: #cfcfd3;
    box-shadow: 10px 10px 15px -10px;
  }

  .header {
    display: flex;
    align-items: center;
    height: 28px;
    padding: 0 8px;
    box-sizing: border-box;
    background-color: #26323f;
    color: #dff6ff;
    font-size: 14px;
    font-weight: 700;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 6px;
  }

  .item {
    display: grid;
    grid-template-columns: 20px 1fr 64px;
    align-items: center;
    height: 28px;
    padding: 0 8px;
    border: solid 2px transparent;
    box-sizing: border-box;
    background-color: #eef4f6;
    color: #1c2932;
    font-size: 13px;
    font-weight: 600;
  }

  .item.focus {
    border-color: #1f6f8b;
    background-color: #d7eef3;
  }

  .item.active {
    color: #071924;
    font-weight: 800;
  }

  .item[data-muted="true"] {
    background-color: #d6d6d6;
    color: #6d6d6d;
  }

  .item[data-muted="true"].focus {
    border-color: #6b7f88;
    background-color: #c7d0d3;
  }

  .mark {
    color: #0b6690;
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mute {
    text-align: right;
    color: #a93b3b;
    font-size: 11px;
  }
</style>
