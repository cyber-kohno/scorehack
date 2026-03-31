<script lang="ts">
  import type ArrangeLibrary from "../../../../store/props/arrange/arrangeLibrary";
  import MusicTheory from "../../../../util/musicTheory";
  import FinderConditionItem from "./FinderConditionItem.svelte";

  export let request: ArrangeLibrary.SearchRequest;

  $: beatInfo = (() => {
    let ret = request.beat.toString();
    if (request.eatHead !== 0 || request.eatTail !== 0) {
      ret += ` (${request.eatHead}, ${request.eatTail})`;
    }
    return ret;
  })();
</script>

<div class="wrap">
  <FinderConditionItem
    width={95}
    title={"TS"}
    value={MusicTheory.getTSName(request.ts)}
  />
  <FinderConditionItem width={140} title={"Beat"} value={beatInfo} />
  <FinderConditionItem
    width={105}
    title={"Struct"}
    value={request.structCnt.toString()}
  />
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    background-color: rgba(200, 231, 240, 0.842);
    width: 100%;
    height: 40px;
  }
</style>
