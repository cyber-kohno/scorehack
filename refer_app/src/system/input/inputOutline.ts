import StorePianoEditor from "../store/props/arrange/piano/storePianoEditor";
import type StoreInput from "../store/props/storeInput";
import type StoreOutline from "../store/props/storeOutline";
import useReducerCache from "../store/reducer/reducerCache";
import useReducerOutline from "../store/reducer/reducerOutline";
import useReducerRef from "../store/reducer/reducerRef";
import type { StoreUtil } from "../store/store";
import MusicTheory from "../util/musicTheory";
import PreviewUtil from "../util/preview/previewUtil";
import useInputFinder from "./arrange/finder/inputFinder";
import useInputArrange from "./arrange/inputArrange";

const useInputOutline = (storeUtil: StoreUtil) => {
  const { lastStore, commit } = storeUtil;

  const reducerOutline = useReducerOutline(lastStore);
  const reducerCache = useReducerCache(lastStore);
  const reducerRef = useReducerRef(lastStore);
  const element = reducerOutline.getCurrentElement();
  const inputArrange = useInputArrange(storeUtil);
  const inputFinder = useInputFinder(storeUtil);

  const { startTest, stopTest } = PreviewUtil.useUpdater(storeUtil);

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
          stopTest();
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
          // 初期値ブロックと、最後の1つのセクションは消せない
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
        startTest({ target: "all" });
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
             * キーを半音単位で移動する
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
       * コードブロックのケツのシンコペーションを増減する
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
       * 基準をロックして、範囲指定のフォーカスを移動する
       * @param dir
       */
      const moveRange = (dir: -1 | 1) => {
        // フォーカスが未ロックである場合、現在のフォーカスをロックに設定する
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
