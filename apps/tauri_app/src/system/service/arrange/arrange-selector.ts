import type ControlState from "../../store/state/control-state";
import type FinderState from "../../store/state/data/arrange/finder-state";
import type DataState from "../../store/state/data/data-state";
import type DrumEditorState from "../../store/state/data/arrange/drum/drum-editor-state";
import type GuitarEditorState from "../../store/state/data/arrange/guitar/guitar-editor-state";
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
        return arrange.editor as PianoEditorState.Value;
    };

    const getPianoFinder = () => {
        const arrange = getArrange();
        if (arrange.method !== "piano" || arrange.finder == undefined) throw new Error();
        return arrange.finder as FinderState.PianoArrangeFinder;
    };

    const getGuitarEditor = () => {
        const arrange = getArrange();
        if (arrange.method !== "guitar" || arrange.editor == undefined) throw new Error();
        return arrange.editor as GuitarEditorState.Value;
    };

    const getDrumEditor = () => {
        const arrange = getArrange();
        if (arrange.method !== "drum" || arrange.editor == undefined) throw new Error();
        return arrange.editor as DrumEditorState.Value;
    };

    const getCurTrack = () => {
        const track = data.arrange.tracks[control.outline.trackIndex];
        if (track == undefined) throw new Error();
        return track;
    };

    const getPianoLib = () => {
        const track = getCurTrack();
        if (track.method === "piano") {
            return track.bank;
        }
        throw new Error();
    };

    return {
        getArrange,
        getCurTrack,
        getDrumEditor,
        getGuitarEditor,
        getPianoEditor,
        getPianoFinder,
        getPianoLib,
    };
};

export default createArrangeSelector;
