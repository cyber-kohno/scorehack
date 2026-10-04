import { ZodError } from "zod";
import type { ScoreQueryService } from "../score-query/score-query-service";
import { ScoreQueryError } from "../score-query/query-types";
import { catalogSchema, editorSchema, musicalSchema, outlineSchema } from "./mcp-query-schema";
import type { McpBridgeRequest, McpBridgeResponse } from "./mcp-types";

/** Wire validation and error mapping only; no store/transport dependencies. */
export const createMcpQueryHandler = (queries: ScoreQueryService) => (request: McpBridgeRequest): McpBridgeResponse => {
    try {
        let result: unknown;
        switch (request.method) {
            case "ping": result = { status: "ok" }; break;
            case "getScoreOverview": result = queries.overview(catalogSchema.parse(request.params)); break;
            case "getEditorContext": result = queries.editor(editorSchema.parse(request.params)); break;
            case "getOutlineContext": result = queries.outline(outlineSchema.parse(request.params)); break;
            case "getMusicalContext": result = queries.musical(musicalSchema.parse(request.params)); break;
            default: throw new ScoreQueryError("UNKNOWN_METHOD", "This MCP method is not supported.");
        }
        return { id: request.id, result };
    } catch (error) {
        if (error instanceof ZodError) return { id: request.id, error: { code: "INVALID_PARAMS", message: error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ").slice(0, 2000) } };
        if (error instanceof ScoreQueryError) return { id: request.id, error: { code: error.code, message: error.message } };
        return { id: request.id, error: { code: "INVALID_SCORE", message: error instanceof Error ? error.message.slice(0, 2000) : "Score data could not be interpreted." } };
    }
};
