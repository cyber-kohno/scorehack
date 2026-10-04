import { get } from "svelte/store";
import { controlStore, dataStore, fileStore, settingsStore } from "../../store/global-store";
import { ScoreQueryService } from "../score-query/score-query-service";
import { createMcpQueryHandler } from "./mcp-query-dispatcher";

const queries = new ScoreQueryService(() => {
    // One synchronous capture, followed by cloning and the shared derived builder.
    const file = get(fileStore);
    const settings = get(settingsStore);
    return { data: get(dataStore), control: get(controlStore), scoreName: file.score?.name ?? "Untitled score",
        dirty: file.isDirty, settings: { view: settings.view, notation: settings.notation, playback: settings.playback } };
});

export const resetMcpQueries = () => queries.clear();

const handleMcpRequest = createMcpQueryHandler(queries);

export default handleMcpRequest;
