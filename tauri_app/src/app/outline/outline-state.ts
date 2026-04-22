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
import type { RootStoreToken } from "../../state/root-store";

export const getCurrentOutlineElement = (rootStoreToken: RootStoreToken): OutlineElement => {
  const { getOutlineElement } = createProjectDataActions(rootStoreToken);
  const elementIndex = getOutlineFocusState().focus;
  const element = getOutlineElement(elementIndex);
  if (element == undefined) throw new Error();
  return element;
};

export const getCurrentOutlineInitData = (rootStoreToken: RootStoreToken): OutlineDataInit => {
  const element = getCurrentOutlineElement(rootStoreToken);
  if (element.type !== "init") {
    throw new Error("Current element type does not match the requested outline data.");
  }
  return element.data;
};

export const getCurrentOutlineSectionData = (
  rootStoreToken: RootStoreToken,
): OutlineDataSection => {
  const element = getCurrentOutlineElement(rootStoreToken);
  if (element.type !== "section") {
    throw new Error("Current element type does not match the requested outline data.");
  }
  return element.data;
};

export const getCurrentOutlineChordData = (rootStoreToken: RootStoreToken): OutlineDataChord => {
  const element = getCurrentOutlineElement(rootStoreToken);
  if (element.type !== "chord") {
    throw new Error("Current element type does not match the requested outline data.");
  }
  return element.data;
};

export const getCurrentOutlineTempoData = (rootStoreToken: RootStoreToken): OutlineDataTempo => {
  const element = getCurrentOutlineElement(rootStoreToken);
  if (element.type !== "tempo") {
    throw new Error("Current element type does not match the requested outline data.");
  }
  return element.data;
};

export const getCurrentOutlineModulateData = (
  rootStoreToken: RootStoreToken,
): OutlineDataModulate => {
  const element = getCurrentOutlineElement(rootStoreToken);
  if (element.type !== "modulate") {
    throw new Error("Current element type does not match the requested outline data.");
  }
  return element.data;
};
