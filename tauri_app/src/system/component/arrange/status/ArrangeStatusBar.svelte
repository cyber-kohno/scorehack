<script lang="ts">
  import type DrumEditorState from "../../../store/state/data/arrange/drum/drum-editor-state";
  import type PianoEditorState from "../../../store/state/data/arrange/piano/piano-editor-state";
  import { controlStore } from "../../../store/global-store";
  import SideItemLabel from "./SideItemLabel.svelte";

  $: arrange = (() => {
    const arrange = $controlStore.outline.arrange;
    if (arrange == null) throw new Error();
    return arrange;
  })();
  $: pianoEditor = (() => {
    if (arrange.method !== "piano") return null;
    return arrange.editor as PianoEditorState.Value;
  })();
  $: pianoBacking = (() => {
    if (!pianoEditor?.backing) return null;
    return pianoEditor.backing;
  })();
  $: drumEditor = (() => {
    if (arrange.method !== "drum") return null;
    return arrange.editor as DrumEditorState.Value;
  })();
</script>

<div class="wrap">
  <SideItemLabel label={arrange.method} />
  {#if pianoEditor != null}
    <SideItemLabel
      label={"Voicing"}
      type="control"
      active={pianoEditor.control === "voicing"}
      margin="next"
    />
    {#if pianoBacking != null}
      <SideItemLabel
        label={"Column"}
        type="control"
        active={pianoEditor.control === "col"}
        margin="connect"
      />
      <SideItemLabel
        label={"Record"}
        type="control"
        active={pianoEditor.control === "record"}
        margin="connect"
      />
      <SideItemLabel
        label={"Pattern"}
        type="control"
        active={pianoEditor.control === "notes"}
        margin="connect"
      />
    {/if}
  {/if}
  {#if drumEditor != null}
    <SideItemLabel
      label={"Criteria"}
      type="control"
      active={drumEditor.control === "criteria"}
      margin="next"
    />
    <SideItemLabel
      label={"Column"}
      type="control"
      active={drumEditor.control === "col"}
      margin="connect"
    />
    <SideItemLabel
      label={"Record"}
      type="control"
      active={drumEditor.control === "record"}
      margin="connect"
    />
    <SideItemLabel
      label={"Pattern"}
      type="control"
      active={drumEditor.control === "hits"}
      margin="connect"
    />
  {/if}
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 90px;
    /* height: 100%; */
    /* min-height: 500px; */
    background-color: rgba(178, 178, 178, 0.601);
    padding: 2px;
  }
  .margin {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 20px;
  }
</style>
