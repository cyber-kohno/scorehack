import type StoreTerminal from "../../props/storeTerminal"

const useTerminalLogger = (terminal: StoreTerminal.Props) => {

    const backupCommand = () => {
        terminal.outputs.push({
            type: 'record',
            record: {
                attr: 'backup',
                texts: [{ str: `$${terminal.target}>${terminal.command}` }]
            }
        });
    }

    const undefinedFunction = (funcKey: string) => {
        terminal.outputs.push({
            type: 'record',
            record: {
                attr: 'error',
                texts: [
                    { str: '[' }, { str: funcKey, highlight: 'word' }, { str: ']' },
                    { str: ' command not found.' }
                ]
            }
        });
    }

    const getNumberName = (argNo: 1 | 2 | 3) => {
        switch (argNo) {
            case 1: return 'first';
            case 2: return 'sectond';
            case 3: return 'third';
        }
    }

    const validateRequired = (str: string | undefined, argNo: 1 | 2 | 3) => {
        if (str == undefined) {
            terminal.outputs.push({
                type: 'record',
                record: {
                    attr: 'error',
                    texts: [
                        { str: `The ${getNumberName(argNo)} argument is not specified.` }
                    ]
                }
            });
            return null;
        }
        return str;
    }
    const validateNumber = (numStr: string, argNo: 1 | 2 | 3) => {
        const targetNum = Number(numStr);
        if (Number.isNaN(targetNum)) {
            terminal.outputs.push({
                type: 'record',
                record: {
                    attr: 'error',
                    texts: [
                        { str: `The ${getNumberName(argNo)} argument must be a number. [${numStr}]` }
                    ]
                }
            });
            return null;
        }
        return targetNum;
    }

    const outputInfo = (message: string) => {
        terminal.outputs.push({
            type: 'record',
            record: {
                attr: 'info',
                texts: [
                    { str: message }
                ]
            }
        });
    }
    const outputError = (message: string) => {
        terminal.outputs.push({
            type: 'record',
            record: {
                attr: 'error',
                texts: [
                    { str: message }
                ]
            }
        });
    }

    return {
        backupCommand,
        undefinedFunction,
        validateRequired,
        validateNumber,
        outputInfo,
        outputError
    };
};
export default useTerminalLogger;