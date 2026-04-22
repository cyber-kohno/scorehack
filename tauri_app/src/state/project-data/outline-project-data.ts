import type { OutlineElement } from "../../domain/outline/outline-types";
import type { RootStoreToken } from "../root-store";
import {
  getOutlineElementState,
  setOutlineElementState,
} from "../session-state/outline-element-store";

export const getOutlineElements = (
  rootStoreToken: RootStoreToken,
): OutlineElement[] => {
  void rootStoreToken;
  return getOutlineElementState();
};

export const getOutlineElement = (
  rootStoreToken: RootStoreToken,
  index: number,
): OutlineElement | undefined => {
  return getOutlineElements(rootStoreToken)[index];
};

export const getOutlineElementCount = (rootStoreToken: RootStoreToken): number => {
  return getOutlineElements(rootStoreToken).length;
};

export const setOutlineElements = (
  rootStoreToken: RootStoreToken,
  elements: OutlineElement[],
): void => {
  void rootStoreToken;
  setOutlineElementState(elements);
};

export const insertOutlineElementAt = (
  rootStoreToken: RootStoreToken,
  index: number,
  element: OutlineElement,
): void => {
  getOutlineElements(rootStoreToken).splice(index, 0, element);
};

export const removeOutlineElementAt = (
  rootStoreToken: RootStoreToken,
  index: number,
): void => {
  getOutlineElements(rootStoreToken).splice(index, 1);
};
