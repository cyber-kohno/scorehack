import type InputState from "../store/state/input-state";
import { get } from "svelte/store";
import { controlStore, playbackStore } from "../store/global-store";
import stopPlaybackTimeline from "../service/playback/timeline/stop-playback-timeline";
import startPlaybackTimeline from "../service/playback/timeline/start-playback-timeline";
import createMelodyActions from "../actions/melody/melody-actions";
import type PlaybackCacheState from "../service/playback/timeline/playback-cache-state";
import MainHistoryUtil from "../infra/tauri/history/main-history-util";

const useInputMelody = () => {

    const melodyActions = createMelodyActions();
    const isCursor = () => {
        return get(controlStore).melody.focus === -1;
    };

    const isPlayback = () => {
        return get(playbackStore).timerKeys != null;
    }
    const isFocusLock = () => {
        return get(controlStore).melody.focusLock !== -1;
    }
    const togglePlayback = (target: PlaybackCacheState.LayerTargetMode = 'all') => {
        if (isPlayback()) {
            stopPlaybackTimeline();
            return;
        }

        startPlaybackTimeline({ target });
    }

    const control = (eventKey: string) => {

        if (isPlayback()) {
            switch (eventKey) {
                case ' ': togglePlayback();
            }
            return;
        }

        switch (eventKey) {
            case ' ': togglePlayback();
        }
        if (isCursor()) {
            switch (eventKey) {
                case 'ArrowLeft': melodyActions.moveCursor(-1); break;
                case 'ArrowRight': melodyActions.moveCursor(1); break;
                case '1': { melodyActions.changeCursorRate(0); } break;
                case '2': { melodyActions.changeCursorRate(1); } break;
                case '3': { melodyActions.changeCursorRate(2); } break;
                case 'ArrowUp': melodyActions.moveCursorPitch(1); break;
                case 'ArrowDown': melodyActions.moveCursorPitch(-1); break;

                case 'a': {
                    melodyActions.addNoteFromCursor();
                } break;
            }
        } else {
            switch (eventKey) {
                case 'ArrowLeft': melodyActions.moveFocusNormal(-1); break;
                case 'ArrowRight': melodyActions.moveFocusNormal(1); break;
                case 'ArrowUp': melodyActions.movePitchFocusNotes(1); break;
                case 'ArrowDown': melodyActions.movePitchFocusNotes(-1); break;
                case 'Delete': {
                    melodyActions.removeFocusNotes();
                } break;
                case 'a': {
                    melodyActions.addNoteFromFocus();
                } break;
                case '1': { melodyActions.changeCursorRate(0); } break;
                case '2': { melodyActions.changeCursorRate(1); } break;
                case '3': { melodyActions.changeCursorRate(2); } break;
            }
        }
    }

    const getHoldCallbacks = (eventKey: string): InputState.Callbacks => {
        const callbacks: InputState.Callbacks = {};

        callbacks.holdX = () => {

            if (isCursor()) {
                switch (eventKey) {
                    case 'ArrowUp': melodyActions.moveCursorPitch(12); break;
                    case 'ArrowDown': melodyActions.moveCursorPitch(-12); break;
                }
            } else {
                if (!isFocusLock()) {
                    switch (eventKey) {
                        case 'ArrowUp': melodyActions.moveNotePitch(12); break;
                        case 'ArrowDown': melodyActions.moveNotePitch(-12); break;
                    }
                } else {
                    switch (eventKey) {
                        case 'ArrowUp': melodyActions.moveRangePitch(12); break;
                        case 'ArrowDown': melodyActions.moveRangePitch(-12); break;
                    }
                }
            }
        }

        callbacks.holdE = () => {

            if (isCursor()) {
                switch (eventKey) {
                    case 'ArrowLeft': melodyActions.focusInNearNote(-1); break;
                    case 'ArrowRight': melodyActions.focusInNearNote(1); break;
                }
            } else {
                switch (eventKey) {
                    case 'ArrowLeft': melodyActions.focusOutNoteSide(-1); break;
                    case 'ArrowRight': melodyActions.focusOutNoteSide(1); break;
                    case 'Delete': melodyActions.removeFocusNotes({ focusPrevious: true }); break;
                }
            }
        }
        callbacks.holdF = () => {

            if (!isCursor()) {
                switch (eventKey) {
                    case 'ArrowLeft': melodyActions.moveNoteLen(-1); break;
                    case 'ArrowRight': melodyActions.moveNoteLen(1); break;
                }
            }
        }
        callbacks.holdD = () => {

            if (!isCursor()) {

                if (!isFocusLock()) {
                    switch (eventKey) {
                        case 'ArrowLeft': melodyActions.moveNotePos(-1); break;
                        case 'ArrowRight': melodyActions.moveNotePos(1); break;
                    }
                } else {
                    switch (eventKey) {
                        case 'ArrowLeft': melodyActions.moveRangePos(-1); break;
                        case 'ArrowRight': melodyActions.moveRangePos(1); break;
                    }
                }
            } else {
                switch (eventKey) {
                    case 'ArrowLeft': melodyActions.moveSpaceFromCursor(-1); break;
                    case 'ArrowRight': melodyActions.moveSpaceFromCursor(1); break;
                }
            }
        }
        callbacks.holdC = () => {
            if (isCursor()) {
                switch (eventKey) {
                    case 'ArrowUp': melodyActions.moveCursorPitchInScale(1); break;
                    case 'ArrowDown': melodyActions.moveCursorPitchInScale(-1); break;
                }
            } else {
                if (!isFocusLock()) {
                    switch (eventKey) {
                        case 'ArrowUp': melodyActions.moveNotePitchInScale(1); break;
                        case 'ArrowDown': melodyActions.moveNotePitchInScale(-1); break;
                    }
                } else {
                    switch (eventKey) {
                        case 'ArrowUp': melodyActions.moveRangePitchInScale(1); break;
                        case 'ArrowDown': melodyActions.moveRangePitchInScale(-1); break;
                    }
                }
            }
        }
        callbacks.holdShift = () => {
            if (eventKey.toLowerCase() === 'e') {
                melodyActions.toggleChordNameMode();
                return;
            }

            if (isCursor()) {
                switch (eventKey) {
                    case '#': melodyActions.changeCursorTuplets(3); break;
                    case ' ': togglePlayback('tl-focus-layer'); break;
                }
            } else {
                switch (eventKey) {
                    case 'ArrowLeft': melodyActions.moveFocusRange(-1); break;
                    case 'ArrowRight': melodyActions.moveFocusRange(1); break;
                    case ' ': togglePlayback('tl-focus-layer'); break;
                }
            }
        }

        callbacks.holdCtrl = () => {
            switch (eventKey) {
                case 'a': {
                    // timeline.focus = 0;
                    // timeline.focusLock = layer.notes.length - 1;
                    // update();
                } break;
                case 'c': {
                    melodyActions.copyNotes();
                } break;
                // case 'x': {
                //     copyNotes();
                //     delRangeNotes(timeline);
                //     melody.focusLock = -1;
                //     commit();
                // } break;
                case 'v': {
                    melodyActions.pasteClipboardNotes();
                } break;
                case 'z': MainHistoryUtil.undoHistory(); break;
                case 'y': MainHistoryUtil.redoHistory(); break;
            }
        }
        return callbacks;
    }

    return {
        control,
        getHoldCallbacks
    };
}
export default useInputMelody;
