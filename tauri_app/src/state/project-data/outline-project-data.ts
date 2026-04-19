import type { OutlineElement } from "../../domain/outline/outline-types";
import type { StoreProps } from "../../system/store/store";
import {
  getOutlineElementState,
  setOutlineElementState,
} from "../session-state/outline-element-store";

export const getOutlineElements = (lastStore: StoreProps): OutlineElement[] => {
  return getOutlineElementState();
};

export const getOutlineElement = (
  lastStore: StoreProps,
  index: number,
): OutlineElement | undefined => {
  return getOutlineElements(lastStore)[index];
};

export const getOutlineElementCount = (lastStore: StoreProps): number => {
  return getOutlineElements(lastStore).length;
};

export const setOutlineElements = (
  lastStore: StoreProps,
  elements: OutlineElement[],
): void => {
  setOutlineElementState(elements);
};

export const insertOutlineElementAt = (
  lastStore: StoreProps,
  index: number,
  element: OutlineElement,
): void => {
  getOutlineElements(lastStore).splice(index, 0, element);
};

export const removeOutlineElementAt = (
  lastStore: StoreProps,
  index: number,
): void => {
  getOutlineElements(lastStore).splice(index, 1);
};
