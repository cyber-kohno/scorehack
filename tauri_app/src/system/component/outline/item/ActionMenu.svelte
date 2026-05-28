<script lang="ts">
  import { actionMenuStore, controlStore, derivedStore, refStore } from "../../../store/global-store";
  import ActionMenu from "../../../service/common/action-menu-controller";
  import type ActionMenuState from "../../../store/state/action-menu-state";

  $: actionMenu = $actionMenuStore;
  const MENU_WIDTH = 220;
  const MENU_GAP = 0;
  const ITEM_HEIGHT = 28;
  const FRAME_PADDING = 6;
  let frameRefs: HTMLElement[] = [];

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

  const getMaxHeight = (levelTop: number) => {
    const outlineRef = $refStore.outline;
    const frameHeight = outlineRef?.clientHeight ?? 480;
    return Math.max(160, frameHeight - levelTop - 8);
  };

  const getTargetScrollTop = (
    level: {
      focus: number;
    },
    frame: HTMLElement | undefined,
    levelTop: number,
  ) => {
    if (level.focus < 0) return 0;

    const height = frame?.getBoundingClientRect().height ?? getMaxHeight(levelTop);
    const itemMiddle = level.focus * ITEM_HEIGHT + ITEM_HEIGHT / 2;
    const target = Math.max(0, itemMiddle - height / 2);
    if (frame == undefined) return target;

    return Math.min(target, Math.max(0, frame.scrollHeight - frame.clientHeight));
  };

  const getLevelTop = (depth: number) => {
    let levelTop = top;
    for (let i = 1; i <= depth; i++) {
      const parentLevel = levels[i - 1];
      const parentFrame = frameRefs[i - 1];
      if (parentLevel == undefined) break;

      levelTop +=
        FRAME_PADDING +
        parentLevel.focus * ITEM_HEIGHT -
        getTargetScrollTop(parentLevel, parentFrame, levelTop);
    }
    return levelTop;
  };

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

  $: {
    levels;
    setTimeout(() => {
      levels.forEach((level) => {
        const frame = frameRefs[level.depth];
        if (frame == undefined || level.focus < 0) return;

        frame.scrollTop = getTargetScrollTop(level, frame, getLevelTop(level.depth));
      });
    }, 0);
  }
</script>

{#if actionMenu != null}
  {#each levels as level}
    <div
      class="frame"
      style:left="{left + level.depth * (MENU_WIDTH + MENU_GAP)}px"
      style:top="{getLevelTop(level.depth)}px"
      style:max-height="{getMaxHeight(getLevelTop(level.depth))}px"
      bind:this={frameRefs[level.depth]}
    >
      {#each level.items as item, index}
        <button
          type="button"
          class="item"
          class:focus={index === level.focus}
          class:parent-focus={level.hasFocusedChild && index === level.focus && item.type === "parent"}
          class:parent-sibling-muted={level.hasFocusedChild && index !== level.focus}
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
    box-sizing: border-box;
    overflow: hidden;
  }

  .item {
    display: block;
    width: 100%;
    min-height: 28px;
    height: 28px;
    flex: 0 0 28px;
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

  .item.parent-sibling-muted {
    color: rgba(200, 243, 255, 0.38);
  }

  .item[data-role="danger"] {
    color: #ffd7d7;
  }

  .item[data-role="warning"] {
    color: #ffe4b3;
  }

  .item[data-role="warning"].focus {
    border-color: #d6a85b;
    background-color: #59442a;
    color: #fff0cf;
  }

  .item[data-role="danger"].focus {
    border-color: #e08989;
    background-color: #5a2f3e;
    color: #ffe7e7;
  }
</style>
