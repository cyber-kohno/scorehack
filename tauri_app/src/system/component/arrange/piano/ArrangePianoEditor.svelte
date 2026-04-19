<script lang="ts">
  import store from "../../../store/store";
  import ChordInfoHeader from "../ChordInfoHeader.svelte";
  import FocusableContent from "../FocusableContent.svelte";
  import BackingFrame from "./backing/PEBackingFrame.svelte";
  import PEVoicingChooser from "./voicing/PEVoicingChooser.svelte";
  import {
    setArrangeEditorArrangeContext,
    setArrangeEditorPianoEditorContext,
  } from "../../../../ui/arrange/piano-editor-context";
  import {
    getActiveArrange,
    getPianoArrangeEditor,
  } from "../../../../app/arrange/arrange-state";

  $: arrange = getActiveArrange($store);
  $: editor = getPianoArrangeEditor($store);

  $: {
    // console.log('ArrangePianoEditor');
    setArrangeEditorArrangeContext(arrange);
    setArrangeEditorPianoEditorContext(editor);
  }
</script>

<div class="wrap">
  <ChordInfoHeader />
  <FocusableContent isFocus={editor.control === "voicing"}>
    <PEVoicingChooser />
  </FocusableContent>
  {#if editor.backing != null}
    <BackingFrame />
  {/if}
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #abe4ea;
  }
</style>


