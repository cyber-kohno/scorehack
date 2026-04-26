
/**
 * ピアノの鍵盤を描画するユーティリティ
 */
namespace PianoViewUtil {

    export type UIParam = {
        width: number;
        height: number;
        wKeyNum: number;
        sideMargin?: number;
        topMargin?: number;
        bottomMargin?: number;
        scaleColor?: string;
        nonScaleColor?: string;
    };

    export const updateCanvasRef = (props: {
        uiParam: UIParam;
        uses: number[];
        scaleList: number[];
        canvasRef: HTMLCanvasElement;
    }) => {
        const canvasRef = props.canvasRef;

        const SIDE_MARGIN = props.uiParam.sideMargin ?? 8;
        const TOP_MARGIN = props.uiParam.topMargin ?? 4;
        const BOTTOM_MARGIN = props.uiParam.bottomMargin ?? 4;
        const SCALE_COLOR = props.uiParam.scaleColor ?? '#fc5e5e88';
        const NON_SCALE_COLOR = props.uiParam.scaleColor ?? '#fcd75e87';

        // console.log(props.uses);
        const ctx = canvasRef.getContext('2d') as CanvasRenderingContext2D;

        /** 線形グラデーションを設定する */
        const setLinierGradient = (x0: number, y0: number, x1: number, y1: number, stops: {
            offset: number, color: string
        }[]) => {
            const gradColor = ctx.createLinearGradient(x0, y0, x1, y1);
            stops.forEach(stop => {
                gradColor.addColorStop(stop.offset, stop.color);
            });
            ctx.fillStyle = gradColor;
        };

        // 背景
        setLinierGradient(0, 0, 0, props.uiParam.height, [
            { offset: 0, color: '#727272' },
            { offset: 0.5, color: '#000000' },
            { offset: 1, color: '#727272' },
        ]);
        ctx.fillRect(0, 0, props.uiParam.width, props.uiParam.height);

        const FACT_WIDTH = props.uiParam.width - SIDE_MARGIN * 2;
        const FACT_HEIGHT = props.uiParam.height - (TOP_MARGIN + BOTTOM_MARGIN);
        const wMargin = 2;
        const WHITE_KEY_INTERVAL = FACT_WIDTH / props.uiParam.wKeyNum;

        /**
         * 鍵盤を走査し白鍵ごとに処理を実行する
         * @param doSomething 実行する処理
         */
        const runWhiteKeyCallback = (
            doSomething: (i: number, keyIndex: number, wLeft: number, wTop: number, wWidth: number, wHeight: number) => void
        ) => {
            let keyIndex = 0;
            for (let i = 0; i < props.uiParam.wKeyNum; i++) {
                const wLeft = SIDE_MARGIN + i * WHITE_KEY_INTERVAL;
                const wTop = TOP_MARGIN;
                const wWidth = WHITE_KEY_INTERVAL - wMargin;
                const wHeight = FACT_HEIGHT * 0.9;
                doSomething(i, keyIndex, wLeft, wTop, wWidth, wHeight);

                keyIndex++;
                // 右隣に黒鍵がある場合はもう+1インクリメントする
                if ([0, 1, 3, 4, 5].includes(i % 7)) keyIndex++;
            }
        }

        // 白鍵の描画
        runWhiteKeyCallback((i: number, keyIndex: number, wLeft: number, wTop: number, wWidth: number, wHeight: number) => {

            // トップ
            setLinierGradient(wLeft, wTop, wLeft, wTop + wHeight, [
                { offset: 0, color: '#c0c0c0' },
                { offset: 0.4, color: '#e2e2e2' },
                { offset: 1, color: '#ffffff' },
            ]);
            ctx.fillRect(wLeft, wTop, wWidth, wHeight);

            // 正面
            ctx.fillStyle = '#c7c7c7';
            ctx.fillRect(wLeft, wTop + wHeight, wWidth, FACT_HEIGHT * 0.1);

            // フォーカス
            if (props.uses.includes(keyIndex)) {
                // console.log(`scaleList:${props.scaleList.join(',')} | keyIndex:${keyIndex}`);
                ctx.fillStyle = props.scaleList.includes(keyIndex % 12) ? SCALE_COLOR : NON_SCALE_COLOR;
                ctx.fillRect(wLeft, wTop, wWidth, wHeight + FACT_HEIGHT * 0.1);
            }
        });

        // 黒鍵の描画
        runWhiteKeyCallback((i: number, keyIndex: number, wLeft: number, wTop: number, wWidth: number, wHeight: number) => {
            if ([0, 1, 3, 4, 5].includes(i % 7)) {
                const bTop = wTop;
                const bWidth = WHITE_KEY_INTERVAL * 0.6;
                const bLeft = wLeft + WHITE_KEY_INTERVAL - wMargin / 2 - bWidth / 2;
                const bHeight = wHeight * 0.7;
                const bHeightT = bHeight * 0.9;
                const bHeightF = bHeight * 0.1;

                setLinierGradient(bLeft, bTop, bLeft + bWidth, bTop, [
                    { offset: 0, color: '#030303' },
                    { offset: 0.5, color: '#adadad' },
                    { offset: 1, color: '#030303' },
                ]);
                ctx.fillRect(bLeft, bTop, bWidth, bHeightT);

                // 重ね塗り
                setLinierGradient(bLeft, bTop, bLeft, bTop + bHeightT, [
                    { offset: 0, color: '#03030334' },
                    { offset: 0.4, color: '#03030361' },
                    { offset: 1, color: '#000000' },
                ]);
                ctx.fillRect(bLeft, bTop, bWidth, bHeightT);

                // 正面
                setLinierGradient(bLeft, bTop + bHeightT, bLeft, bTop + bHeight, [
                    { offset: 0, color: '#727272' },
                    { offset: 1, color: '#000000' },
                ]);
                ctx.fillRect(bLeft, bTop + bHeightT, bWidth, bHeightF);

                // フォーカス
                if (props.uses.includes(keyIndex + 1)) {
                    ctx.fillStyle = props.scaleList.includes((keyIndex + 1) % 12) ? SCALE_COLOR : NON_SCALE_COLOR;
                    ctx.fillRect(bLeft, bTop, bWidth, bHeight);
                }

                // 影
                setLinierGradient(bLeft, bTop + bHeight, bLeft, bTop + bHeight + bHeight * 0.2, [
                    { offset: 0, color: '#0000004e' },
                    { offset: 1, color: '#00000001' },
                ]);
                ctx.fillRect(bLeft, bTop + bHeight, bWidth, bHeight * 0.2);
            }
        });

        ctx.save();
    }
}

export default PianoViewUtil;