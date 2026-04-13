import type { OutlineDataChord, OutlineDataInit, OutlineDataSection, OutlineElement } from "./outline-types";

export const createInitialOutlineElements = (): OutlineElement[] => {
  const list: OutlineElement[] = [];
  const initData: OutlineDataInit = {
    ts: { num: 4, den: 4 },
    tempo: 100,
    tonality: {
      key12: 0,
      scale: "major",
    },
  };
  const firstSectionData: OutlineDataSection = {
    name: "section0",
  };

  list.push({ type: "init", data: initData });
  list.push({ type: "section", data: firstSectionData });

  const dataChord = (): OutlineDataChord => ({
    beat: 4,
    eat: 0,
  });

  for (let i = 0; i < 2; i++) {
    list.push({ type: "chord", data: dataChord() });
  }

  return list;
};
