<script lang="ts">
  import { onMount } from "svelte";
  import store from "./state/root-store";
  import { initializeAppFromStore } from "./app/bootstrap/initialize-app";
  import { bindGlobalKeyboard } from "./app/bootstrap/bind-global-keyboard";
  import { applyDynamicLayoutVariables } from "./app/bootstrap/apply-layout-variables";
  import { isCacheStandby } from "./state/cache-state/cache-store";
  import RootLayout from "./ui/shell/RootLayout.svelte";

  let appRoot: HTMLElement | null = null;

  const focusAppRoot = () => {
    appRoot?.focus();
  };

  onMount(() => {
    initializeAppFromStore($store);
    focusAppRoot();
    return bindGlobalKeyboard(store);
  });

  $: isStandby = isCacheStandby($store);
  $: applyDynamicLayoutVariables($store);
</script>

<main bind:this={appRoot} tabindex="-1">
  {#if !isStandby}
    <RootLayout />
  {/if}
</main>
