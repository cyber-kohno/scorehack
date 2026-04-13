import type StoreArrange from "./arrange/storeArrange";
import type {
  OutlineDataChord,
  OutlineDataInit,
  OutlineDataModulate,
  OutlineDataSection,
  OutlineDataTS,
  OutlineDataTempo,
  OutlineElement,
  OutlineElementType,
  OutlineKeyChord,
  OutlineModulateMethod,
  OutlineTempoMethod,
  OutlineTempoRelation,
} from "../../../domain/outline/outline-types";
import {
  OUTLINE_DOMM_VALUES,
  OUTLINE_MARGIN_HEAD,
  OUTLINE_MODULATE_METHODS,
  OUTLINE_TEMPO_METHODS,
} from "../../../domain/outline/outline-types";
import { createInitialOutlineElements } from "../../../domain/outline/create-initial-outline-elements";

namespace StoreOutline {
  export type Props = {
    focus: number;
    focusLock: number;
    trackIndex: number;
    arrange: null | StoreArrange.EditorProps;
  };

  export const INITIAL: Props = {
    focus: 1,
    focusLock: -1,
    trackIndex: -1,
    arrange: null,
  };

  export type ElementType = OutlineElementType;
  export type DataInit = OutlineDataInit;
  export type DataSection = OutlineDataSection;
  export interface DataChord extends OutlineDataChord {}
  export interface KeyChord extends OutlineKeyChord {}
  export type DataModulate = OutlineDataModulate;
  export type ModulateMedhod = OutlineModulateMethod;
  export const ModulateMedhods = OUTLINE_MODULATE_METHODS;
  export const DommVals = OUTLINE_DOMM_VALUES;
  export type TempoRelation = OutlineTempoRelation;
  export type DataTempo = OutlineDataTempo;
  export const TempoMedhods = OUTLINE_TEMPO_METHODS;
  export type TempoMedhod = OutlineTempoMethod;
  export type DataTS = OutlineDataTS;
  export type Element = OutlineElement;
  export const getInitialElements = createInitialOutlineElements;
  export const MARGIN_HEAD = OUTLINE_MARGIN_HEAD;
}

export default StoreOutline;
