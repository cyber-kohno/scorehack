<script lang="ts">
  import PianoViewUtil from "./piano-view-util";

  export let uiParam!: PianoViewUtil.UIParam;
  export let uses!: number[];
  export let scaleList!: number[];

  let ref: HTMLCanvasElement | null = null;

  $: {
    if (ref != null) {
      PianoViewUtil.updateCanvasRef({
        canvasRef: ref,
        scaleList,
        uses,
        uiParam,
      });
    }
  }
</script>

<canvas bind:this={ref} width={uiParam.width} height={uiParam.height}> </canvas>
