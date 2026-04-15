<script lang="ts">
  import OutlineFrame from "../outline/OutlineFrame.svelte";
  import TimelineFrame from "../timeline/TimelineFrame.svelte";
</script>

<div class="main">
  <OutlineFrame />
  <TimelineFrame />
</div>

<style>
  .main {
    display: inline-block;
    position: relative;
    width: 100%;
    height: calc(100% - var(--root-header-height));
    background-color: #aced09;
  }
</style>
