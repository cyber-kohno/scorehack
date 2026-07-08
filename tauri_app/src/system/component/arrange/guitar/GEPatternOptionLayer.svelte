<script lang="ts">
  import createArrangeSelector from "../../../service/arrange/arrange-selector";
  import { controlStore, dataStore, inputStore } from "../../../store/global-store";
  import GEPatternDetailFrame from "./GEPatternDetailFrame.svelte";

  $: selector = createArrangeSelector({ control: $controlStore, data: $dataStore });
  $: editor = selector.getGuitarEditor();
  $: backing = editor.backing;
  $: event = (() => {
    if (backing == null) return undefined;
    if (editor.control !== "pattern") return undefined;
    if (!$inputStore.holdC) return undefined;
    return backing.events.find((event) => event.colIndex === backing.cursorX);
  })();
</script>

{#if event != undefined}
  <GEPatternDetailFrame {event} />
{/if}
