import { get } from "svelte/store";
import { dataStore, fileStore } from "../../store/global-store";
import type { McpBridgeRequest, McpBridgeResponse } from "./mcp-types";

const handleMcpRequest = (request: McpBridgeRequest): McpBridgeResponse => {
    switch (request.method) {
        case "ping":
            return { id: request.id, result: { status: "ok" } };
        case "getScoreOverview": {
            const data = get(dataStore);
            const file = get(fileStore);
            const scoreTracks = data.scoreTracks.map((track, index) => ({
                index,
                name: track.name,
                noteCount: track.notes.length,
            }));
            return {
                id: request.id,
                result: {
                    scoreName: file.score?.name ?? "Untitled score",
                    dirty: file.isDirty,
                    scoreTrackCount: scoreTracks.length,
                    audioTrackCount: data.audioTracks.length,
                    totalNoteCount: scoreTracks.reduce((sum, track) => sum + track.noteCount, 0),
                    scoreTracks,
                },
            };
        }
        default:
            return {
                id: request.id,
                error: { code: "UNKNOWN_METHOD", message: "This MCP method is not supported." },
            };
    }
};

export default handleMcpRequest;
