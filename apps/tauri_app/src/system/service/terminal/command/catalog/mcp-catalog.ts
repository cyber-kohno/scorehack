import McpSessionController from "../../../mcp/mcp-session-controller";
import type TerminalCommand from "../../terminal-command";

const createMcpCatalog = (ctx: TerminalCommand.Context): TerminalCommand.Props => {
    const run = (action: () => Promise<string | string[]>) => {
        ctx.terminal.wait = true;
        ctx.commit.terminal();
        void action()
            .then((messages) => {
                for (const message of Array.isArray(messages) ? messages : [messages]) {
                    ctx.logger.outputInfo(message);
                }
            })
            .catch((error) => ctx.logger.outputError(`MCP operation failed: ${String(error)}`))
            .finally(() => {
                ctx.terminal.wait = false;
                ctx.commit.terminal();
            });
    };

    return {
        sector: "system",
        kind: "multi",
        key: "mcp",
        usage: "Manage the local MCP session.",
        subCommands: [
            { key: "start", usage: "Publish the current unsaved score to the local MCP adapter.", args: [], callback: () => run(McpSessionController.start) },
            { key: "stop", usage: "Stop the local MCP session.", args: [], callback: () => run(McpSessionController.stop) },
            {
                key: "status",
                usage: "Show the local MCP session status.",
                args: [],
                callback: () => run(McpSessionController.status),
            },
        ],
    };
};

export default createMcpCatalog;
