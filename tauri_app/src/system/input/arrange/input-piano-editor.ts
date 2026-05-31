import { get } from "svelte/store";
import Layout from "../../layout/layout-constant";
import PianoBackingState from "../../store/state/data/arrange/piano/piano-backing-state";
import type InputState from "../../store/state/input-state";
import createArrangeSelector from "../../service/arrange/arrange-selector";
import useScrollService from "../../service/common/scroll-service";
import { controlStore, dataStore } from "../../store/global-store";
import createPianoArrangeActions from "../../actions/arrange/piano/piano-arrange-actions";
import startPlaybackPianoEditor from "../../service/playback/arrange/start-playback-piano-editor";

const useInputPianoEditor = () => {

  const pianoActions = createPianoArrangeActions();
  const reducerArrange = createArrangeSelector({ control: get(controlStore), data: get(dataStore) });
  const reducerRef = useScrollService();
  const controlStoreValue = get(controlStore);
  const outline = controlStoreValue.outline;
  const arrange = outline.arrange;
  const updateControl = ()=> controlStore.set({...controlStoreValue});

  const updateNotePosition = (
    item: string,
    updater: (note: PianoBackingState.NoteItem) => PianoBackingState.NoteItem,
  ) => {
    return PianoBackingState.formatNoteItem(
      updater(PianoBackingState.convNotesInfo(item)),
    );
  };

  const control = (eventKey: string) => {
    if (arrange == null) throw new Error();

    const editor = reducerArrange.getPianoEditor();

    switch (editor.phase) {
      case "edit":
        {
          switch (eventKey) {
            case " ":
              {
                startPlaybackPianoEditor();
              }
              break;
            case "w":
              {
                pianoActions.openFinderFromEditor();
              }
              break;
          }

          /**
           * ボイシング選択時の制御を定義
           */
          const voicingControl = () => {
            switch (eventKey) {
              case "ArrowUp": pianoActions.moveVoicingCursor({ y: -1 }); break;
              case "ArrowDown": pianoActions.moveVoicingCursor({ y: 1 }); break;
              case "ArrowLeft": pianoActions.moveVoicingCursor({ x: -1 }); break;
              case "ArrowRight": pianoActions.moveVoicingCursor({ x: 1 }); break;
              case "a": pianoActions.toggleVoicing(); break;
              case "d":
                {
                  // const name = TonalityTheory.getKey12FullName(struct.key12 +  voicing.cursorX + struct.carryForwardOctave);

                  // const instrumentName = store.arrange.layers[outline.layerIndex].inst;
                  // const sf = store.instCaches.find(sf => sf.instrumentName === instrumentName);
                  // if (sf == undefined) throw new Error('sfがundefinedであってはならない。');
                  // sf.player.play(name, 0, { gain: 10, duration: 1 });
                  // console.log(name);
                }
                break;
            }
          };

          /**
           * カラムモードの制御
           */
          const colModeControl = () => {
            const backing = editor.backing;
            if (backing == null) throw new Error();

            const cols = backing.layers[backing.layerIndex].cols;
            const layer = backing.layers[backing.layerIndex];
            const isLimit = () => {
              return cols.length > Layout.arrange.piano.BACKING_COL_MAX;
            };

            const createInitialCol = (): PianoBackingState.Col => {
              let div = 1;
              if (backing.cursorX >= 0) {
                const len = layer.cols[backing.cursorX];
                div = len.div;
              }
              return {
                div,
                tuplets: 1,
                pedal: 0,
              };
            };

            const modDiv = (div: number) => {
              if (backing.cursorX === -1) return;
              const col = cols[backing.cursorX];
              col.div = div / 4;
              updateControl();
            };
            /**
             * ペダルの切り替えをする
             */
            const pedalChange = () => {
              const index = backing.cursorX;
              if (index === -1) return;
              const col = cols[index];
              let prevState = 0;
              if (index >= 1) prevState = cols[index - 1].pedal;
              switch (col.pedal) {
                case 0:
                  {
                    for (let i = index; i < cols.length; i++) {
                      if (cols[i].pedal === 1) break;
                      cols[i].pedal = 1;
                    }
                  }
                  break;
                case 1:
                  {
                    if (prevState === 1) {
                      col.pedal = 2;
                    } else {
                      for (let i = index; i < cols.length; i++) {
                        cols[i].pedal = 0;
                      }
                    }
                  }
                  break;
                case 2:
                  {
                    for (let i = index; i < cols.length; i++) {
                      cols[i].pedal = 0;
                    }
                  }
                  break;
              }
              updateControl();
            };
            const toggleDot = () => {
              if (backing.cursorX === -1) return;
              const col = cols[backing.cursorX];
              if (col.div >= 4) return;
              switch (col.dot) {
                case undefined:
                  col.dot = 1;
                  break;
                case 1:
                  col.dot = undefined;
                  break;
              }
              // console.log(col.dot);
              updateControl();
            };

            switch (eventKey) {
              case "ArrowLeft":
                {
                  if (backing.cursorX > 0) {
                    backing.cursorX--;
                    updateControl();
                    reducerRef.adjustPEBScrollCol();
                  }
                }
                break;
              case "ArrowRight":
                {
                  if (backing.cursorX < cols.length - 1) {
                    backing.cursorX++;
                    updateControl();
                    reducerRef.adjustPEBScrollCol();
                  }
                }
                break;
              case "ArrowDown":
                {
                  pedalChange();
                }
                break;
              case "a":
                {
                  if (!isLimit()) {
                    cols.splice(backing.cursorX, 0, createInitialCol());
                    layer.items.forEach((item, i) => {
                      const note = PianoBackingState.convNotesInfo(item);
                      if (backing.cursorX < note.colIndex) {
                        layer.items[i] = updateNotePosition(item, (note) => ({
                          ...note,
                          colIndex: note.colIndex + 1,
                        }));
                      }
                    });
                    updateControl();
                  }
                }
                break;
              case "Delete":
                {
                  if (backing.cursorX !== -1) {
                    for (let i = layer.items.length - 1; i >= 0; i--) {
                      const item = layer.items[i];
                      const note = PianoBackingState.convNotesInfo(item);
                      // console.log(`r, c = ${r}, ${c}`);
                      if (backing.cursorX === note.colIndex) {
                        layer.items.splice(i, 1);
                      }
                    }
                    layer.items.forEach((item, i) => {
                      const note = PianoBackingState.convNotesInfo(item);
                      if (backing.cursorX < note.colIndex) {
                        layer.items[i] = updateNotePosition(item, (note) => ({
                          ...note,
                          colIndex: note.colIndex - 1,
                        }));
                      }
                    });

                    cols.splice(backing.cursorX, 1);
                    if (backing.cursorX > 0) backing.cursorX--;
                    if (cols.length === 0) backing.cursorX = -1;
                    updateControl();
                  }
                }
                break;
              case "1":
                modDiv(16);
                break;
              case "2":
                modDiv(8);
                break;
              case "3":
                modDiv(4);
                break;
              case "4":
                modDiv(2);
                break;
              case "5":
                modDiv(1);
                break;
              case ".":
                toggleDot();
                break;
              case "r":
                {
                  pianoActions.shiftLayer();
                }
                break;
            }
          };

          const recordControl = () => {
            const backing = editor.backing;
            if (backing == null) throw new Error();

            const layers = backing.layers;

            switch (eventKey) {
              case "ArrowDown":
                {
                  if (backing.cursorY > 0) {
                    backing.cursorY--;
                    updateControl();
                  }
                }
                break;
              case "ArrowUp":
                {
                  if (backing.cursorY < backing.recordNum - 1) {
                    backing.cursorY++;
                    updateControl();
                  }
                }
                break;
              case "a":
                {
                  if (
                    backing.recordNum < Layout.arrange.piano.BACKING_RECORD_MAX
                  ) {
                    backing.recordNum++;
                    if (backing.recordNum === 1) backing.cursorY = 0;
                    else {
                      layers.forEach((l) => {
                        l.items.forEach((item, i) => {
                          const note = PianoBackingState.convNotesInfo(item);
                          // console.log(`r, c = ${r}, ${c}`);
                          if (backing.cursorY < note.recordIndex) {
                            l.items[i] = updateNotePosition(item, (note) => ({
                              ...note,
                              recordIndex: note.recordIndex + 1,
                            }));
                          }
                        });
                      });
                    }
                    updateControl();
                  }
                }
                break;
              case "Delete":
                {
                  if (backing.recordNum >= 1) {
                    layers.forEach((l) => {
                      for (let i = l.items.length - 1; i >= 0; i--) {
                        const item = l.items[i];
                        const note = PianoBackingState.convNotesInfo(item);
                        // console.log(`r, c = ${r}, ${c}`);
                        if (backing.cursorY === note.recordIndex) {
                          l.items.splice(i, 1);
                        }
                      }
                      l.items.forEach((item, i) => {
                        const note = PianoBackingState.convNotesInfo(item);
                        if (backing.cursorY < note.recordIndex) {
                          l.items[i] = updateNotePosition(item, (note) => ({
                            ...note,
                            recordIndex: note.recordIndex - 1,
                          }));
                        }
                      });
                    });

                    backing.recordNum--;
                    if (backing.recordNum === 0) backing.cursorY = -1;
                    if (backing.cursorY > 0) backing.cursorY--;
                    updateControl();
                  }
                }
                break;
              case "r":
                {
                  pianoActions.shiftLayer();
                }
                break;
            }
          };

          const notesControl = () => {
            const backing = editor.backing;
            if (backing == null) throw new Error();
            const layer = backing.layers[backing.layerIndex];

            const adjustRange = () => {
              if (backing.cursorX < 0) backing.cursorX = 0;
              if (backing.cursorY < 0) backing.cursorY = 0;
              if (backing.cursorX > layer.cols.length - 1)
                backing.cursorX = layer.cols.length - 1;
              if (backing.cursorY > backing.recordNum - 1)
                backing.cursorY = backing.recordNum - 1;
            };

            switch (eventKey) {
              case "ArrowDown":
                {
                  backing.cursorY--;
                  adjustRange();
                  updateControl();
                }
                break;
              case "ArrowUp":
                {
                  backing.cursorY++;
                  adjustRange();
                  updateControl();
                }
                break;
              case "ArrowLeft":
                {
                  backing.cursorX--;
                  adjustRange();
                  updateControl();
                  reducerRef.adjustPEBScrollCol();
                }
                break;
              case "ArrowRight":
                {
                  backing.cursorX++;
                  adjustRange();
                  updateControl();
                  reducerRef.adjustPEBScrollCol();
                }
                break;
              case "a":
                {
                  if (backing.cursorX === -1 || backing.cursorY === -1) {
                    // store.message.confirm = {
                    //     msgLines: [
                    //         'This point cannot be selected.',
                    //         ''
                    //     ],
                    //     width: 380,
                    //     buttons: [
                    //         {
                    //             name: 'ok', width: 180, shortCutKey: 'Enter', callback: () => { }
                    //         }
                    //     ]
                    // }
                    // commit();
                    break;
                  }
                  const key = `${backing.cursorX}.${backing.cursorY}`;
                  if (
                    !PianoBackingState.convRemoveOptionNotes(
                      layer.items
                    ).includes(key)
                  ) {
                    layer.items.push(key);
                  } else {
                    const pos = PianoBackingState.convRemoveOptionNotes(
                      layer.items
                    ).findIndex((i) => i === key);
                    layer.items.splice(pos, 1);
                  }
                  updateControl();
                }
                break;

              case "r":
                {
                  pianoActions.shiftLayer();
                }
                break;
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
          {
            if (eventKey === "ArrowDown") pianoActions.shiftControl("col");
          }
          break;
        case "col":
          {
            if (eventKey === "ArrowUp") pianoActions.shiftControl("voicing");
            if (eventKey === "ArrowDown") pianoActions.shiftControl("notes");
            if (eventKey === "ArrowLeft") pianoActions.shiftControl("record");
          }
          break;
        case "record":
          {
            if (eventKey === "ArrowUp") pianoActions.shiftControl("col");
            if (eventKey === "ArrowRight") pianoActions.shiftControl("notes");
          }
          break;
        case "notes":
          {
            if (eventKey === "ArrowUp") pianoActions.shiftControl("col");
            if (eventKey === "ArrowLeft") pianoActions.shiftControl("record");
          }
          break;
      }
    };

    callbacks.holdC = () => {
      if (editor.phase !== "edit" || editor.control !== "notes") return;
      const backing = editor.backing;
      if (backing == null) return;

      const layer = backing.layers[backing.layerIndex];
      const itemIndex = layer.items.findIndex((item) => {
        const note = PianoBackingState.convNotesInfo(item);
        return (
          note.colIndex === backing.cursorX &&
          note.recordIndex === backing.cursorY
        );
      });
      if (itemIndex === -1) return;

      const modifyNote = (
        modifier: (note: PianoBackingState.NoteItem) => PianoBackingState.NoteItem,
      ) => {
        const item = layer.items[itemIndex];
        layer.items[itemIndex] = PianoBackingState.formatNoteItem(
          modifier(PianoBackingState.convNotesInfo(item)),
        );
        updateControl();
      };

      switch (eventKey) {
        case "ArrowUp":
          modifyNote((note) => ({
            ...note,
            velocity: Math.min(20, note.velocity + 1),
          }));
          break;
        case "ArrowDown":
          modifyNote((note) => ({
            ...note,
            velocity: Math.max(1, note.velocity - 1),
          }));
          break;
        case "ArrowLeft":
          modifyNote((note) => ({
            ...note,
            delay: Math.max(-3, note.delay - 1),
          }));
          break;
        case "ArrowRight":
          modifyNote((note) => ({
            ...note,
            delay: Math.min(3, note.delay + 1),
          }));
          break;
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
