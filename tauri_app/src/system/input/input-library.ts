import createLibraryActions from "../actions/library/library-actions";
import createMappingActions from "../actions/library/mapping-actions";
import createTerminalActions from "../actions/terminal/terminal-actions";

const useInputLibrary = () => {
    const actions = createLibraryActions();
    const mappingActions = createMappingActions();
    const terminalActions = createTerminalActions();

    const control = (eventKey: string, option: { shiftKey?: boolean } = {}) => {
        if (option.shiftKey) {
            switch (eventKey) {
                case "ArrowLeft":
                    actions.switchToCondition();
                    return;
                case "ArrowRight":
                    actions.switchToFinder();
                    return;
                case "M":
                case "m":
                    mappingActions.open();
                    return;
            }
        }

        switch (eventKey) {
            case "ArrowLeft":
                actions.moveFinderVoicing(-1);
                actions.moveBeat(-1);
                actions.moveEat(-1);
                actions.movePitch(-1);
                actions.moveSymbol(-1);
                actions.moveSymbolTones(-1);
                actions.moveTimeSignature(-1);
                break;
            case "ArrowRight":
                actions.moveFinderVoicing(1);
                actions.moveBeat(1);
                actions.moveEat(1);
                actions.movePitch(1);
                actions.moveSymbol(1);
                actions.moveSymbolTones(1);
                actions.moveTimeSignature(1);
                break;
            case "ArrowUp":
                actions.moveFinderBacking(-1);
                actions.moveCondition(-1);
                break;
            case "ArrowDown":
                actions.moveFinderBacking(1);
                actions.moveCondition(1);
                break;
            case "B":
            case "b":
                actions.openPianoEditor();
                break;
            case "E":
            case "e":
                actions.togglePreset();
                break;
            case "M":
            case "m":
                actions.openMenu();
                break;
            case "T":
            case "t":
                terminalActions.open();
                break;
            case "Escape":
                actions.close();
                break;
        }
    };

    return {
        control,
    };
};

export default useInputLibrary;
