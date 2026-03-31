<script lang="ts">
    export let ref!: HTMLElement | null;
    export let dir!: "x" | "y";

    export let frameLength!: number;
    export let frameWidth!: number;

    export let dependencies!: any[];

    $: [rate, posLength] = (() => {
        let rate = 0;
        let posLength = 0;
        if (ref != null) {
            const rect = ref.getBoundingClientRect();
            dependencies.forEach((d) => d);
            switch (dir) {
                case "x":
                    {
                        const scrollTargetWidth = rect.width;
                        rate = ref.scrollLeft / (ref.scrollWidth - rect.width);
                        posLength =
                            (scrollTargetWidth / ref.scrollWidth) *
                            (frameLength - 2);
                    }
                    break;
                case "y":
                    {
                        const scrollTargetWidth = rect.height;
                        rate = ref.scrollTop / (ref.scrollHeight - rect.height);
                        posLength =
                            (scrollTargetWidth / ref.scrollHeight) *
                            (frameLength - 2);
                    }
                    break;
            }
        }
        // console.log(`posLength:${posLength}, frameLength:${frameLength}`);
        return [rate, posLength];
    })();
</script>

<div class="wrap">
    <div
        class="frame"
        style="
            {dir === 'x' ? 'height' : 'width'}: {frameWidth}px;
            {dir === 'y' ? 'height' : 'width'}: {frameLength}px;
            {dir === 'x' ? 'bottom' : 'right'}: 5px;
            {dir === 'x' ? 'left' : 'top'}: 5px;
        "
    >
        <div
            class="pos"
            style="
                {dir === 'x' ? 'left' : 'top'}: {(frameLength - posLength) *
                rate}px;
                {dir === 'y' ? 'left' : 'top'}: 0;
                {dir === 'x' ? 'width' : 'height'}: {posLength}px;
                {dir === 'y' ? 'width' : 'height'}: {frameWidth - 2}px;
                transition: {dir === 'x' ? 'left' : 'top'} 0.2s;
            "
        ></div>
    </div>
</div>

<style>
    .wrap {
        display: inline-block;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }
    .frame {
        display: inline-block;
        position: absolute;
        z-index: 3;
        background-color: rgba(133, 250, 244, 0.234);
        border: 1px solid #c6ddf1c6;
        border-radius: 4px;
        box-sizing: border-box;
    }
    .pos {
        display: inline-block;
        position: absolute;
        border-radius: 4px;
        background-color: rgba(247, 251, 255, 0.726);
        /* background-color: rgba(247, 237, 96, 0.364); */
    }
</style>
