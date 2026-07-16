<script lang="ts">
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import FatalErrorFrame from "./FatalErrorFrame.svelte";
  import MainFrame from "./MainFrame.svelte";
  import LayoutInitializer from "../layout/layout-initializer";
  import useInputRoot from "../input/input-root";
  import { appErrorStore, derivedStore, fileStore } from "../store/global-store";
  import initializeApp from "../service/app/app-initializer";
  import AppErrorState from "../store/state/app-error-state";

  onMount(() => {
    const mainWindow = getCurrentWindow();
    const unsubscribeTitle = fileStore.subscribe((file) => {
      const scoreName = file.score?.name ?? "(Untitled)";
      void mainWindow.setTitle(`${scoreName} - Scorehack`).catch((error) => {
        console.error("Failed to update window title:", error);
      });
    });

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

    void (async () => {
      try {
        await initializeApp();
      } finally {
        await invoke("show_main_window");
      }
    })();

    return () => {
      unsubscribeTitle();
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
