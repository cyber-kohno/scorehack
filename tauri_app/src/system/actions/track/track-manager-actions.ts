import { get } from "svelte/store";
import ScoreHistory from "../../infra/tauri/history/score-history";
import Layout from "../../layout/layout-constant";
import FloatingTextInput from "../../service/common/floating-text-input-controller";
import Toast from "../../service/common/toast-controller";
import { controlStore, dataStore, inputStore, refStore, trackManagerStore } from "../../store/global-store";
import InputState from "../../store/state/input-state";
import ToastState from "../../store/state/toast-state";
import TrackManagerState from "../../store/state/track-manager-state";

const createContext = () => {
    const control = get(controlStore);
    const data = get(dataStore);
    const ref = get(refStore);
    const trackManager = get(trackManagerStore);

    const commitData = () => {
        dataStore.set({ ...data });
        ScoreHistory.add();
    };

    return {
        control,
        data,
        ref,
        trackManager,
        commitControl: () => controlStore.set({ ...control }),
        commitData,
        commitRef: () => refStore.set({ ...ref }),
    };
};

const createTrackManagerActions = () => {
    const FRAME_PADDING = 6;
    const HEADER_HEIGHT = 28;
    const LIST_MARGIN_TOP = 6;
    const ITEM_HEIGHT = 28;
    const ITEM_GAP = 2;
    const FRAME_WIDTH = 360;

    const getTracks = (ctx: ReturnType<typeof createContext>) => {
        return ctx.control.mode === "melody"
            ? ctx.data.scoreTracks
            : ctx.data.arrange.tracks;
    };

    const getActiveTrackIndex = (ctx: ReturnType<typeof createContext>) => {
        return ctx.control.mode === "melody"
            ? ctx.control.melody.trackIndex
            : ctx.control.outline.trackIndex;
    };

    const open = () => {
        const ctx = createContext();
        if (ctx.control.outline.arrange != null) return;

        inputStore.set(InputState.createInitial());
        trackManagerStore.set(TrackManagerState.createInitial(getActiveTrackIndex(ctx)));
    };

    const close = () => {
        trackManagerStore.set(null);
        inputStore.set(InputState.createInitial());
    };

    const toggle = () => {
        if (get(trackManagerStore) == null) open();
        else close();
    };

    const move = (dir: -1 | 1) => {
        const ctx = createContext();
        const trackManager = ctx.trackManager;
        if (trackManager == null) return;

        const tracks = getTracks(ctx);
        const next = trackManager.focus + dir;
        trackManager.focus = Math.max(0, Math.min(next, tracks.length - 1));
        trackManagerStore.set({ ...trackManager });
    };

    const activate = () => {
        const ctx = createContext();
        const trackManager = ctx.trackManager;
        if (trackManager == null) return;

        const tracks = getTracks(ctx);
        if (tracks[trackManager.focus] == undefined) return;

        if (ctx.control.mode === "melody") {
            ctx.control.melody.trackIndex = trackManager.focus;
            ctx.ref.trackArr.forEach((refs) => refs.length = 0);
            ctx.ref.noteRefs.forEach((refs) => refs.length = 0);
            ctx.commitRef();
        } else {
            ctx.control.outline.trackIndex = trackManager.focus;
        }
        ctx.commitControl();
    };

    const toggleMute = () => {
        const ctx = createContext();
        const trackManager = ctx.trackManager;
        if (trackManager == null) return;

        const tracks = getTracks(ctx);
        const track = tracks[trackManager.focus];
        if (track == undefined) return;

        track.isMute = !track.isMute;
        ctx.commitData();
    };

    const renameTrack = (trackIndex: number, value: string) => {
        const ctx = createContext();
        const tracks = getTracks(ctx);
        const track = tracks[trackIndex];
        if (track == undefined) return;

        const name = value.trim();
        if (name.length === 0) return;
        if (tracks.some((track, index) => index !== trackIndex && track.name === name)) {
            Toast.create({
                ...ToastState.createInitial(),
                x: Layout.root.OUTLINE_WIDTH + 16,
                y: Layout.root.HEADER_HEIGHT + 16,
                width: 260,
                text: `Track already exists. [${name}]`,
            });
            return;
        }

        track.name = name;
        ctx.commitData();
    };

    const openNameInput = () => {
        const ctx = createContext();
        const trackManager = ctx.trackManager;
        if (trackManager == null) return;

        const tracks = getTracks(ctx);
        const track = tracks[trackManager.focus];
        if (track == undefined) return;

        const left = Layout.root.OUTLINE_WIDTH + 10 + FRAME_PADDING;
        const top = Layout.root.HEADER_HEIGHT
            + 10
            + FRAME_PADDING
            + HEADER_HEIGHT
            + LIST_MARGIN_TOP
            + (ITEM_HEIGHT + ITEM_GAP) * trackManager.focus
            + ITEM_HEIGHT
            + 10;
        const width = FRAME_WIDTH - FRAME_PADDING * 2;

        FloatingTextInput.open({
            value: track.name,
            cursor: track.name.length,
            left,
            top,
            width,
            permit: (value) => value.length >= 1 && value.length <= 32,
            apply: (value) => renameTrack(trackManager.focus, value),
        });
    };

    return {
        activate,
        close,
        move,
        openNameInput,
        open,
        renameTrack,
        toggle,
        toggleMute,
    };
};

export default createTrackManagerActions;
