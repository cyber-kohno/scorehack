import { get } from "svelte/store";
import createArrangeUpdater from "../../service/arrange/arrange-updater";
import { controlStore, dataStore } from "../../store/global-store";

const createContext = () => {
    const control = get(controlStore);
    const data = get(dataStore);

    const commitControl = () => controlStore.set({ ...control });

    return {
        arrangeUpdater: createArrangeUpdater({ control, data }),
        commitControl,
    };
};

const createArrangeActions = () => {
    const closeArrange = () => {
        const ctx = createContext();

        ctx.arrangeUpdater.closeArrange();
        ctx.commitControl();
    };

    const closeFinder = () => {
        const ctx = createContext();

        ctx.arrangeUpdater.closeFinder();
        ctx.commitControl();
    };

    return {
        closeArrange,
        closeFinder,
    };
};

export default createArrangeActions;
