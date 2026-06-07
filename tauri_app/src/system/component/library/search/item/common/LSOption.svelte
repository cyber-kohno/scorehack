<script lang="ts">
  export let isActive = false;
</script>

<div class="option" class:active={isActive}>
  <slot />
</div>

<style>
  .option {
    display: inline-block;
    flex: 0 0 var(--ls-option-width, 100%);
    width: var(--ls-option-width, 100%);
    height: 28px;
    box-sizing: border-box;
    border: 1px solid rgba(74, 97, 111, 0.55);
    background-color: rgba(255, 255, 255, 0.62);
    color: #21323d;
    font-size: 13px;
    font-weight: 700;
    line-height: 26px;
    text-align: center;
  }

  .option.active {
    border-color: #136c8a;
    background-color: #c7ecf3;
    color: #06212c;
  }
</style>
