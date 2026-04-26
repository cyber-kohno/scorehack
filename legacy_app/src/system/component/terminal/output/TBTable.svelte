<script lang="ts">
  import type StoreTerminal from "../../../store/props/storeTerminal";

  export let table!: StoreTerminal.TableProps | undefined;
  if (table == undefined) throw new Error();
</script>

<div class="wrap">
  <div class="table">
    <div class="record header">
      {#each table.cols as col}
        <div class="cell" style:width="{col.width}px">
          <div class="inner">{col.headerName}</div>
        </div>
      {/each}
    </div>
    {#each table.table as record}
      <div class="record">
        {#each record as cell, j}
          <div class="cell" style:width="{table.cols[j].width}px">
            <div class="inner" data-attr={table.cols[j].attr} data-isNumber={table.cols[j].isNumber ?? false}>{cell}</div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    /* background-color: #8a887a; */
    /* width: 100%; */
  }
  .table {
    display: inline-block;
    position: relative;
    margin: 2px 0 0 2px;
    background-color: #66e8f41a;

    font-size: 18px;
    font-weight: 400;
    line-height: 21px;
    padding: 0 4px 4px 0;
    box-sizing: border-box;
    /* width: 600px; */
  }
  .record {
    display: inline-block;
    position: relative;
    /* background-color: #63cd6876; */
    color: rgba(255, 255, 255, 0.552);
  }
  .cell {
    display: inline-block;
    position: relative;
    /* background-color: #da000035; */
    height: 28px;
    padding: 4px 0 0 4px;
    box-sizing: border-box;
    vertical-align: top;
    overflow: hidden;
  }
  .inner {
    display: inline-block;
    position: relative;
    background-color: #ffffff1d;
    width: 100%;
    height: 100%;
    padding: 0 0 0 4px;
    box-sizing: border-box;
    border-radius: 4px;
  }
  .inner[data-isNumber="true"] {
    text-align: right;
    padding-right: 8px;
  }
  .header {
    display: inline-block;
    position: relative;
    color: rgba(255, 255, 255, 0.785);
    font-weight: 600;
    font-style: italic;
    text-align: center;
    /* background-color: #63cd6376; */
    * {
      * {
        background-color: rgba(203, 252, 255, 0.195);
      }
    }
  }

  [data-attr="item"] {
    color: rgba(103, 247, 255, 0.719);
  }
  [data-attr="def"] {
    color: rgba(139, 255, 77, 0.818);
  }
  [data-attr="resource"] {
    color: rgba(255, 255, 255, 0.371);
  }
  [data-attr="category"] {
    color: rgba(255, 133, 77, 0.818);
  }
</style>
