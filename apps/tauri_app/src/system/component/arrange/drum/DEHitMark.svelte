<script lang="ts">
  import DrumHitIcon from "../../common/DrumHitIcon.svelte";
  import type DrumEditorState from "../../../store/state/data/arrange/drum/drum-editor-state";

  export let kind: DrumEditorState.MarkKind = "dot";
</script>

<div class="mark">
  <DrumHitIcon {kind} size={18} />
</div>

<style>
  .mark {
    display: inline-block;
    position: absolute;
    z-index: 3;
    left: 1px;
    top: 50%;
    width: 18px;
    height: 18px;
    transform: translateY(-50%);
  }
</style>
