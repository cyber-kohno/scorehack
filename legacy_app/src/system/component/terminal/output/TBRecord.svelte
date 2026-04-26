<script lang="ts">
  import type StoreTerminal from "../../../store/props/storeTerminal";

  export let record!: StoreTerminal.RecordProps | undefined;
  if (record == undefined) throw new Error();
</script>

<div class="record" data-attr={record.attr}>
  {#each record.texts as text}
    <span data-highlight={text.highlight}>{text.str}</span>
  {/each}
</div>

<style>
  .record {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 24px;
    /* background-color: #ffda062c; */

    font-size: 18px;
    font-weight: 400;
    line-height: 21px;
    /* color: rgba(116, 255, 246, 0.619); */

    * {
      vertical-align: top;
    }
  }
  .record[data-attr="info"] {
    color: rgba(255, 255, 210, 0.808);
  }
  .record[data-attr="backup"] {
    background-color: #0000001e;
    color: rgba(167, 255, 249, 0.48);
  }
  .record[data-attr="error"] {
    color: rgb(254, 2, 2);
  }

  [data-highlight="func"] {
    color: rgb(27, 254, 2);
  }
  [data-highlight="item"] {
    color: rgb(2, 254, 233);
  }
  [data-highlight="word"] {
    color: rgb(255, 255, 255);
  }
</style>
