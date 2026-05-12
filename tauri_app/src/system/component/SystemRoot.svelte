<script lang="ts">
  import { onMount } from "svelte";
  import MainFrame from "./MainFrame.svelte";
  import LayoutInitializer from "../layout/layout-initializer";
  import useInputRoot from "../input/input-root";
  import recalculate from "../service/derived/recalculate-derived";
    import { derivedStore } from "../store/global-store";
  import ScoreHistory from "../infra/tauri/history/score-history";

  onMount(() => {
    LayoutInitializer.initConstProps();
    recalculate();

    ScoreHistory.reset();
  });

  $: isStandby = $derivedStore.elementCaches.length === 0;

  $: {
    const { controlKeyDown, controlKeyUp } = useInputRoot();
    window.onkeydown = controlKeyDown;
    window.onkeyup = controlKeyUp;

    LayoutInitializer.initVariableProps($derivedStore);
  }
</script>

<main>
  {#if !isStandby}
    <MainFrame />
  {/if}
</main>
