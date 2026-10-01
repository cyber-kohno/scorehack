<script lang="ts">
  export let title!: string;
  export let isFocus = false;
</script>

<div class="item" class:focus={isFocus} class:active-item={isFocus}>
  <div class="label">{title}</div>
  <slot />
</div>

<style>
  .item {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 5px;
    margin-bottom: 6px;
    padding: 6px;
    box-sizing: border-box;
    background-color: rgba(84, 96, 104, 0.09);
  }

  .item.focus {
    background-color: rgba(255, 118, 175, 0.32);
  }

  .label {
    height: 18px;
    color: #135b82;
    font-size: 14px;
    font-weight: 800;
    line-height: 18px;
  }
</style>
