import type { McpState } from "../../service/mcp/mcp-types";

const createInitial = (): McpState => ({ status: "stopped", details: null });

export default { createInitial };
