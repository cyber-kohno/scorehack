namespace FloatingSelectState {
    export type Item = {
        value: string;
        label?: string;
        disabled?: boolean;
    };

    export type Value = {
        value?: string;
        filter: string;
        cursor: number;
        focusIndex: number;
        left: number;
        top: number;
        width: number;
        height: number;
        items: Item[];
        apply: (value: string) => void;
    };

    export const getItemLabel = (item: Item) => item.label ?? item.value;

    export const filterItems = (items: Item[], filter: string) => {
        const normalizedFilter = filter.toLowerCase();
        if (normalizedFilter === "") return items;

        return items.filter((item) => (
            getItemLabel(item).toLowerCase().includes(normalizedFilter)
        ));
    };

    export const createInitial = (): Value => ({
        value: undefined,
        filter: "",
        cursor: 0,
        focusIndex: -1,
        left: 0,
        top: 0,
        width: 160,
        height: 180,
        items: [],
        apply: () => { },
    });
}

export default FloatingSelectState;
