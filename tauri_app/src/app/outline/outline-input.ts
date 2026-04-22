import StorePianoEditor from "../../domain/arrange/piano-editor-store";
import type { InputCallbacks } from "../../state/session-state/input-store";
import { createCacheActions } from "../../app/cache/cache-actions";
import {
  adjustOutlineScroll,
  adjustTimelineScrollXFromOutline,
} from "../../app/outline/outline-scroll";
import { createOutlineActions } from "../../app/outline/outline-actions";
import { createPlaybackActions } from "../../app/playback/playback-actions";
import {
  getOutlineFocusState,
} from "../../state/session-state/outline-focus-store";
import { getOutlineElements } from "../../state/project-data/outline-project-data";
import { isPlaybackActive } from "../../state/ui-state/playback-ui-store";
import type { CommitContext } from "../../state/root-store";
import type {
  OutlineDataChord,
} from "../../domain/outline/outline-types";
import useInputFinder from "../arrange/finder/finder-input";
import useInputArrange from "../arrange/arrange-input";
import {
  isOutlineArrangeEditorActive,
  isOutlineArrangeFinderActive,
  isOutlineArrangeInputActive,
  moveOutlineInputFocus,
  moveOutlineInputRangeFocus,
  moveOutlineInputSectionFocus,
} from "./outline-input-focus-actions";
import {
  insertOutlineChordElement,
  insertOutlineModulateElement,
  insertOutlineSectionElement,
  removeOutlineFocusElementIfAllowed,
} from "./outline-input-element-actions";
import {
  modOutlineChordBeat,
  modOutlineChordEat,
  modOutlineChordKey,
  modOutlineChordSymbol,
  setOutlineChordDegreeFromScaleIndex,
} from "./outline-input-chord-actions";

