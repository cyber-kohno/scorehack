import type ControlState from "../../store/state/control-state";
import type DataState from "../../store/state/data/data-state";
import createArrangeSelector from "./arrange-selector";

type Context = {
    control: ControlState.Value;
    data: DataState.Value;
};

const createArrangeUpdater = (ctx: Context) => {
    const { control, data } = ctx;
    const { outline } = control;
    const arrangeSelector = createArrangeSelector({ control, data });

    const closeArrange = () => {
        outline.arrange = null;
    };

    const closeFinder = () => {
        const arrange = arrangeSelector.getArrange();

        if (arrange.editor == undefined) outline.arrange = null;
        else delete arrange.finder;
    };

    return {
        closeArrange,
        closeFinder,
    };
};

export default createArrangeUpdater;
