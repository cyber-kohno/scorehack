import { get } from "svelte/store";
import { floatingTextInputStore, inputStore } from "../../store/global-store";
import InputState from "../../store/state/input-state";
import type FloatingTextInputState from "../../store/state/floating-text-input-state";

const clampCursor = (value: string, cursor: number) => {
    return Math.max(0, Math.min(value.length, cursor));
};

namespace FloatingTextInput {
    export const open = (props: FloatingTextInputState.Value) => {
        inputStore.set(InputState.createInitial());
        floatingTextInputStore.set({
            ...props,
            cursor: clampCursor(props.value, props.cursor),
        });
    };

    export const close = () => {
        floatingTextInputStore.set(null);
    };

    export const apply = () => {
        const state = get(floatingTextInputStore);
        if (state == null) return;

        const value = state.value;
        close();
        state.apply(value);
    };

    export const insert = (text: string) => {
        const state = get(floatingTextInputStore);
        if (state == null) return;

        const cursor = clampCursor(state.value, state.cursor);
        const value = state.value.slice(0, cursor) + text + state.value.slice(cursor);
        floatingTextInputStore.set({
            ...state,
            value,
            cursor: cursor + text.length,
        });
    };

    export const backspace = () => {
        const state = get(floatingTextInputStore);
        if (state == null || state.cursor <= 0) return;

        const cursor = clampCursor(state.value, state.cursor);
        floatingTextInputStore.set({
            ...state,
            value: state.value.slice(0, cursor - 1) + state.value.slice(cursor),
            cursor: cursor - 1,
        });
    };

    export const deleteForward = () => {
        const state = get(floatingTextInputStore);
        if (state == null || state.cursor >= state.value.length) return;

        const cursor = clampCursor(state.value, state.cursor);
        floatingTextInputStore.set({
            ...state,
            value: state.value.slice(0, cursor) + state.value.slice(cursor + 1),
            cursor,
        });
    };

    export const moveCursor = (dir: -1 | 1) => {
        const state = get(floatingTextInputStore);
        if (state == null) return;

        floatingTextInputStore.set({
            ...state,
            cursor: clampCursor(state.value, state.cursor + dir),
        });
    };
}

export default FloatingTextInput;
