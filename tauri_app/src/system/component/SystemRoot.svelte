<script lang="ts">
  import { onMount } from "svelte";
  import MainFrame from "./MainFrame.svelte";
  import store, { createStoreUtil } from "../store/store";
  import LayoutInitializer from "../layout/layout-initializer";
  import useInputRoot from "../input/input-root";
  import ContextUtil from "../store/contextUtil";
  import useReducerCache from "../service/derived/reducerCache";

  onMount(() => {
    const { lastStore, commit } = createStoreUtil($store);
    const { calculate } = useReducerCache(lastStore);
    LayoutInitializer.initConstProps();
    calculate();
    commit();
  });

  $: isStandby = $store.cache.elementCaches.length === 0;

  $: {
    const { controlKeyDown, controlKeyUp } = useInputRoot(
      createStoreUtil($store)
    );
    window.onkeydown = controlKeyDown;
    window.onkeyup = controlKeyUp;

    LayoutInitializer.initVariableProps($store);
  }

  ContextUtil.set("isPreview", () => $store.preview.timerKeys != null);
</script>

<main>
  {#if !isStandby}
    <MainFrame />
  {/if}
</main>
