<script lang="ts">
  import Layout from "../../../../const/layout";
  import ContextUtil from "../../../../store/contextUtil";
  import VoicingCell from "./PEVoicingCell.svelte";

  const arrange = ContextUtil.get('arrange');
  $: structs = $arrange.target.compiledChord.structs;

  const editor = ContextUtil.get('pianoEditor');

  const OCTAVE_MAX = Layout.arrange.piano.VOICING_OCTAVE_MAX;

  $: cellTable = (() => {
    const voicing = $editor.voicing;
    type CellProps = {
      key12: number;
      isSelected: boolean;
      isFocus: boolean;
      isOver: boolean;
    };
    const arr: CellProps[][] = [];
    for (let y = 0; y < structs.length; y++) {
      const key12 = structs[y].key12;
      const record: CellProps[] = [];
      for (let x = 0; x < OCTAVE_MAX; x++) {
        const isEditActive =
          $editor.phase === "edit" && $editor.control === "voicing";
        const cursorKey = `${voicing.cursorX}.${voicing.cursorY}`;
        const currentKey = `${x}.${y}`;

        const isSelected = voicing.items.includes(currentKey);
        const isFocus = isEditActive && currentKey === cursorKey;

        record.push({
          key12,
          isSelected,
          isFocus,
          isOver: false,
        });
      }
      arr.push(record);
    }

    // オクターブ＞構成音準で、選択上限をチェック
    let chooseCnt = 0;
    for (let x = 0; x < OCTAVE_MAX; x++) {
      for (let y = 0; y < structs.length; y++) {
        const cell = arr[y][x];
        if (cell.isSelected) chooseCnt++;
        cell.isOver =
          cell.isSelected &&
          $editor.backing != undefined &&
          chooseCnt > $editor.backing.recordNum;
      }
    }

    return arr;
  })();
</script>

<div class="wrap">
  <div class="structdiv">
    <div class="headerdiv text">
      <div class="label-inner left">Struct</div>
    </div>
    {#each structs as struct}
      <div class="struct-item">
        <div class="label-inner text left">{`${struct.relation}`}</div>
      </div>
    {/each}
  </div>
  <div class="tablediv">
    <div class="headerdiv">
      {#each Array(8) as _, index}
        <div class="octave-item">
          <div class="label-inner text center">{`${index}`}</div>
        </div>
      {/each}
    </div>

    {#each cellTable as record}
      <div class="record">
        {#each record as cell, octaveIndex}
          <VoicingCell
            {octaveIndex}
            structKey12={cell.key12}
            isSelected={cell.isSelected}
            isOver={cell.isOver}
            isFocus={cell.isFocus}
          />
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .wrap {
    display: inline-block;
    position: relative;
    /* width: 100%; */
    width: var(--ap-voicing-frame-width);
    height: var(--ap-voicing-frame-height);
    background-color: #8dd9ce;
    * {
      vertical-align: top;
    }
  }
  .structdiv {
    display: inline-block;
    position: relative;
    width: var(--ap-voicing-struct-width);
    height: 100%;
    background-color: #ffffffaa;
    text-align: left;
  }
  .tablediv {
    display: inline-block;
    position: relative;
    width: var(--ap-voicing-table-width);
    height: 100%;
    background-color: #eaffe9aa;
  }
  .headerdiv {
    display: inline-block;
    position: relative;
    width: 100%;
    height: var(--ap-voicing-item-height);
    /* background-color: #ffe1e170; */
    vertical-align: top;
  }
  .text {
    font-size: 20px;
    line-height: 24px;
    font-weight: 600;
    color: rgba(24, 74, 255, 0.619);
  }
  .octave-item {
    display: inline-block;
    position: relative;
    width: var(--ap-voicing-item-width);
    height: var(--ap-voicing-item-height);
    background-color: #90fec9a6;
    vertical-align: top;
  }
  .struct-item {
    display: inline-block;
    position: relative;
    width: var(--ap-voicing-struct-width);
    height: var(--ap-voicing-item-height);
    background-color: #7be1e8a6;
    vertical-align: top;
  }
  .label-inner {
    display: inline-block;
    position: relative;
    margin: 1px 0 0 1px;
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    background-color: rgba(1, 250, 250, 0.3);
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.425);
    box-sizing: border-box;
    border-radius: 4px;
  }
  .center {
    text-align: center;
  }
  .left {
    text-align: left;
    padding: 0 0 0 4px;
    box-sizing: border-box;
  }
</style>
