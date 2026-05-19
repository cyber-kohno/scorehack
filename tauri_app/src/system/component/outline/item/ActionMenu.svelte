<script lang="ts">
  import { actionMenuStore, controlStore, derivedStore, refStore } from "../../../store/global-store";
  import ActionMenu from "../../../service/common/action-menu-service";
  import type ActionMenuState from "../../../store/state/action-menu-state";

  $: actionMenu = $actionMenuStore;
  const MENU_WIDTH = 232;
  const ITEM_HEIGHT = 28;
  const MENU_GAP = 0;

  $: [left, top] = (() => {
    const outlineRef = $refStore.outline;
    if (outlineRef != undefined) {
      const element = $derivedStore.elementCaches[$controlStore.outline.focus];
      const top = element.outlineTop - outlineRef.scrollTop;
      const left = 210;
      return [left, top];
    }
    return [0, 0];
  })();

  const getLevelItems = (
    items: ActionMenuState.Item[],
    path: number[],
  ) => {
    return ActionMenu.getLevelItemsForPath(items, path);
  };

  $: levels = (() => {
    if (actionMenu == null) return [];
    const result = actionMenu.path.map((_, depth) => {
      const path = actionMenu.path.slice(0, depth + 1);
      const parentFocus = actionMenu.path[depth];
      const hasFocusedChild = depth < actionMenu.path.length - 1;
      return {
        active: true,
        depth,
        path,
        items: getLevelItems(actionMenu.items, path),
        focus: parentFocus,
        hasFocusedChild,
      };
    });
    const activeItems = result[result.length - 1]?.items;
    const activeFocus = result[result.length - 1]?.focus;
    const activeItem = activeItems?.[activeFocus];
    if (activeItem?.type === "parent" && activeItem.children.length > 0) {
      result.push({
        active: false,
        depth: result.length,
        path: [...actionMenu.path, -1],
        items: activeItem.children,
        focus: -1,
        hasFocusedChild: false,
      });
    }
    return result;
  })();
</script>

{#if actionMenu != null}
  {#each levels as level}
    <div
      class="frame"
      style:left="{left + level.depth * (MENU_WIDTH + MENU_GAP)}px"
      style:top="{top}px"
    >
      {#each level.items as item, index}
        <button
          type="button"
          class="item"
          class:focus={index === level.focus}
          class:parent-focus={level.hasFocusedChild && index === level.focus && item.type === "parent"}
          data-role={item.type === "action" ? item.role ?? "normal" : "normal"}
          on:click={() => {
            if (!level.active) return;
            const nextPath = [...level.path];
            nextPath[nextPath.length - 1] = index;
            actionMenuStore.set({ ...actionMenu, path: nextPath });
            ActionMenu.enter();
          }}
        >
          <span>{item.label}</span>
          {#if item.type === "parent"}
            <span class="arrow">›</span>
          {/if}
        </button>
      {/each}
    </div>
    {/each}
{/if}

<style>
  .frame {
    display: inline-flex;
    position: absolute;
    z-index: 12;
    flex-direction: column;
    width: 220px;
    padding: 6px;
    border: solid 1px #4f7fa5;
    border-radius: 5px;
    background-color: #0d263a;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
  }

  .item {
    display: block;
    width: 100%;
    min-height: 28px;
    height: 28px;
    padding: 4px 8px;
    border: solid 1px transparent;
    border-radius: 4px;
    background-color: transparent;
    color: #c8f3ff;
    font: inherit;
    font-size: 13px;
    line-height: 18px;
    text-align: left;
  }

  .item {
    justify-content: space-between;
  }

  .arrow {
    float: right;
    font-size: 16px;
    line-height: 16px;
  }

  .item.focus {
    border-color: #77d0c4;
    background-color: #1c5b66;
    color: #e4fdff;
    font-weight: 700;
  }

  .item.parent-focus {
    border-color: #6aa7c8;
    background-color: #214763;
    color: #d6f7ff;
  }

  .item[data-role="danger"] {
    color: #ffd7d7;
  }

  .item[data-role="danger"].focus {
    border-color: #e08989;
    background-color: #5a2f3e;
    color: #ffe7e7;
  }
</style>
