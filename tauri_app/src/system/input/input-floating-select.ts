import FloatingSelect from "../service/common/floating-select-controller";

const VALID_TEXT = /^[a-zA-Z0-9 _'.,#-]$/;

const useInputFloatingSelect = () => {
    const control = (eventKey: string) => {
        switch (eventKey) {
            case "Enter":
                FloatingSelect.apply();
                return;
            case "Escape":
                FloatingSelect.close();
                return;
            case "Backspace":
                FloatingSelect.backspace();
                return;
            case "Delete":
                FloatingSelect.deleteForward();
                return;
            case "ArrowLeft":
                FloatingSelect.moveCursor(-1);
                return;
            case "ArrowRight":
                FloatingSelect.moveCursor(1);
                return;
            case "ArrowUp":
                FloatingSelect.moveFocus(-1);
                return;
            case "ArrowDown":
                FloatingSelect.moveFocus(1);
                return;
        }

        if (VALID_TEXT.test(eventKey)) {
            FloatingSelect.insert(eventKey);
        }
    };

    return {
        control,
    };
};

export default useInputFloatingSelect;
