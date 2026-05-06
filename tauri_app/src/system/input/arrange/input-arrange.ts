import { get } from "svelte/store";
import type InputState from "../../store/state/input-state";
import createArrangeActions from "../../actions/arrange/arrange-actions";
import { controlStore, playbackStore } from "../../store/global-store";
import stopPlaybackTimeline from "../../service/playback/timeline/stop-playback-timeline";
import useInputGuitarEditor from "./inputGuitarEditor";
import useInputPianoEditor from "./inputPianoEditor";

const useInputArrange = () => {
    const arrangeActions = createArrangeActions();

    const control = (eventKey: string) => {
        const isPlayback = get(playbackStore).timerKeys != null;
        if (isPlayback) {
            if (eventKey === " ") stopPlaybackTimeline();
            return;
        }

        switch (eventKey) {
            case 'Escape':
            case 'b': {
                arrangeActions.closeArrange();
                return;
            }
        }

        const inputPianoEditor = useInputPianoEditor();
        const inputGuitarEditor = useInputGuitarEditor();
        const arrange = get(controlStore).outline.arrange;
        if (arrange == null) throw new Error();

        switch (arrange.method) {
            case 'piano': { inputPianoEditor.control(eventKey); } break;
            case 'guitar': { inputGuitarEditor.control(eventKey); } break;
        }
    }


    const getHoldCallbacks = (eventKey: string): InputState.Callbacks => {
        if (get(playbackStore).timerKeys != null) return {};

        const inputPianoEditor = useInputPianoEditor();
        const inputGuitarEditor = useInputGuitarEditor();
        const arrange = get(controlStore).outline.arrange;
        if (arrange == null) throw new Error();

        switch (arrange.method) {
            case 'piano': return inputPianoEditor.getHoldCallbacks(eventKey);
            case 'guitar': return inputGuitarEditor.getHoldCallbacks(eventKey);
        }
    }

    return {
        control,
        getHoldCallbacks
    };
}
export default useInputArrange;
