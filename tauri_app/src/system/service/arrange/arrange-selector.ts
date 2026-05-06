import type ControlState from "../../store/state/control-state";
import type ArrangeLibrary from "../../store/state/data/arrange/arrange-library";
import type DataState from "../../store/state/data/data-state";
import type PianoEditorState from "../../store/state/data/arrange/piano/piano-editor-state";

type Context = {
    control: ControlState.Value;
    data: DataState.Value;
};

const createArrangeSelector = (ctx: Context) => {
    const { control, data } = ctx;

    const getArrange = () => {
        const arrange = control.outline.arrange;
        if (arrange == null) throw new Error();
        return arrange;
    };

    const getPianoEditor = () => {
        const arrange = getArrange();
        if (arrange.method !== "piano" || arrange.editor == undefined) throw new Error();
        return arrange.editor as PianoEditorState.Props;
    };

    const getPianoFinder = () => {
        const arrange = getArrange();
        if (arrange.method !== "piano" || arrange.finder == undefined) throw new Error();
        return arrange.finder as ArrangeLibrary.PianoArrangeFinder;
    };

    const getCurTrack = () => {
        const track = data.arrange.tracks[control.outline.trackIndex];
        if (track == undefined) throw new Error();
        return track;
    };

    const getPianoLib = () => {
        const track = getCurTrack();
        if (track.method === "piano" && track.pianoLib != undefined) {
            return track.pianoLib as PianoEditorState.Lib;
        }
        throw new Error();
    };

    return {
        getArrange,
        getCurTrack,
        getPianoEditor,
        getPianoFinder,
        getPianoLib,
    };
};

export default createArrangeSelector;
