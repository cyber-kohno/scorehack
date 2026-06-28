import { get } from "svelte/store";
import createPianoArrangeActions from "../../actions/arrange/piano/piano-arrange-actions";
import createArrangeSelector from "../../service/arrange/arrange-selector";
import { controlStore, dataStore } from "../../store/global-store";
import type InputState from "../../store/state/input-state";

const useInputPianoEditor = () => {
  const pianoActions = createPianoArrangeActions();
  const reducerArrange = createArrangeSelector({
    control: get(controlStore),
    data: get(dataStore),
  });
  const arrange = get(controlStore).outline.arrange;

  const control = (eventKey: string) => {
    if (arrange == null) throw new Error();

    const editor = reducerArrange.getPianoEditor();

    switch (editor.phase) {
      case "edit":
        {
          switch (eventKey) {
            case " ":
              pianoActions.playbackPattern();
              break;
            case "w":
              pianoActions.openFinderFromEditor();
              break;
          }

          const voicingControl = () => {
            switch (eventKey) {
              case "ArrowUp": pianoActions.moveVoicingCursor({ y: -1 }); break;
              case "ArrowDown": pianoActions.moveVoicingCursor({ y: 1 }); break;
              case "ArrowLeft": pianoActions.moveVoicingCursor({ x: -1 }); break;
              case "ArrowRight": pianoActions.moveVoicingCursor({ x: 1 }); break;
              case "a": pianoActions.toggleVoicing(); break;
            }
          };

          const colModeControl = () => {
            switch (eventKey) {
              case "ArrowLeft": pianoActions.moveBackingColCursor(-1); break;
              case "ArrowRight": pianoActions.moveBackingColCursor(1); break;
              case "ArrowDown": pianoActions.toggleBackingPedal(); break;
              case "a": pianoActions.insertBackingCol(); break;
              case "Delete": pianoActions.deleteBackingCol(); break;
              case "1": pianoActions.setBackingColDiv(16); break;
              case "2": pianoActions.setBackingColDiv(8); break;
              case "3": pianoActions.setBackingColDiv(4); break;
              case "4": pianoActions.setBackingColDiv(2); break;
              case "5": pianoActions.setBackingColDiv(1); break;
              case ".": pianoActions.toggleBackingColDot(); break;
              case "r": pianoActions.shiftLayer(); break;
            }
          };

          const recordControl = () => {
            switch (eventKey) {
              case "ArrowDown": pianoActions.moveBackingRecordCursor(-1); break;
              case "ArrowUp": pianoActions.moveBackingRecordCursor(1); break;
              case "a": pianoActions.insertBackingRecord(); break;
              case "Delete": pianoActions.deleteBackingRecord(); break;
              case "r": pianoActions.shiftLayer(); break;
            }
          };

          const notesControl = () => {
            switch (eventKey) {
              case "ArrowDown": pianoActions.moveBackingNoteCursor({ y: -1 }); break;
              case "ArrowUp": pianoActions.moveBackingNoteCursor({ y: 1 }); break;
              case "ArrowLeft": pianoActions.moveBackingNoteCursor({ x: -1 }); break;
              case "ArrowRight": pianoActions.moveBackingNoteCursor({ x: 1 }); break;
              case "a": pianoActions.toggleBackingNote(); break;
              case "r": pianoActions.shiftLayer(); break;
            }
          };

          switch (editor.control) {
            case "voicing":
              voicingControl();
              break;
            case "record":
              recordControl();
              break;
            case "col":
              colModeControl();
              break;
            case "notes":
              notesControl();
              break;
          }
        }
        break;
    }
  };

  const getHoldCallbacks = (eventKey: string): InputState.Callbacks => {
    if (arrange == null) throw new Error();

    const editor = reducerArrange.getPianoEditor();
    const callbacks: InputState.Callbacks = {};

    callbacks.holdShift = () => {
      switch (eventKey) {
        case "Enter":
          pianoActions.applyArrange();
          break;
      }
      if (editor.backing == null) return;

      switch (editor.control) {
        case "voicing":
          if (eventKey === "ArrowDown") pianoActions.shiftControl("col");
          break;
        case "col":
          if (eventKey === "ArrowUp") pianoActions.shiftControl("voicing");
          if (eventKey === "ArrowDown") pianoActions.shiftControl("notes");
          if (eventKey === "ArrowLeft") pianoActions.shiftControl("record");
          break;
        case "record":
          if (eventKey === "ArrowUp") pianoActions.shiftControl("col");
          if (eventKey === "ArrowRight") pianoActions.shiftControl("notes");
          break;
        case "notes":
          if (eventKey === "ArrowUp") pianoActions.shiftControl("col");
          if (eventKey === "ArrowLeft") pianoActions.shiftControl("record");
          break;
      }
    };

    callbacks.holdC = () => {
      if (editor.phase !== "edit" || editor.control !== "notes") return;

      switch (eventKey) {
        case "ArrowUp": pianoActions.increaseBackingNoteVelocity(); break;
        case "ArrowDown": pianoActions.decreaseBackingNoteVelocity(); break;
        case "ArrowLeft": pianoActions.decreaseBackingNoteDelay(); break;
        case "ArrowRight": pianoActions.increaseBackingNoteDelay(); break;
      }
    };

    return callbacks;
  };

  return {
    control,
    getHoldCallbacks,
  };
};

export default useInputPianoEditor;
