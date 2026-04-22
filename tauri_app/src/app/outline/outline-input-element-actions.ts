import type {
  OutlineDataChord,
  OutlineDataModulate,
  OutlineDataSection,
  OutlineElement,
} from "../../domain/outline/outline-types";
import { getOutlineElements } from "../../state/project-data/outline-project-data";
import type { RootStoreToken } from "../../state/root-store";
import type { OutlineActions } from "./outline-actions";

export const insertOutlineChordElement = (
  outlineActions: OutlineActions,
) => {
  const data: OutlineDataChord = {
    beat: 4,
    eat: 0,
  };
  const element: OutlineElement = {
    type: "chord",
    data,
  };
  outlineActions.insertElement(element);
};

export const insertOutlineSectionElement = (
  outlineActions: OutlineActions,
) => {
  const data: OutlineDataSection = {
    name: "section",
  };
  outlineActions.insertElement({
    type: "section",
    data,
  });
};

export const insertOutlineModulateElement = (
  outlineActions: OutlineActions,
) => {
  const data: OutlineDataModulate = {
    method: "domm",
    val: 1,
  };
  outlineActions.insertElement({
    type: "modulate",
    data,
  });
};

type RemoveOutlineFocusElementParams = {
  rootStoreToken: RootStoreToken;
  outlineActions: OutlineActions;
  element: OutlineElement;
};

export const removeOutlineFocusElementIfAllowed = ({
  rootStoreToken,
  outlineActions,
  element,
}: RemoveOutlineFocusElementParams) => {
  const sectionCount = getOutlineElements(rootStoreToken).filter(
    (item) => item.type === "section",
  ).length;
  const isLastSection = element.type === "section" && sectionCount === 1;
  if (element.type === "init" || isLastSection) return false;

  outlineActions.removeFocusElement();
  return true;
};
