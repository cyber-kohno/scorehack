<script lang="ts">
  import ContextUtil from "../../../../../store/contextUtil";

  $: bp = ContextUtil.get("backingProps");
  $: backing = $bp.backing;

  $: layerSub = $bp.getBackLayer();

  $: isExist = (x: number, y: number) => {
    const currentKey = `${x}.${y}`;
    return layerSub.items
      .map((item) => {
        const [x, y] = item.split(".");
        return `${x}.${y}`;
      })
      .includes(currentKey);
  };
</script>

<div class="wrap" style="z-index: 1;" style:width="{$bp.getColFrameWidth()}px">
  {#each Array.from({ length: backing.recordNum }, (_, i) => backing.recordNum - 1 - i) as recordIndex}
    <div class="record">
      {#each layerSub.cols as len, colIndex}
        <div class="cell" style:width={`${$bp.getColWidth(len)}px`}>
          <div class="inner" data-exist={isExist(colIndex, recordIndex)}></div>
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .wrap {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  .record {
    display: inline-block;
    position: relative;
    margin: 1px 0 0 0;
    /* background-color: rgba(255, 255, 255, 0.74); */
    width: 100%;
    height: var(--ap-backing-record-height);
    padding: 0;
    overflow-x: hidden;
    white-space: nowrap;
  }
  .cell {
    display: inline-block;
    position: relative;
    margin: 0 0 0 1px;
    height: 100%;
    padding: 0;
    background-color: rgba(3, 3, 3, 0.1);
  }
  .inner {
    display: inline-block;
    position: relative;
    width: 100%;
    margin: 5px 0;
    height: calc(100% - 10px);
  }
  .inner[data-exist="true"] {
    background-color: rgba(255, 0, 0, 0.731);
    border-radius: 8px;
  }
</style>
