<script lang="ts">
  import ContextUtil from "../../../../../store/contextUtil";
  import StorePianoBacking from "../../../../../store/props/arrange/piano/storePianoBacking";

  export let colIndex!: number;
  export let recordIndex!: number;
  export let col!: StorePianoBacking.Col;

  $: editor = ContextUtil.get("pianoEditor");
  $: bp = ContextUtil.get("backingProps");
  $: backing = $bp.backing;

  $: isEditActive = $editor.control === "notes" && $editor.phase === "edit";

  $: [isFocus, isSelected] = (() => {
    const x = colIndex;
    const y = recordIndex;
    const cursorKey = `${backing.cursorX}.${backing.cursorY}`;
    const currentKey = `${x}.${y}`;
    const isFocus = isEditActive && currentKey === cursorKey;

    const convRemoveOptionNotes = (items: string[]) => {
      return items.map((item) => {
        const [x, y] = item.split(".");
        return `${x}.${y}`;
      });
    };
    const isSelected = convRemoveOptionNotes($bp.getCurLayer().items).includes(
      currentKey
    );
    return [isFocus, isSelected];
  })();
</script>

<div
  class="cell"
  style="
        width: {$bp.getColWidth(col).toString()}px;
    "
>
  {#if isSelected}
    <div class="inner"></div>
  {/if}
  {#if isFocus}
    <div class="focus"></div>
  {/if}
</div>

<style>
  .cell {
    display: inline-block;
    position: relative;
    background-color: rgba(60, 53, 128, 0.685);
    border-radius: 2px;
    margin: 0 0 0 1px;
    height: 100%;
    padding: 0;
  }
  .inner {
    display: inline-block;
    position: relative;
    margin: 7px 1px;
    border-radius: 2px;
    border: 1px solid rgba(48, 48, 48, 0.589);
    /* background-color: rgba(58, 253, 58, 0.74); */
    background: linear-gradient(
      to bottom,
      rgba(58, 253, 58, 0.445),
      rgba(89, 255, 89, 0.932),
      rgba(58, 253, 58, 0.445)
    );
    box-sizing: border-box;
    width: calc(100% - 2px);
    height: calc(100% - 14px);
  }
  .focus {
    display: inline-block;
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 237, 134, 0.473);
    left: 0;
    top: 0;
    z-index: 2;
  }
</style>
