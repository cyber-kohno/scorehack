<script lang="ts">
  import ChordInfoHeader from "../ChordInfoHeader.svelte";
  import FocusableContent from "../FocusableContent.svelte";
  import BackingFrame from "./backing/PEBackingFrame.svelte";
  import PEVoicingChooser from "./voicing/PEVoicingChooser.svelte";
  import createArrangeSelector from "../../../service/arrange/arrange-selector";
  import { controlStore, dataStore } from "../../../store/global-store";
  import { createPianoEditorContext } from "./piano-editor-context";

  const pianoContext = createPianoEditorContext();

  $: reducer = createArrangeSelector({ control: $controlStore, data: $dataStore });
  $: arrange = reducer.getArrange();
  $: editor = reducer.getPianoEditor();

  $: {
    pianoContext.arrange.set(arrange);
    pianoContext.editor.set(editor);
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
