import { get } from "svelte/store";
import type InputState from "../store/state/input-state";
import { controlStore, dataStore, playbackStore } from "../store/global-store";
import useInputFinder from "./arrange/finder/inputFinder";
import useInputArrange from "./arrange/input-arrange";
import createOutlineActions from "../actions/outline/outline-actions";
import startPlaybackTimeline from "../service/playback/timeline/start-playback-timeline";
import stopPlaybackTimeline from "../service/playback/timeline/stop-playback-timeline";

const useInputOutline = () => {

  const inputArrange = useInputArrange();
  const inputFinder = useInputFinder();
  const outlineActions = createOutlineActions();

  const isPlayback = () => get(playbackStore).timerKeys != null;
  const togglePlayback = () => {
    if (isPlayback()) {
      stopPlaybackTimeline();
      return;
    }

    startPlaybackTimeline({ target: "all" });
  };

  const isArrangeEditorActive = () => {
    const arrange = get(controlStore).outline.arrange;
    return arrange != null && arrange.editor != undefined;
  };
  const isArrangeFinderActive = () => {
    const arrange = get(controlStore).outline.arrange;
    return arrange != null && arrange.finder != undefined;
  };

  const control = (eventKey: string) => {
    if (isArrangeFinderActive()) {
      inputFinder.control(eventKey);
      return;
    }
    if (isArrangeEditorActive()) {
      inputArrange.control(eventKey);
      return;
    }
    if (isArrangeFinderActive() || isArrangeEditorActive()) return;

    if (isPlayback()) {
      switch (eventKey) {
        case " ":
          togglePlayback();
      }
      return;
    }

    switch (eventKey) {
      case "a": outlineActions.insertChord(); break;
      case "s": outlineActions.insertSection(); break;
      case "m": outlineActions.insertEventMod(); break;
      case "p": outlineActions.insertEventTempo(); break;
      case "j": outlineActions.insertEventTS(); break;
      case "Delete": outlineActions.removeFocusElement(); break;

      case "ArrowUp": outlineActions.moveFocus(-1); break;
      case "ArrowDown": outlineActions.moveFocus(1); break;
      case "ArrowLeft": outlineActions.moveSection(-1); break;
      case "ArrowRight": outlineActions.moveSection(1); break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7": {
        const scaleIndex = Number(eventKey) - 1;
        outlineActions.setDegree(scaleIndex);
      } break;

      case "b": outlineActions.openArrangeEditor(); break;
      case "w": outlineActions.openArrangeFinder(); break;
      case " ": togglePlayback(); break;
    }
  };

  const getHoldCallbacks = (eventKey: string): InputState.Callbacks => {
    if (isArrangeFinderActive()) {
      return inputFinder.getHoldCallbacks(eventKey);
    }
    if (isArrangeEditorActive()) {
      return inputArrange.getHoldCallbacks(eventKey);
    }

    const callbacks: InputState.Callbacks = {};

    const currentControl = get(controlStore);
    const currentData = get(dataStore);
    const currentOutline = currentControl.outline;
    const element = currentData.elements[currentOutline.focus];
    const elementType = element.type;

    callbacks.holdC = () => {
      switch (element.type) {
        case "chord": {
          switch (eventKey) {
            case "ArrowLeft": outlineActions.modSymbol("prev"); break;
            case "ArrowRight": outlineActions.modSymbol("next"); break;
            case "ArrowUp": outlineActions.modSymbol("lower"); break;
            case "ArrowDown": outlineActions.modSymbol("upper"); break;
          }
        } break;
        case "init": {
          switch (eventKey) {
            case "ArrowLeft": outlineActions.initialTS(-1); break;
            case "ArrowRight": outlineActions.initialTS(1); break;
          }
        } break;
      }
    };
    callbacks.holdD = () => {
      switch (elementType) {
        case "init":
          {
            switch (eventKey) {
              case "ArrowUp": outlineActions.initialScaleKey(1); break;
              case "ArrowDown": outlineActions.initialScaleKey(-1); break;
              case "ArrowLeft":
              case "ArrowRight": outlineActions.initialScale(); break;
            }
          }
          break;
        case "modulate":
          {
            switch (eventKey) {
              case "ArrowLeft": outlineActions.eventModKind(-1); break;
              case "ArrowRight": outlineActions.eventModKind(1); break;
              case "ArrowUp": outlineActions.eventModVal(1); break;
              case "ArrowDown": outlineActions.eventModVal(-1); break;
            }
          }
          break;
        case "tempo":
          {
            switch (eventKey) {
              case "ArrowLeft": outlineActions.eventTempoKind(-1); break;
              case "ArrowRight": outlineActions.eventTempoKind(1); break;
              case "ArrowUp": outlineActions.eventTempoVal(1); break;
              case "ArrowDown": outlineActions.eventTempoVal(-1); break;
            }
          }
          break;
        case "ts":
          {
            switch (eventKey) {
              case "ArrowLeft": outlineActions.eventTS(-1); break;
              case "ArrowRight": outlineActions.eventTS(1); break;
            }
          }
          break;
      }
    };
    callbacks.holdF = () => {
      switch (elementType) {
        case "chord":
          {
            switch (eventKey) {
              case "ArrowLeft": outlineActions.modBeat(-1); break;
              case "ArrowRight": outlineActions.modBeat(1); break;
              case "ArrowUp": outlineActions.modRoot(1); break;
              case "ArrowDown": outlineActions.modRoot(-1); break;
            }
          }
          break;
        case "init":
          {
            switch (eventKey) {
              case "ArrowUp": outlineActions.initialTempo(1); break;
              case "ArrowDown": outlineActions.initialTempo(-1); break;
            }
          }
          break;
      }
    };

    callbacks.holdG = () => {
      switch (elementType) {
        case "chord": {
          switch (eventKey) {
            case "ArrowLeft": outlineActions.modEat(-1); break;
            case "ArrowRight": outlineActions.modEat(1); break;
            case "ArrowUp": outlineActions.modOn(1); break;
            case "ArrowDown": outlineActions.modOn(-1); break;
          }
        } break;
      }
    };

    callbacks.holdShift = () => {
      switch (eventKey) {
        case "ArrowUp": outlineActions.moveRange(-1); break;
        case "ArrowDown": outlineActions.moveRange(1); break;
      }
    };

    return callbacks;
  };

  return {
    control,
    getHoldCallbacks,
  };
};
export default useInputOutline;
