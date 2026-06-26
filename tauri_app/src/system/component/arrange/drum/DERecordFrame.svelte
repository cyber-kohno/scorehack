<script lang="ts">
  import { onDestroy, tick } from "svelte";
  import { get } from "svelte/store";
  import createArrangeSelector from "../../../service/arrange/arrange-selector";
  import { controlStore, dataStore, refStore } from "../../../store/global-store";

  let recordRefs: HTMLElement[] = [];

  const syncRecordRefs = (recordCount: number) => {
    const refState = get(refStore);
    refState.arrange.drum.records = [];
    Array.from({ length: recordCount }, (_, i) => i).forEach((recordIndex) => {
      const ref = recordRefs[recordIndex];
      if (ref == undefined) return;
      refState.arrange.drum.records.push({ recordIndex, ref });
    });
    refStore.set({ ...refState });
  };

  const clearRecordRefs = () => {
    const refState = get(refStore);
    refState.arrange.drum.records = [];
    refStore.set({ ...refState });
  };

  onDestroy(clearRecordRefs);

  $: selector = createArrangeSelector({
    control: $controlStore,
    data: $dataStore,
  });
  $: editor = selector.getDrumEditor();
  $: track = selector.getCurTrack();
  $: mappings = track.method === "drum" ? track.bank.mappings : [];
  $: {
    const recordCount = editor.records.length;
    tick().then(() => syncRecordRefs(recordCount));
  }

  $: isFocus = (index: number) => {
    return (
      index === editor.cursorY &&
      editor.control === "record" &&
      editor.phase === "edit"
    );
  };

  const getDisplay = (key: string) => {
    if (key === "") return "";

    const mapping = mappings.find((item) => item.key === key);
    if (mapping == undefined) return key;
    return mapping.name ?? mapping.key;
  };

  const isPlaceholder = (key: string) => key === "";
</script>

<div class="frame">
  {#each Array.from({ length: editor.records.length }, (_, i) => editor.records.length - 1 - i) as index}
    <div class="record">
      <div
        class:placeholder={isPlaceholder(editor.records[index]?.key ?? "")}
        class="inner"
        bind:this={recordRefs[index]}
      >{getDisplay(editor.records[index]?.key ?? "")}</div>
      {#if isFocus(index)}
        <div class="focus"></div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .frame {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.38);
    color: #234250;
    font-size: 14px;
    font-weight: 700;
    * {
      vertical-align: top;
    }
  }

  .record {
    display: inline-block;
    position: relative;
    margin: 1px 0 0 0;
    width: 100%;
    height: var(--ap-backing-record-height);
    padding: 0;
    background-color: rgb(204, 228, 228);
  }

  .inner {
    display: inline-block;
    position: relative;
    z-index: 3;
    margin: 1px;
    background-color: rgba(209, 209, 209, 0.411);
    border-radius: 2px;
    border: 1px solid rgb(48, 48, 48);
    box-sizing: border-box;
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    color: #234250;
    font-size: 13px;
    font-weight: 700;
    line-height: 24px;
    overflow: hidden;
    padding-left: 4px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .inner.placeholder {
    color: rgba(35, 66, 80, 0.34);
  }

  .focus {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 237, 134, 0.473);
  }
</style>
