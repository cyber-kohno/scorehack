<script lang="ts">
  import PianoViewUtil from "../../../util/pianoViewUtil";

    export let uiParam!: PianoViewUtil.UIParam;
    export let uses!: number[];
    export let scaleList!: number[];

    let ref: HTMLCanvasElement | null = null; // 要素の参照を保存

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
