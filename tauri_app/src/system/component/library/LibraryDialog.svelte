<script lang="ts">
  import { libraryStore } from "../../store/global-store";
  import LibraryResultPanel from "./pattern/LibraryResultPanel.svelte";
  import LibrarySearchPanel from "./search/LibrarySearchPanel.svelte";

  $: library = $libraryStore;
</script>

{#if library != null}
  <div class="backdrop">
    <div class="dialog">
      <div class="search">
        <LibrarySearchPanel />
      </div>
      <div class="result">
        <LibraryResultPanel />
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    display: inline-block;
    position: absolute;
    inset: 0;
    z-index: 6;
    background-color: rgba(15, 24, 32, 0.35);
    backdrop-filter: blur(6px);
  }

  .dialog {
    display: inline-block;
    position: absolute;
    left: 12px;
    top: 12px;
    width: 752px;
    height: 600px;
    box-sizing: border-box;
    border: 1px solid rgba(215, 239, 255, 0.7);
    box-shadow: 10px 12px 24px rgba(0, 0, 0, 0.22);
    overflow: hidden;
    display: flex;
  }

  .search,
  .result {
    position: relative;
    height: 100%;
  }

  .search {
    flex: 0 0 250px;
  }

  .result {
    flex: 0 0 500px;
    background-color: rgb(0, 0, 0);
  }
</style>
