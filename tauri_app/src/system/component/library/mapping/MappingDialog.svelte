<script lang="ts">
  import { onDestroy, tick } from "svelte";
  import { get } from "svelte/store";
  import TonalityTheory from "../../../domain/theory/tonality-theory";
  import { controlStore, dataStore, mappingStore, refStore } from "../../../store/global-store";
  import DrumEditorState from "../../../store/state/data/arrange/drum/drum-editor-state";
  import MappingState from "../../../store/state/mapping-state";
  import DrumHitIcon from "../../common/DrumHitIcon.svelte";

  let cellRefs: HTMLElement[][] = [];

  const syncCellRefs = (recordCount: number) => {
    const refState = get(refStore);
    refState.library.mapping.cells = [];
    mappings.slice(0, recordCount).forEach((_, recordIndex) => {
      MappingState.Columns.forEach((column, columnIndex) => {
        const ref = cellRefs[recordIndex]?.[columnIndex];
        if (ref == undefined) return;
        refState.library.mapping.cells.push({ recordIndex, column, ref });
      });
    });
    refStore.set({ ...refState });
  };

  const clearCellRefs = () => {
    const refState = get(refStore);
    refState.library.mapping.cells = [];
    refStore.set({ ...refState });
  };

  onDestroy(clearCellRefs);

  $: mapping = $mappingStore;
  $: track = $dataStore.arrange.tracks[$controlStore.outline.trackIndex];
  $: mappings = track?.method === "drum" ? track.bank.mappings : [];
  $: {
    const recordCount = mappings.length;
    tick().then(() => syncCellRefs(recordCount));
  }

  const labels: Record<MappingState.Column, string> = {
    key: "Key",
    display: "Display",
    sound: "Sound",
    mark: "Mark",
  };

  const isFocus = (recordIndex: number, column: MappingState.Column) => {
    if (mapping == null) return false;
    return mapping.focus.recordIndex === recordIndex &&
      mapping.focus.column === column;
  };

  const isFocusRecord = (recordIndex: number) => {
    if (mapping == null) return false;
    return mapping.focus.recordIndex === recordIndex;
  };

  const isPlaceholder = (
    record: DrumEditorState.Mapping,
    column: MappingState.Column,
  ) => {
    return column === "display" && (record.name ?? "").length === 0;
  };

  const getMarkKind = (record: DrumEditorState.Mapping) => {
    return record.markKind;
  };

  const getValue = (
    record: DrumEditorState.Mapping,
    column: MappingState.Column,
  ) => {
    switch (column) {
      case "key": return record.key;
      case "display": return (record.name ?? "").length === 0
        ? record.key
        : record.name ?? "";
      case "sound": return record.pitch === -1
        ? ""
        : TonalityTheory.getKey12FullName(record.pitch);
      case "mark": return "";
    }
  };

  const getCellRefRow = (recordIndex: number) => {
    if (cellRefs[recordIndex] == undefined) {
      cellRefs[recordIndex] = [];
    }
    return cellRefs[recordIndex];
  };
</script>

{#if mapping != null}
  <div class="backdrop">
    <div class="dialog">
      <div class="header">
        <div class="title">Drum Mapping</div>
      </div>
      <div class="body">
        <div class="table">
          <div class="row header-row">
            {#each MappingState.Columns as column}
              <div class="cell header-cell">{labels[column]}</div>
            {/each}
          </div>
          {#if mappings.length === 0}
            <div class="empty">No mappings</div>
          {:else}
            {#each mappings as record, recordIndex}
              {@const rowRefs = getCellRefRow(recordIndex)}
              <div class:focus-record={isFocusRecord(recordIndex)} class="row">
                {#each MappingState.Columns as column}
                  <div
                    class:focus={isFocus(recordIndex, column)}
                    class:mark-cell={column === "mark"}
                    class:placeholder={isPlaceholder(record, column)}
                    class="cell"
                    bind:this={rowRefs[MappingState.Columns.indexOf(column)]}
                  >
                    {#if column === "mark"}
                      <DrumHitIcon kind={getMarkKind(record)} size={22} />
                    {:else}
                      {getValue(record, column)}
                    {/if}
                  </div>
                {/each}
              </div>
            {/each}
          {/if}
        </div>
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
    background-color: rgba(14, 24, 31, 0.34);
    backdrop-filter: blur(6px);
  }

  .dialog {
    display: inline-block;
    position: absolute;
    left: 12px;
    top: 12px;
    width: 600px;
    height: 420px;
    box-sizing: border-box;
    border: 1px solid rgba(216, 236, 246, 0.72);
    background-color: rgba(238, 247, 250, 0.96);
    box-shadow: 10px 12px 24px rgba(0, 0, 0, 0.22);
    overflow: hidden;
  }

  .header {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 42px;
    box-sizing: border-box;
    padding: 0 14px;
    background-color: #17435b;
  }

  .title {
    display: inline-block;
    position: relative;
    height: 42px;
    color: #eef8fb;
    font-size: 16px;
    font-weight: 700;
    line-height: 42px;
  }

  .body {
    display: inline-block;
    position: relative;
    width: 100%;
    height: calc(100% - 42px);
    box-sizing: border-box;
    padding: 14px;
  }

  .table {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.58);
    overflow: hidden;
  }

  .row {
    display: grid;
    position: relative;
    width: 100%;
    height: 30px;
    grid-template-columns: 1fr 1.4fr 1fr 0.7fr;
    box-sizing: border-box;
  }

  .header-row {
    height: 32px;
    background-color: rgba(25, 65, 84, 0.16);
  }

  .focus-record {
    background-color: rgba(222, 95, 132, 0.1);
  }

  .cell {
    display: inline-block;
    position: relative;
    height: 100%;
    padding: 0 6px;
    box-sizing: border-box;
    border-right: 1px solid rgba(39, 76, 92, 0.24);
    border-bottom: 1px solid rgba(39, 76, 92, 0.2);
    background-color: rgba(255, 255, 255, 0.2);
    color: #1b3340;
    font-size: 13px;
    font-weight: 700;
    line-height: 30px;
  }

  .cell:last-child {
    border-right: 0;
  }

  .header-cell {
    color: #244050;
    font-size: 14px;
    font-weight: 700;
    line-height: 32px;
    text-align: center;
  }

  .mark-cell {
    text-align: center;
    line-height: 28px;
  }

  .focus {
    outline: 2px solid #de5f84;
    outline-offset: -2px;
    background-color: rgba(255, 203, 219, 0.68);
  }

  .placeholder {
    color: rgba(27, 51, 64, 0.38);
  }

  .empty {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 32px;
    box-sizing: border-box;
    padding-left: 8px;
    color: rgba(36, 64, 80, 0.56);
    font-size: 13px;
    font-weight: 700;
    line-height: 32px;
  }
</style>
