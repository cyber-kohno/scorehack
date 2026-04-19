<script lang="ts">
import type StorePianoEditor from "../../../../domain/arrange/piano-editor-store";
  import SideItemLabel from "./SideItemLabel.svelte";
  import { outlineArrangeStore } from "../../../../state/session-state/outline-arrange-store";

  $: arrange = (() => {
    const arrange = $outlineArrangeStore;
    if (arrange == null) throw new Error();
    return arrange;
  })();
  $: pianoEditor = (() => {
    if (arrange.method !== "piano") return null;
    return arrange.editor as StorePianoEditor.Props;
  })();
  $: pianoBacking = (() => {
    if (!pianoEditor?.backing) return null;
    return pianoEditor.backing;
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
