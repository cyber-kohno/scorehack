<script lang="ts">
  import { onMount } from "svelte";
  import store, { createStoreUtil } from "./system/store/store";
  import { initializeAppFromStore } from "./app/bootstrap/initialize-app";
  import { bindGlobalKeyboard } from "./app/bootstrap/bind-global-keyboard";
  import { applyDynamicLayoutVariables } from "./app/bootstrap/apply-layout-variables";
  import RootLayout from "./ui/shell/RootLayout.svelte";

  onMount(() => {
    initializeAppFromStore(createStoreUtil, $store);
    return bindGlobalKeyboard(store, createStoreUtil);
  });

  $: isStandby = $store.cache.elementCaches.length === 0;
  $: applyDynamicLayoutVariables($store);
</script>

<main>
  {#if !isStandby}
    <RootLayout />
  {/if}
</main>
