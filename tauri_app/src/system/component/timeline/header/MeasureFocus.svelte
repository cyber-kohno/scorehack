<script lang="ts">
  import ContextUtil from "../../../store/contextUtil";
  import store from "../../../store/store";
  import {
    getMelodyCurrentBeatRect,
    isMelodyMode,
  } from "../../../../state/ui-state/melody-ui-store";
  import { getTimelineFocusInfo } from "../../../../state/ui-state/timeline-ui-store";
  $: focusInfo = getTimelineFocusInfo($store);
  $: melodyRect = getMelodyCurrentBeatRect($store);
  $: isMelody = isMelodyMode($store);

  const isPreview = ContextUtil.get('isPreview');
</script>

{#if focusInfo.isChord}
  <div
    class="chord"
    style:left="{focusInfo.left}px"
    style:width="{focusInfo.width}px"
    data-isChord={focusInfo.isChord}
  ></div>
{/if}
{#if isMelody && !$isPreview()}
  <div class="note" style:left="{melodyRect.left}px" style:width="{melodyRect.width}px"></div>
{/if}

<style>
  .chord {
    display: inline-block;
    position: absolute;
    top: 0;
    height: 100%;
    z-index: 2;
    background-color: #f6be224f;
  }
  .chord[data-isChord="false"] {
    background-color: #d90000;
  }
  .note {
    display: inline-block;
    position: absolute;
    top: calc(100% - 20px);
    height: 20px;
    z-index: 3;
    background-color: #fcae1b88;
  }
</style>
