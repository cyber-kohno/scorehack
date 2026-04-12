<script lang="ts">
  import ContextUtil from "../../../store/contextUtil";
  import store from "../../../store/store";
  import ChordInfoHeader from "../ChordInfoHeader.svelte";
  import FocusableContent from "../FocusableContent.svelte";
  import BackingFrame from "./backing/PEBackingFrame.svelte";
  import PEVoicingChooser from "./voicing/PEVoicingChooser.svelte";
  import ArrangeUtil from "../../../store/reducer/arrangeUtil";

  $: reducer = ArrangeUtil.useReducer($store);
  $: arrange = reducer.getArrange();
  $: editor = reducer.getPianoEditor();

  $: {
    // console.log('ArrangePianoEditor');
    ContextUtil.set('arrange', arrange);
    ContextUtil.set('pianoEditor', editor);
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
