import type useTerminalLogger from "./terminal-logger";

namespace TerminalArgumentReader {
  type ArgNo = 1 | 2 | 3 | 4;
  type Logger = ReturnType<typeof useTerminalLogger>;

  const toArgNo = (index: number): ArgNo => {
    if (index < 0 || index > 3) {
      throw new Error(`Unsupported terminal argument index. [${index}]`);
    }
    return (index + 1) as ArgNo;
  };

  export const readNumber = (
    args: Array<string | undefined>,
    index: number,
    logger: Logger,
    range: { min: number; max: number },
  ): number | null => {
    const argNo = toArgNo(index);
    const raw = args[index];
    const text = logger.validateRequired(raw == null || raw.trim() === "" ? undefined : raw, argNo);
    if (text == null) return null;

    const value = logger.validateNumber(text, argNo);
    if (value == null) return null;

    if (value < range.min || value > range.max) {
      logger.outputError(`The ${argNo} argument must be in range [${range.min}..${range.max}]. [${text}]`);
      return null;
    }

    return value;
  };
}

export default TerminalArgumentReader;
