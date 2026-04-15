import StorePianoEditor from "../store/props/arrange/piano/storePianoEditor";
import type StoreInput from "../store/props/storeInput";
import type StoreOutline from "../store/props/storeOutline";
import useReducerCache from "../store/reducer/reducerCache";
import { createOutlineActions } from "../../app/outline/outline-actions";
import { createPlaybackPreviewRouter } from "../../app/playback/playback-preview-router";
import useReducerRef from "../store/reducer/reducerRef";
import type { StoreUtil } from "../store/store";
import MusicTheory from "../../domain/theory/music-theory";
import useInputFinder from "./arrange/finder/inputFinder";
import useInputArrange from "./arrange/inputArrange";

const useInputOutline = (storeUtil: StoreUtil) => {
  const { lastStore, commit } = storeUtil;

  const reducerOutline = createOutlineActions(lastStore);
  const reducerCache = useReducerCache(lastStore);
  const reducerRef = useReducerRef(lastStore);
  const element = reducerOutline.getCurrentElement();
  const inputArrange = useInputArrange(storeUtil);
  const inputFinder = useInputFinder(storeUtil);

  const { startPreview, stopPreview } = createPlaybackPreviewRouter(storeUtil);

  const outline = lastStore.control.outline;
  const arrange = outline.arrange;
  const isPreview = lastStore.preview.timerKeys != null;

  const isArrangeEditorActive = () => {
    return arrange != null && arrange.editor != undefined;
  };
  const isArrangeFinderActive = () => {
    return arrange != null && arrange.finder != undefined;
  };

  const control = (eventKey: string) => {
    const isInit = element.type === "init";
    const isChord = element.type === "chord";

    if (isArrangeFinderActive()) {
      inputFinder.control(eventKey);
      return;
    }
    if (isArrangeEditorActive()) {
      inputArrange.control(eventKey);
      return;
    }
    if (isArrangeFinderActive() || isArrangeEditorActive()) return;

    if (isPreview) {
      switch (eventKey) {
        case " ":
          stopPreview();
      }
      return;
    }

    const moveFocus = (dir: -1 | 1) => {
      outline.focusLock = -1;
      reducerOutline.moveFocus(dir);
      reducerRef.adjustGridScrollXFromOutline();
      reducerRef.adjustOutlineScroll();
      commit();
    };

    const moveSectionFocus = (dir: -1 | 1) => {
      outline.focusLock = -1;
      reducerOutline.moveSectionFocus(dir);
      reducerRef.adjustGridScrollXFromOutline();
      reducerRef.adjustOutlineScroll();
      commit();
    };

    switch (eventKey) {
      case "a":
        {
          if (isInit) break;
          const data: StoreOutline.DataChord = {
            beat: 4,
            eat: 0,
          };
          const element: StoreOutline.Element = {
            type: "chord",
            data,
          };
          reducerOutline.insertElement(element);
          reducerCache.calculate();
          commit();
        }
        break;
      case "s":
        {
          const data: StoreOutline.DataSection = {
            name: "section",
          };
          reducerOutline.insertElement({
            type: "section",
            data,
          });
          reducerCache.calculate();
          commit();
        }
        break;
      case "m":
        {
          if (isInit) break;
          const data: StoreOutline.DataModulate = {
            method: "domm",
            val: 1,
          };
          reducerOutline.insertElement({
            type: "modulate",
            data,
          });
          reducerCache.calculate();
          commit();
        }
        break;
      case "Delete":
        {
          const sectionCnt = lastStore.data.elements.filter(
            (e) => e.type === "section",
          ).length;
          const isLastSection = element.type === "section" && sectionCnt === 1;
          // 蛻晄悄蛟､繝悶Ο繝・け縺ｨ縲∵怙蠕後・1縺､縺ｮ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺ｯ豸医○縺ｪ縺・
          if (element.type === "init" || isLastSection) break;
          reducerOutline.removeFocusElement();
          reducerCache.calculate();
          reducerRef.adjustGridScrollXFromOutline();
          reducerRef.adjustOutlineScroll();
          commit();
        }
        break;

      case "ArrowUp":
        moveFocus(-1);
        break;
      case "ArrowDown":
        moveFocus(1);
        break;
      case "ArrowLeft":
        moveSectionFocus(-1);
        break;
      case "ArrowRight":
        moveSectionFocus(1);
        break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
        {
          // if (isLock) break;
          // const element = reducerOutline.getCurrentElement();
          // if (element.type === 'chord') {
          if (isChord) {
            const chordData: StoreOutline.DataChord = { ...element.data };
            const scaleIndex = Number(eventKey) - 1;
            const diatonic = MusicTheory.getDiatonicDegreeChord(
              "major",
              scaleIndex,
            );
            chordData.degree = diatonic;
            reducerOutline.setChordData(chordData);
            reducerCache.calculate();
            commit();
          }
        }
        break;

      case "b":
        {
          reducerOutline.openArrangeEditor();
          commit();
        }
        break;
      case "w":
        {
          if (isChord) {
            reducerOutline.openArrangeFinder();
            commit();
          }
        }
        break;
      case " ":
        startPreview({ target: "all" });
    }
  };

  const getHoldCallbacks = (eventKey: string): StoreInput.Callbacks => {
    if (isArrangeFinderActive()) {
      // console.log('arrange != null');
      return inputFinder.getHoldCallbacks(eventKey);
    }
    if (isArrangeEditorActive()) {
      // console.log('arrange != null');
      return inputArrange.getHoldCallbacks(eventKey);
    }

    const callbacks: StoreInput.Callbacks = {};

    const elementType = reducerOutline.getCurrentElement().type;

    const elements = lastStore.data.elements;
    const focus = lastStore.control.outline.focus;
    const element = elements[focus];
    callbacks.holdC = () => {
      switch (element.type) {
        case "chord":
          {
            const data = element.data as StoreOutline.DataChord;

            const modSymbol = (dir: "prev" | "next" | "lower" | "upper") => {
              if (data.degree == undefined) return;
              const symbol = data.degree.symbol;
              const symbolProps = MusicTheory.getSymbolProps(symbol);

              let temp: MusicTheory.ChordSymol | undefined = undefined;

              switch (dir) {
                case "prev":
                  {
                    temp = MusicTheory.getSameLevelSymbol(symbol, -1);
                  }
                  break;
                case "next":
                  {
                    temp = MusicTheory.getSameLevelSymbol(symbol, 1);
                  }
                  break;
                case "lower":
                  {
                    temp = symbolProps.lower;
                  }
                  break;
                case "upper":
                  {
                    temp = symbolProps.upper;
                  }
                  break;
              }

              if (temp != undefined) {
                data.degree.symbol = temp;
                reducerCache.calculate();
                commit();
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
             * 繧ｭ繝ｼ繧貞濠髻ｳ蜊倅ｽ阪〒遘ｻ蜍輔☆繧・
             * @param dir
             */
            const modKey = (dir: -1 | 1) => {
              let isBlank = false;
              if (chordData.degree == undefined) {
                const diatonic = MusicTheory.getDiatonicDegreeChord("major", 0);
                chordData.degree = diatonic;
                isBlank = true;
              }
              let temp = MusicTheory.getDegree12Index(chordData.degree);
              if (!isBlank) {
                temp += dir;
              }

              if (isBlank || (temp >= 0 && temp <= 11)) {
                const degree12 = MusicTheory.getDegree12Props(temp, dir === -1);
                chordData.degree = {
                  symbol: chordData.degree.symbol,
                  ...degree12,
                };
                // reducerOutline.setChordData(chordData);
                reducerCache.calculate();
              }
              commit();
            };

            const modBeat = (dir: -1 | 1) => {
              const temp = chordData.beat + dir;
              if (temp >= 1 && temp <= 4) chordData.beat = temp;
              // reducerOutline.setChordData(chordData);
              reducerCache.calculate();
              reducerRef.adjustGridScrollXFromOutline();
              commit();
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
      const data = element.data as StoreOutline.DataChord;

      /**
       * 繧ｳ繝ｼ繝峨ヶ繝ｭ繝・け縺ｮ繧ｱ繝・・繧ｷ繝ｳ繧ｳ繝壹・繧ｷ繝ｧ繝ｳ繧貞｢玲ｸ帙☆繧・
       * @param dir
       */
      const modEat = (dir: -1 | 1) => {
        let temp = data.eat;
        temp += dir;

        if (temp >= -2 && temp <= 2) {
          data.eat = temp;
          reducerOutline.setChordData(data);
          reducerCache.calculate();
          reducerRef.adjustGridScrollXFromOutline();
        }
        commit();
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
       * 蝓ｺ貅悶ｒ繝ｭ繝・け縺励※縲∫ｯ・峇謖・ｮ壹・繝輔か繝ｼ繧ｫ繧ｹ繧堤ｧｻ蜍輔☆繧・
       * @param dir
       */
      const moveRange = (dir: -1 | 1) => {
        // 繝輔か繝ｼ繧ｫ繧ｹ縺梧悴繝ｭ繝・け縺ｧ縺ゅｋ蝣ｴ蜷医∫樟蝨ｨ縺ｮ繝輔か繝ｼ繧ｫ繧ｹ繧偵Ο繝・け縺ｫ險ｭ螳壹☆繧・
        if (outline.focusLock === -1) outline.focusLock = outline.focus;
        reducerOutline.moveFocus(dir);
        reducerRef.adjustGridScrollXFromOutline();
        reducerRef.adjustOutlineScroll();
        commit();
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