const useInputOutline = (commitContext: CommitContext) => {
  const { lastStore: rootStoreToken, commit } = commitContext;

  const reducerOutline = createOutlineActions(rootStoreToken);
  const { recalculate } = createCacheActions(rootStoreToken);
  const element = reducerOutline.getCurrentElement();
  const inputArrange = useInputArrange(commitContext);
  const inputFinder = useInputFinder(commitContext);

  const { startPreview, stopPreview } = createPlaybackActions(commitContext);

  const isPreview = isPlaybackActive();

  const commitOutlineChange = () => {
    commit();
  };

  const commitAfterOutlineScroll = () => {
    adjustTimelineScrollXFromOutline(rootStoreToken);
    adjustOutlineScroll(rootStoreToken);
    commit();
  };

  const commitAfterRecalculate = () => {
    recalculate();
    commit();
  };

  const commitAfterRecalculateAndOutlineScroll = () => {
    recalculate();
    adjustTimelineScrollXFromOutline(rootStoreToken);
    adjustOutlineScroll(rootStoreToken);
    commit();
  };

  const control = (eventKey: string) => {
    const isInit = element.type === "init";
    const isChord = element.type === "chord";

    if (isOutlineArrangeFinderActive()) {
      inputFinder.control(eventKey);
      return;
    }
    if (isOutlineArrangeEditorActive()) {
      inputArrange.control(eventKey);
      return;
    }
    if (isOutlineArrangeInputActive()) return;

    if (isPreview) {
      switch (eventKey) {
        case " ":
          stopPreview();
      }
      return;
    }

    switch (eventKey) {
      case "a":
        {
          if (isInit) break;
          insertOutlineChordElement(reducerOutline);
          commitAfterRecalculate();
        }
        break;
      case "s":
        {
          insertOutlineSectionElement(reducerOutline);
          commitAfterRecalculate();
        }
        break;
      case "m":
        {
          if (isInit) break;
          insertOutlineModulateElement(reducerOutline);
          commitAfterRecalculate();
        }
        break;
      case "Delete":
        {
          const removed = removeOutlineFocusElementIfAllowed({
            rootStoreToken,
            outlineActions: reducerOutline,
            element,
          });
          if (removed) commitAfterRecalculateAndOutlineScroll();
        }
        break;

      case "ArrowUp":
        moveOutlineInputFocus({
          rootStoreToken,
          dir: -1,
          onMoved: commitAfterOutlineScroll,
        });
        break;
      case "ArrowDown":
        moveOutlineInputFocus({
          rootStoreToken,
          dir: 1,
          onMoved: commitAfterOutlineScroll,
        });
        break;
      case "ArrowLeft":
        moveOutlineInputSectionFocus({
          rootStoreToken,
          dir: -1,
          onMoved: commitAfterOutlineScroll,
        });
        break;
      case "ArrowRight":
        moveOutlineInputSectionFocus({
          rootStoreToken,
          dir: 1,
          onMoved: commitAfterOutlineScroll,
        });
        break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
        {
          if (isChord) {
            const scaleIndex = Number(eventKey) - 1;
            setOutlineChordDegreeFromScaleIndex(
              reducerOutline,
              element.data,
              scaleIndex,
            );
            commitAfterRecalculate();
          }
        }
        break;

      case "b":
        {
          reducerOutline.openArrangeEditor();
          commitOutlineChange();
        }
        break;
      case "w":
        {
          if (isChord) {
            reducerOutline.openArrangeFinder();
            commitOutlineChange();
          }
        }
        break;
      case " ":
        startPreview({ target: "all" });
    }
  };

  const getHoldCallbacks = (eventKey: string): InputCallbacks => {
    if (isOutlineArrangeFinderActive()) {
      // console.log('arrange != null');
      return inputFinder.getHoldCallbacks(eventKey);
    }
    if (isOutlineArrangeEditorActive()) {
      // console.log('arrange != null');
      return inputArrange.getHoldCallbacks(eventKey);
    }

    const callbacks: InputCallbacks = {};

    const elementType = reducerOutline.getCurrentElement().type;

    const elements = getOutlineElements(rootStoreToken);
    const focus = getOutlineFocusState().focus;
    const element = elements[focus];
    callbacks.holdC = () => {
      switch (element.type) {
        case "chord":
          {
            const data = element.data as OutlineDataChord;

            const modSymbol = (dir: "prev" | "next" | "lower" | "upper") => {
              const changed = modOutlineChordSymbol(data, dir);
              if (changed) {
                commitAfterRecalculate();
              }
            };
            switch (eventKey) {
              case "ArrowLeft":
                {
                  modSymbol("prev");
                }
                break;
              case "ArrowRight":
                {
                  modSymbol("next");
                }
                break;
              case "ArrowUp":
                {
                  modSymbol("lower");
                }
                break;
              case "ArrowDown":
                {
                  modSymbol("upper");
                }
                break;
            }
          }
          break;
      }
    };
    callbacks.holdF = () => {
      switch (elementType) {
        case "chord":
          {
            const chordData = reducerOutline.getCurrentChordData();

            /**
             * 郢ｧ・ｭ郢晢ｽｼ郢ｧ雋樊ｿ鬮ｻ・ｳ陷雁・ｽｽ髦ｪ縲帝§・ｻ陷崎ｼ披・郢ｧ繝ｻ
             * @param dir
             */
            const modKey = (dir: -1 | 1) => {
              const changed = modOutlineChordKey(chordData, dir);
              if (changed) {
                recalculate();
              }
              commitOutlineChange();
            };

            const modBeat = (dir: -1 | 1) => {
              const changed = modOutlineChordBeat(chordData, dir);
              if (changed) {
                recalculate();
                commitAfterOutlineScroll();
                return;
              }
              commitOutlineChange();
            };
            switch (eventKey) {
              case "ArrowLeft":
                modBeat(-1);
                break;
              case "ArrowRight":
                modBeat(1);
                break;
              case "ArrowUp":
                modKey(1);
                break;
              case "ArrowDown":
                modKey(-1);
                break;
            }
          }
          break;
      }
    };

    callbacks.holdG = () => {
      const data = element.data as OutlineDataChord;

      /**
       * 郢ｧ・ｳ郢晢ｽｼ郢晏ｳｨ繝ｶ郢晢ｽｭ郢昴・縺醍ｸｺ・ｮ郢ｧ・ｱ郢昴・繝ｻ郢ｧ・ｷ郢晢ｽｳ郢ｧ・ｳ郢晏｣ｹ繝ｻ郢ｧ・ｷ郢晢ｽｧ郢晢ｽｳ郢ｧ雋橸ｽ｢邇ｲ・ｸ蟶吮・郢ｧ繝ｻ
       * @param dir
       */
      const modEat = (dir: -1 | 1) => {
        const changed = modOutlineChordEat(data, dir);
        if (changed) {
          reducerOutline.setChordData(data);
          recalculate();
          adjustTimelineScrollXFromOutline(rootStoreToken);
        }
        commitOutlineChange();
      };
      switch (eventKey) {
        case "ArrowLeft":
          modEat(-1);
          break;
        case "ArrowRight":
          modEat(1);
          break;
      }
    };

    callbacks.holdShift = () => {
      /**
       * 陜難ｽｺ雋・じ・堤ｹ晢ｽｭ郢昴・縺醍ｸｺ蜉ｱ窶ｻ邵ｲ竏ｫ・ｯ繝ｻ蟲・ｬ悶・・ｮ螢ｹ繝ｻ郢晁ｼ斐°郢晢ｽｼ郢ｧ・ｫ郢ｧ・ｹ郢ｧ蝣､・ｧ・ｻ陷崎ｼ披・郢ｧ繝ｻ
       * @param dir
       */
      const moveRange = (dir: -1 | 1) => {
        moveOutlineInputRangeFocus({
          rootStoreToken,
          dir,
          onMoved: commitAfterOutlineScroll,
        });
      };
      switch (eventKey) {
        case "ArrowUp":
          moveRange(-1);
          break;
        case "ArrowDown":
          moveRange(1);
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
export default useInputOutline;














