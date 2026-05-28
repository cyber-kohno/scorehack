<script lang="ts">
  import { onMount } from "svelte";
  import FatalErrorFrame from "./FatalErrorFrame.svelte";
  import MainFrame from "./MainFrame.svelte";
  import LayoutInitializer from "../layout/layout-initializer";
  import useInputRoot from "../input/input-root";
  import { appErrorStore, derivedStore } from "../store/global-store";
  import initializeApp from "../service/app/app-initializer";
  import AppErrorState from "../store/state/app-error-state";

  onMount(() => {
    const reportError = (error: AppErrorState.Value) => {
      console.error("Application stopped after an unexpected error:", error);
      appErrorStore.set(error);
    };

    const onError = (event: ErrorEvent) => {
      reportError(AppErrorState.fromErrorEvent(event));
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(AppErrorState.fromUnhandledRejection(event));
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    void initializeApp();

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  });

  $: isStandby = $derivedStore.elementCaches.length === 0;

  $: {
    if ($appErrorStore == null) {
      const { controlKeyDown, controlKeyUp } = useInputRoot();
      window.onkeydown = controlKeyDown;
      window.onkeyup = controlKeyUp;

      LayoutInitializer.initVariableProps($derivedStore);
    } else {
      window.onkeydown = null;
      window.onkeyup = null;
    }
  }
</script>

<main>
  {#if $appErrorStore != null}
    <FatalErrorFrame error={$appErrorStore} />
  {:else if !isStandby}
    <MainFrame />
  {/if}
</main>
