<script lang="ts">
  import { envStore } from "../../../../state/session-state/env-store";
  import { previewStore } from "../../../../state/session-state/preview-store";

  $: width = 300;
  $: pos = $previewStore.linePos * $envStore.beatWidth - width;
</script>

<div class="frame">
  <div class="wrap" style:left="{pos}px">
    <div class="shade" style:width="{width}px"></div>
    <div class="line"></div>
  </div>
</div>

<style>
  .frame {
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
    width: var(--beat-sum);
    height: var(--pitch-frame-height);
    z-index: 12;
    /* background-color: rgba(255, 255, 249, 0.359); */
  }
  .wrap {
    display: inline-block;
    position: absolute;
    top: 0;
    height: 100%;
    /* background-color: rgba(255, 255, 249, 0.359); */
  }
  .shade {
    display: inline-block;
    position: relative;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(255, 251, 39, 0),
      rgba(39, 118, 255, 0.809)
    );
  }
  .line {
    display: inline-block;
    position: relative;
    width: 6px;
    height: 100%;
    background-color: rgba(0, 89, 255, 0.85);
  }
</style>


