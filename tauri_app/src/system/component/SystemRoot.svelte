<script lang="ts">
  import { onMount } from "svelte";
  import MainFrame from "./MainFrame.svelte";
  import LayoutInitializer from "../layout/layout-initializer";
  import useInputRoot from "../input/input-root";
  import recalculate from "../service/derived/recalculate-derived";
    import { derivedStore } from "../store/global-store";
    import MainHistoryUtil from "../infra/tauri/history/main-history-util";

  onMount(() => {
    LayoutInitializer.initConstProps();
    recalculate();

    MainHistoryUtil.resetHistory();
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
