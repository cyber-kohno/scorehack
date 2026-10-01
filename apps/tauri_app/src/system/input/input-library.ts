import { get } from "svelte/store";
import createLibraryDrumActions from "../actions/library/library-drum-actions";
import createLibraryGuitarActions from "../actions/library/library-guitar-actions";
import createLibraryActions from "../actions/library/library-actions";
import createLibraryPianoActions from "../actions/library/library-piano-actions";
import createMappingActions from "../actions/library/mapping-actions";
import createTerminalActions from "../actions/terminal/terminal-actions";
import { controlStore, dataStore, libraryStore } from "../store/global-store";

const useInputLibrary = () => {
    const actions = createLibraryActions();
    const drumActions = createLibraryDrumActions();
    const guitarActions = createLibraryGuitarActions();
    const pianoActions = createLibraryPianoActions();
    const mappingActions = createMappingActions();
    const terminalActions = createTerminalActions();

    const getActiveMethod = () => {
        const control = get(controlStore);
        const data = get(dataStore);
        return data.arrange.tracks[control.outline.trackIndex]?.method;
    };

    const isFinderMode = () => {
        return get(libraryStore)?.focus.finder != null;
    };

    const switchToFinder = () => {
        switch (getActiveMethod()) {
            case "piano":
                pianoActions.switchToFinder();
                break;
            case "drum":
                drumActions.switchToFinder();
                break;
            case "guitar":
                guitarActions.switchToFinder();
                break;
        }
    };

    const togglePanel = () => {
        if (isFinderMode()) {
            actions.switchToCondition();
            return;
        }

        switchToFinder();
    };

    const pianoFinderControl = (eventKey: string) => {
        switch (eventKey) {
            case "ArrowLeft": pianoActions.moveFinderVoicing(-1); break;
            case "ArrowRight": pianoActions.moveFinderVoicing(1); break;
            case "ArrowUp": pianoActions.moveFinderBacking(-1); break;
            case "ArrowDown": pianoActions.moveFinderBacking(1); break;
            case "B":
            case "b": pianoActions.openEditor(); break;
            case "E":
            case "e": pianoActions.togglePreset(); break;
            case "M":
            case "m": pianoActions.openMenu(); break;
        }
    };

    const finderControl = (eventKey: string) => {
        switch (getActiveMethod()) {
            case "piano":
                pianoFinderControl(eventKey);
                break;
            case "drum":
                switch (eventKey) {
                    case "ArrowLeft": drumActions.moveFinderPattern(-1); break;
                    case "ArrowRight": drumActions.moveFinderPattern(1); break;
                    case "ArrowUp": drumActions.moveFinderPattern(-3); break;
                    case "ArrowDown": drumActions.moveFinderPattern(3); break;
                    case "B":
                    case "b": drumActions.openEditor(); break;
                    case "E":
                    case "e": drumActions.toggleRegular(); break;
                    case "M":
                    case "m": drumActions.openMenu(); break;
                }
                break;
            case "guitar":
                switch (eventKey) {
                    case "ArrowLeft": guitarActions.moveFinder(-1); break;
                    case "ArrowRight": guitarActions.moveFinder(1); break;
                    case "ArrowUp": guitarActions.moveFinder(-3); break;
                    case "ArrowDown": guitarActions.moveFinder(3); break;
                    case "Enter": guitarActions.applyFinderSelection(); break;
                    case "Backspace": guitarActions.backFinderSelection(); break;
                    case "B":
                    case "b": guitarActions.openEditor(); break;
                    case "E":
                    case "e": guitarActions.toggleRegular(); break;
                }
                break;
        }
    };

    const control = (eventKey: string, option: { shiftKey?: boolean } = {}) => {
        if (option.shiftKey) {
            switch (eventKey) {
                case "M":
                case "m":
                    mappingActions.open();
                    return;
            }
        }

        if (isFinderMode()) {
            finderControl(eventKey);
            switch (eventKey) {
                case "T":
                case "t":
                    terminalActions.open();
                    break;
                case "R":
                case "r":
                    togglePanel();
                    break;
                case "Escape":
                    actions.close();
                    break;
            }
            return;
        }

        switch (eventKey) {
            case "ArrowLeft":
                actions.moveBeat(-1);
                actions.moveEat(-1);
                actions.movePitch(-1);
                actions.moveSymbol(-1);
                actions.moveSymbolTones(-1);
                actions.moveTimeSignature(-1);
                break;
            case "ArrowRight":
                actions.moveBeat(1);
                actions.moveEat(1);
                actions.movePitch(1);
                actions.moveSymbol(1);
                actions.moveSymbolTones(1);
                actions.moveTimeSignature(1);
                break;
            case "ArrowUp":
                actions.moveCondition(-1);
                break;
            case "ArrowDown":
                actions.moveCondition(1);
                break;
            case "T":
            case "t":
                terminalActions.open();
                break;
            case "R":
            case "r":
                togglePanel();
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
