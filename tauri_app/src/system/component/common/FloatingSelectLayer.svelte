<script lang="ts">
  import { afterUpdate, tick } from "svelte";
  import { floatingSelectStore } from "../../store/global-store";
  import FloatingSelectState from "../../store/state/floating-select-state";

  let listFrame: HTMLDivElement;

  $: select = $floatingSelectStore;
  $: filteredItems = select == null
    ? []
    : FloatingSelectState.filterItems(select.items, select.filter);
  $: before = select == null ? "" : select.filter.slice(0, select.cursor);
  $: after = select == null ? "" : select.filter.slice(select.cursor);

  const scrollFocusedItem = async () => {
    await tick();
    if (listFrame == undefined) return;

    const item = listFrame.querySelector(".item.focus") as HTMLElement | null;
    if (item == null) return;

    const centerTop = item.offsetTop + item.offsetHeight / 2 - listFrame.clientHeight / 2;
    const maxTop = Math.max(0, listFrame.scrollHeight - listFrame.clientHeight);
    const nextTop = Math.max(0, Math.min(maxTop, centerTop));

    if (Math.abs(listFrame.scrollTop - nextTop) < 4) return;
    listFrame.scrollTo({ top: nextTop, behavior: "smooth" });
  };

  afterUpdate(scrollFocusedItem);
</script>

{#if select != null}
  <div
    class="frame"
    style:left="{select.left}px"
    style:top="{select.top}px"
    style:width="{select.width}px"
    style:height="{select.height}px"
  >
    <div class="input">
      <span>{before}</span><span class="cursor"></span><span>{after}</span>
    </div>
    <div class="list" bind:this={listFrame}>
      {#if filteredItems.length === 0}
        <div class="empty">No items</div>
      {:else}
        {#each filteredItems as item, index}
          <div
            class:disabled={item.disabled}
            class:focus={select.focusIndex === index}
            class="item"
          >
            {FloatingSelectState.getItemLabel(item)}
          </div>
        {/each}
      {/if}
    </div>
  </div>
{/if}

<style>
  .frame {
    display: inline-block;
    position: absolute;
    z-index: 20;
    border: solid 1px #ffffffa8;
    border-radius: 3px;
    box-sizing: border-box;
    overflow: hidden;
    background-color: #000;
    color: #fff;
    font-family: Consolas, monospace;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.55);
  }

  .input {
    display: block;
    position: relative;
    height: 25px;
    padding: 3px 6px;
    border-bottom: solid 1px rgba(255, 255, 255, 0.28);
    box-sizing: border-box;
    line-height: 18px;
    white-space: pre;
  }

  .cursor {
    display: inline-block;
    width: 1px;
    height: 16px;
    margin-right: -1px;
    background-color: #fff;
    vertical-align: -3px;
  }

  .list {
    display: block;
    position: relative;
    height: calc(100% - 25px);
    overflow: hidden;
  }

  .item,
  .empty {
    display: block;
    position: relative;
    height: 24px;
    padding: 3px 8px;
    box-sizing: border-box;
    overflow: hidden;
    line-height: 18px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item.focus {
    background-color: rgba(255, 237, 134, 0.36);
    color: #fff7bd;
  }

  .item.disabled {
    color: rgba(255, 255, 255, 0.34);
    text-decoration: line-through;
    text-decoration-thickness: 2px;
  }

  .item.disabled.focus {
    background-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.42);
  }

  .empty {
    color: rgba(255, 255, 255, 0.62);
  }
</style>
