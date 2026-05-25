<script lang="ts">
  import { controlStore, playbackStore } from "../../../store/global-store";

  $: isPlayback = $playbackStore.timerKeys != null;
  $: content = (() => {
    if (isPlayback) return null;

    if ($controlStore.mode === "harmonize") {
      const elements = $controlStore.outline.clipboard.elements;
      if (elements == null || elements.length === 0) return null;
      return `block ${elements.length}`;
    }

    const notes = $controlStore.melody.clipboard.notes;
    if (notes == null || notes.length === 0) return null;
    return `melody ${notes.length}`;
  })();
</script>

{#if content != null}
  <div class="wrap">
    <div>clipboard</div>
    <div>{content}</div>
  </div>
{/if}

<style>
  .wrap {
    position: absolute;
    left: 8px;
    top: 8px;
    z-index: 5;
    box-sizing: border-box;
    min-width: 132px;
    padding: 7px 12px;
    background-color: rgba(9, 63, 178, 0.8);
    color: rgba(255, 255, 255, 0.92);
    font-size: 17px;
    font-weight: 600;
    line-height: 21px;
    letter-spacing: 0;
    pointer-events: none;
  }
</style>
