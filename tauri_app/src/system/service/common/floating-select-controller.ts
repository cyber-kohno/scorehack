import { get } from "svelte/store";
import { floatingSelectStore, floatingTextInputStore, inputStore } from "../../store/global-store";
import InputState from "../../store/state/input-state";
import FloatingSelectState from "../../store/state/floating-select-state";

const clampCursor = (value: string, cursor: number) => {
    return Math.max(0, Math.min(value.length, cursor));
};

const getFilteredItems = (state: FloatingSelectState.Value) => (
    FloatingSelectState.filterItems(state.items, state.filter)
);

const getInitialFocusIndex = (state: FloatingSelectState.Value) => {
    const items = getFilteredItems(state);
    if (items.length === 0) return -1;
    if (state.value == undefined) return 0;

    const currentIndex = items.findIndex((item) => item.value === state.value);
    if (currentIndex < 0) return 0;
    return currentIndex;
};

const clampFocusIndex = (state: FloatingSelectState.Value, focusIndex: number) => {
    const items = getFilteredItems(state);
    if (items.length === 0) return -1;
    return Math.max(0, Math.min(items.length - 1, focusIndex));
};

namespace FloatingSelect {
    export const open = (props: FloatingSelectState.Value) => {
        const filter = props.filter;
        const state = {
            ...props,
            filter,
            cursor: clampCursor(filter, props.cursor),
        };

        inputStore.set(InputState.createInitial());
        floatingTextInputStore.set(null);
        floatingSelectStore.set({
            ...state,
            focusIndex: getInitialFocusIndex(state),
        });
    };

    export const close = () => {
        floatingSelectStore.set(null);
    };

    export const apply = () => {
        const state = get(floatingSelectStore);
        if (state == null) return;

        const item = getFilteredItems(state)[state.focusIndex];
        if (item == undefined) return;
        if (item.disabled) return;

        close();
        state.apply(item.value);
    };

    export const insert = (text: string) => {
        const state = get(floatingSelectStore);
        if (state == null) return;

        const cursor = clampCursor(state.filter, state.cursor);
        const filter = state.filter.slice(0, cursor) + text + state.filter.slice(cursor);
        const next = {
            ...state,
            filter,
            cursor: cursor + text.length,
        };

        floatingSelectStore.set({
            ...next,
            focusIndex: clampFocusIndex(next, 0),
        });
    };

    export const backspace = () => {
        const state = get(floatingSelectStore);
        if (state == null || state.cursor <= 0) return;

        const cursor = clampCursor(state.filter, state.cursor);
        const filter = state.filter.slice(0, cursor - 1) + state.filter.slice(cursor);
        const next = {
            ...state,
            filter,
            cursor: cursor - 1,
        };

        floatingSelectStore.set({
            ...next,
            focusIndex: clampFocusIndex(next, 0),
        });
    };

    export const deleteForward = () => {
        const state = get(floatingSelectStore);
        if (state == null || state.cursor >= state.filter.length) return;

        const cursor = clampCursor(state.filter, state.cursor);
        const filter = state.filter.slice(0, cursor) + state.filter.slice(cursor + 1);
        const next = {
            ...state,
            filter,
            cursor,
        };

        floatingSelectStore.set({
            ...next,
            focusIndex: clampFocusIndex(next, 0),
        });
    };

    export const moveCursor = (dir: -1 | 1) => {
        const state = get(floatingSelectStore);
        if (state == null) return;

        floatingSelectStore.set({
            ...state,
            cursor: clampCursor(state.filter, state.cursor + dir),
        });
    };

    export const moveFocus = (dir: -1 | 1) => {
        const state = get(floatingSelectStore);
        if (state == null) return;

        floatingSelectStore.set({
            ...state,
            focusIndex: clampFocusIndex(state, state.focusIndex + dir),
        });
    };
}

export default FloatingSelect;
