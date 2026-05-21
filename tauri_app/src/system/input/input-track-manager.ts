import createTrackManagerActions from "../actions/track/track-manager-actions";

const useInputTrackManager = () => {
    const actions = createTrackManagerActions();

    const control = (eventKey: string) => {
        switch (eventKey) {
            case "ArrowUp":
                actions.move(-1);
                break;
            case "ArrowDown":
                actions.move(1);
                break;
            case "Enter":
                actions.activate();
                break;
            case "m":
                actions.toggleMute();
                break;
            case "w":
                actions.openNameInput();
                break;
            case "Escape":
            case "R":
                actions.close();
                break;
        }
    };

    return {
        control,
    };
};

export default useInputTrackManager;
