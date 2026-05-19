import ActionMenu from "../service/common/action-menu-service";

const useInputActionMenu = () => {
    const control = (eventKey: string) => {
        switch (eventKey) {
            case "ArrowUp":
                ActionMenu.move(-1);
                break;
            case "ArrowDown":
                ActionMenu.move(1);
                break;
            case "ArrowRight":
                ActionMenu.openChild();
                break;
            case "ArrowLeft":
                ActionMenu.back();
                break;
            case "Enter":
                ActionMenu.apply();
                break;
            case "Escape":
            case "m":
                ActionMenu.close();
                break;
        }
    };

    return {
        control,
    };
};

export default useInputActionMenu;
