import type TerminalCommand from "./terminal-command";

namespace ArgumentRegulationFactory {
  export type Regulation = Pick<TerminalCommand.Arg, "overview" | "getCandidate" | "isAccept">;

  export const createDummyReg = (): Regulation => ({
    overview: "dummy",
    isAccept: () => true,
  });

  export const createNumberReg = (min: number, max: number): Regulation => ({
    overview: `number [${min}..${max}]`,
    isAccept: (value) => {
      if (value.trim() === "") return false;

      const num = Number(value);
      if (!Number.isFinite(num)) return false;
      return min <= num && num <= max;
    },
  });

  export const createUniqueNameReg = (getNames: () => string[]): Regulation => ({
    overview: "unique name",
    isAccept: (value) => {
      const name = value.trim();
      return name !== "" && !getNames().includes(name);
    },
  });

  export const createExistingNameReg = (getNames: () => string[]): Regulation => ({
    overview: "existing name",
    getCandidate: getNames,
    isAccept: (value) => getNames().includes(value),
  });
}

export default ArgumentRegulationFactory;
