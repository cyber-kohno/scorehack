import createMappingActions from "../actions/library/mapping-actions";

const useInputMapping = () => {
    const actions = createMappingActions();

    const control = (eventKey: string, option: { holdD?: boolean } = {}) => {
        if (option.holdD) {
            switch (eventKey) {
                case "ArrowUp":
                    actions.swapRecord(-1);
                    return;
                case "ArrowDown":
                    actions.swapRecord(1);
                    return;
            }
        }

        switch (eventKey) {
            case "ArrowUp":
                actions.moveRecord(-1);
                break;
            case "ArrowDown":
                actions.moveRecord(1);
                break;
            case "ArrowLeft":
                actions.moveColumn(-1);
                break;
            case "ArrowRight":
                actions.moveColumn(1);
                break;
            case "A":
            case "a":
                actions.addRecord();
                break;
            case "W":
            case "w":
                actions.openKeyInput();
                actions.openDisplayInput();
                actions.openSoundInput();
                break;
            case "Delete":
                actions.deleteRecord();
                break;
            case " ":
                actions.previewSound();
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

export default useInputMapping;
