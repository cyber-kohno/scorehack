import type {
  OutlineDataChord,
  OutlineDataInit,
  OutlineDataModulate,
  OutlineDataSection,
  OutlineDataTempo,
  OutlineElement,
} from "../../domain/outline/outline-types";
import { createProjectDataActions } from "../project-data/project-data-actions";
import { getOutlineFocusState } from "../../state/session-state/outline-focus-store";
import type { StoreProps } from "../../system/store/store";

export const getCurrentOutlineElement = (lastStore: StoreProps): OutlineElement => {
  const { getOutlineElement } = createProjectDataActions(lastStore);
  const elementIndex = getOutlineFocusState().focus;
  const element = getOutlineElement(elementIndex);
  if (element == undefined) throw new Error();
  return element;
};

export const getCurrentOutlineInitData = (lastStore: StoreProps): OutlineDataInit => {
  const element = getCurrentOutlineElement(lastStore);
  if (element.type !== "init") {
    throw new Error("Current element type does not match the requested outline data.");
  }
  return element.data;
};

export const getCurrentOutlineSectionData = (
  lastStore: StoreProps,
): OutlineDataSection => {
  const element = getCurrentOutlineElement(lastStore);
  if (element.type !== "section") {
    throw new Error("Current element type does not match the requested outline data.");
  }
  return element.data;
};

export const getCurrentOutlineChordData = (lastStore: StoreProps): OutlineDataChord => {
  const element = getCurrentOutlineElement(lastStore);
  if (element.type !== "chord") {
    throw new Error("Current element type does not match the requested outline data.");
  }
  return element.data;
};

export const getCurrentOutlineTempoData = (lastStore: StoreProps): OutlineDataTempo => {
  const element = getCurrentOutlineElement(lastStore);
  if (element.type !== "tempo") {
    throw new Error("Current element type does not match the requested outline data.");
  }
  return element.data;
};

export const getCurrentOutlineModulateData = (
  lastStore: StoreProps,
): OutlineDataModulate => {
  const element = getCurrentOutlineElement(lastStore);
  if (element.type !== "modulate") {
    throw new Error("Current element type does not match the requested outline data.");
  }
  return element.data;
};
