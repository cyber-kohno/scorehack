<script lang="ts">
  import RhythmTheory from "../../../../domain/theory/rhythm-theory";
  import type FinderState from "../../../../store/state/data/arrange/finder-state";

  export let request!: FinderState.SearchRequest;
  export let method!: string;
  export let chordName: string | undefined = undefined;

  const formatEat = (value: number) => {
    if (value === 0) return "±0";
    return value > 0 ? `+${value}` : `${value}`;
  };

  $: chordItem = chordName == undefined
    ? ["Struct", `${request.structCnt}`]
    : ["Chord", chordName];

  $: items = [
    ["Method", method],
    ["TS", RhythmTheory.formatTS(request.ts)],
    ["Beat", `${request.beat}`],
    ["Eat Head", formatEat(request.eatHead)],
    ["Eat Tail", formatEat(request.eatTail)],
    chordItem,
  ];
</script>

<div class="condition-header">
  {#each items as item}
    <div class="condition">
      <div class="label">{item[0]}</div>
      <div class="value">{item[1]}</div>
    </div>
  {/each}
</div>

<style>
  .condition-header {
    display: flex;
    position: relative;
    justify-content: center;
    gap: 4px;
    width: 100%;
    height: 40px;
    padding: 4px;
    box-sizing: border-box;
    background-color: #0d263a;
  }

  .condition {
    display: inline-block;
    position: relative;
    flex: 0 0 74px;
    min-width: 0;
    height: 100%;
    border: 1px solid rgba(119, 208, 196, 0.38);
    padding: 0 3px;
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.06);
  }

  .label,
  .value {
    display: block;
    width: 100%;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .label {
    height: 14px;
    color: rgba(200, 243, 255, 0.68);
    font-size: 10px;
    font-weight: 700;
    line-height: 14px;
  }

  .value {
    height: 18px;
    color: #e4fdff;
    font-size: 13px;
    font-weight: 800;
    line-height: 18px;
  }
</style>
