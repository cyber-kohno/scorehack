import FloatingTextInput from "../service/common/floating-text-input-controller";

const VALID_TEXT = /^[a-zA-Z0-9 _'.,#-]$/;

const useInputFloatingTextInput = () => {
    const control = (eventKey: string, option?: { shiftKey?: boolean }) => {
        switch (eventKey) {
            case "Enter":
                FloatingTextInput.apply();
                return;
            case "Escape":
                FloatingTextInput.close();
                return;
            case "Backspace":
                FloatingTextInput.backspace();
                return;
            case "Delete":
                FloatingTextInput.deleteForward();
                return;
            case "ArrowLeft":
                if (option?.shiftKey) {
                    FloatingTextInput.navigate(-1);
                    return;
                }
                FloatingTextInput.moveCursor(-1);
                return;
            case "ArrowRight":
                if (option?.shiftKey) {
                    FloatingTextInput.navigate(1);
                    return;
                }
                FloatingTextInput.moveCursor(1);
                return;
        }

        if (VALID_TEXT.test(eventKey)) {
            FloatingTextInput.insert(eventKey);
        }
    };

    return {
        control,
    };
};

export default useInputFloatingTextInput;
