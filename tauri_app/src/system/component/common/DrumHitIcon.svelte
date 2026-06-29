<script lang="ts">
  import type DrumEditorState from "../../store/state/data/arrange/drum/drum-editor-state";

  export let kind: DrumEditorState.MarkKind = "dot";
  export let size = 22;

  const colorMap: Record<DrumEditorState.MarkKind, string> = {
    dot: "#a8f1ff",
    "dot-line": "#ffd0d8",
    cross: "#d7ddff",
    "circle-cross": "#bfffe5",
    circle: "#eadcff",
    "large-cross": "#ffe7ad",
  };

  $: color = colorMap[kind];
</script>

<svg
  class="icon"
  width={size}
  height={size}
  viewBox="0 0 32 32"
  aria-hidden="true"
>
  {#if kind === "dot"}
    <circle cx="16" cy="16" r="7" fill={color} />
  {:else if kind === "dot-line"}
    <circle cx="16" cy="16" r="7" fill={color} />
    <line x1="9" y1="16" x2="23" y2="16" stroke="#784055" stroke-width="3" stroke-linecap="round" />
  {:else if kind === "cross"}
    <line x1="10" y1="10" x2="22" y2="22" stroke={color} stroke-width="4" stroke-linecap="round" />
    <line x1="22" y1="10" x2="10" y2="22" stroke={color} stroke-width="4" stroke-linecap="round" />
  {:else if kind === "circle-cross"}
    <circle cx="16" cy="16" r="10" fill="none" stroke={color} stroke-width="3" />
    <line x1="10" y1="10" x2="22" y2="22" stroke={color} stroke-width="3.5" stroke-linecap="round" />
    <line x1="22" y1="10" x2="10" y2="22" stroke={color} stroke-width="3.5" stroke-linecap="round" />
  {:else if kind === "circle"}
    <circle cx="16" cy="16" r="9" fill="none" stroke={color} stroke-width="4" />
  {:else if kind === "large-cross"}
    <line x1="8" y1="8" x2="24" y2="24" stroke={color} stroke-width="5" stroke-linecap="round" />
    <line x1="24" y1="8" x2="8" y2="24" stroke={color} stroke-width="5" stroke-linecap="round" />
  {/if}
</svg>

<style>
  .icon {
    display: inline-block;
    vertical-align: middle;
  }
</style>
