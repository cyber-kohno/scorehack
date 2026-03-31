<script lang="ts">
  import ContextUtil from "../../../../store/contextUtil";
  import store from "../../../../store/store";

  const bp = ContextUtil.get("backingProps");
  const editor = ContextUtil.get("pianoEditor");
  $: backing = $bp.backing;

  $: layer = backing.layers[0];
  $: isDivMode = $editor.control === "col";
  $: isFocus = (index: number) => {
    return (
      backing.layerIndex === 0 &&
      index === backing.cursorX &&
      isDivMode &&
      $editor.phase === "edit"
    );
  };

  $: pianoRef = $store.ref.arrange.piano;
</script>

<div class="wrap" bind:this={pianoRef.pedal}>
  {#each layer.cols as col, index}
    <div class="item" style:width={`${$bp.getColWidth(col)}px`}>
      <div class="frame">
        <div class="inner" data-status={col.pedal}></div>
      </div>
      {#if isFocus(index)}
        <div class="focus"></div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--ap-backing-pedal-height);
    overflow-x: hidden;
    white-space: nowrap;
  }
  .item {
    display: inline-block;
    position: relative;
    margin: 0 0 0 1px;
    height: 100%;
    padding: 0;
    text-align: center;
    background-color: rgba(49, 84, 160, 0.491);
  }
  .frame {
    display: inline-block;
    position: relative;
    margin: 1px 0 0 0;
    height: calc(100% - 2px);
    width: 10px;
    border-radius: 6px;
    background-color: rgba(252, 252, 252, 0.705);
    border: 1px solid #6b6b6b;
    box-sizing: border-box;
  }
  .inner {
    display: inline-block;
    position: absolute;
    left: 0;
    height: 8px;
    width: 100%;
    border-radius: 8px;
    border: 1px solid #ffffff;
    box-sizing: border-box;
  }
  .inner[data-status="0"] {
    background-color: rgba(0, 119, 255, 0.911);
    top: 0;
  }
  .inner[data-status="1"] {
    background-color: rgba(238, 0, 0, 0.911);
    bottom: 0;
  }
  .inner[data-status="2"] {
    background-color: rgba(252, 214, 0, 0.911);
    top: calc(50% - 4px);
  }
  .focus {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 237, 134, 0.473);
  }
</style>
