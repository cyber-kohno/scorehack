import type ElementState from "../../store/state/data/element-state";
import type DataState from "../../store/state/data/data-state";
import type ControlState from "../../store/state/control-state";
import type DerivedState from "../../store/state/derived-state";

type Context = {
  data: DataState.Value;
  control: ControlState.Value;
};

const upeOutlineSelector = (ctx: Context) => {
  const { data, control } = ctx;

  const getCurrentElement = () => {
    const elementIndex = control.outline.focus;
    return data.elements[elementIndex];
  };

  const getCurrentInitData = (): ElementState.DataInit => {
    const element = getCurrentElement();
    if (element.type !== "init")
      throw new Error("element.typeはinitでなければならない。");
    return element.data;
  };
  const getCurrentSectionData = (): ElementState.DataSection => {
    const element = getCurrentElement();
    if (element.type !== "section")
      throw new Error("element.typeはsectionでなければならない。");
    return element.data;
  };
  const getCurrentChordData = (): ElementState.DataChord => {
    const element = getCurrentElement();
    if (element.type !== "chord")
      throw new Error("element.typeはchordでなければならない。");
    return element.data;
  };
  const getCurrentTempoData = (): ElementState.DataTempo => {
    const element = getCurrentElement();
    if (element.type !== "tempo")
      throw new Error("element.typeはtempoでなければならない。");
    return element.data;
  };
  const getCurrentModulateData = (): ElementState.DataModulate => {
    const element = getCurrentElement();
    if (element.type !== "modulate")
      throw new Error("element.typeはmodulateでなければならない。");
    return element.data;
  };

  const getCurrHarmonizeTrack = () => {
    const outline = control.outline;
    return data.arrange.tracks[outline.trackIndex];
  };

  const getSelectedChordLengthBeatNote = (derived: DerivedState.Value) => {
    const { focus, focusLock } = control.outline;
    const [start, end] = focusLock === -1
      ? [focus, focus]
      : focus < focusLock
        ? [focus, focusLock]
        : [focusLock, focus];

    return derived.elementCaches
      .slice(start, end + 1)
      .reduce((sum, element) => {
        if (element.chordSeq === -1) return sum;
        return sum + derived.chordCaches[element.chordSeq].lengthBeatNote;
      }, 0);
  };

  return {
    getCurrentElement,
    getCurrentSectionData,
    getCurrentChordData,
    getCurrentInitData,
    getCurrentModulateData,
    getCurrentTempoData,
    getCurrHarmonizeTrack,
    getSelectedChordLengthBeatNote,
  };
};

export default upeOutlineSelector;
