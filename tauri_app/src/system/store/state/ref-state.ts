namespace RefState {

    export type Value = {
        grid?: HTMLElement;
        header?: HTMLElement;
        pitch?: HTMLElement;
        outline?: HTMLElement;
        terminal?: HTMLElement;
        cursor?: HTMLElement;
        helper?: HTMLElement;

        arrange: {
            piano: PianoRefs;
            finder: {
                frame?: HTMLElement;
                records: { seq: number, ref: HTMLElement }[];
            };
        }
        library: {
            finder: {
                records: { seq: number, ref: HTMLElement }[];
            };
        };

        elementRefs: RefIndex[];
        trackArr: RefIndex[][];
        noteRefs: RefIndex[][];

        timerKeys: RefTimerKey[];
    }
    export type PianoRefs = {
        col?: HTMLElement;
        measure?: HTMLElement;
        table?: HTMLElement;
        pedal?: HTMLElement;
    };
    export type RefTimerKey = {
        id: number;
        target: string;
    }

    type RefIndex = { seq: number, ref: HTMLElement };

    export const createInitial = (): Value => ({
        elementRefs: [],
        trackArr: [[]],
        noteRefs: [[]],
        timerKeys: [],
        arrange: { piano: {}, finder: { records: [] } },
        library: { finder: { records: [] } }
    });

    export type ScrollLimitProps = {
        scrollMiddleX: number;
        scrollMiddleY: number;
        rectWidth: number;
        rectHeight: number;
    }

    export const getScrollLimitProps = (ref: HTMLElement | undefined) => {
        if (ref == undefined) return null;
        const rect = ref.getBoundingClientRect();

        const props: ScrollLimitProps = {
            scrollMiddleX: ref.scrollLeft + rect.width / 2,
            scrollMiddleY: ref.scrollTop + rect.height / 2,
            rectWidth: rect.width,
            rectHeight: rect.height
        };
        return props;
    }
};
export default RefState;
