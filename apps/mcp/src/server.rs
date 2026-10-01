use crate::bridge;
use rmcp::{
    handler::server::{router::tool::ToolRouter, wrapper::Parameters},
    model::{CallToolResult, ContentBlock, Implementation, ServerCapabilities, ServerConfig},
    schemars, tool, tool_handler, tool_router, ErrorData as McpError, ServerHandler,
};
use serde::Deserialize;
use serde_json::json;

#[derive(Clone)]
pub struct ScorehackMcpServer {
    #[allow(dead_code)]
    tool_router: ToolRouter<Self>,
}

#[derive(Debug, Deserialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct SessionRequest {
    #[schemars(description = "Complete sessionId returned by list_scorehack_sessions.")]
    session_id: String,
}

fn result(value: serde_json::Value) -> CallToolResult {
    CallToolResult::success(vec![ContentBlock::text(value.to_string())])
}

#[tool_router]
impl ScorehackMcpServer {
    pub fn new() -> Self {
        Self {
            tool_router: Self::tool_router(),
        }
    }

    #[tool(
        description = "Check that the Scorehack MCP adapter is running. Scorehack need not be open."
    )]
    async fn ping(&self) -> Result<CallToolResult, McpError> {
        Ok(result(
            json!({ "application": "Scorehack", "status": "ok", "appRequired": false }),
        ))
    }

    #[tool(
        description = "List currently published local Scorehack sessions. Rechecks each session's authenticated health endpoint on every call. An empty list means Scorehack is closed or MCP is stopped."
    )]
    async fn list_scorehack_sessions(&self) -> Result<CallToolResult, McpError> {
        Ok(result(json!({ "sessions": bridge::list_sessions() })))
    }

    #[tool(
        description = "Read the current unsaved Scorehack state for a specific session: score track count, audio track count, and note counts. Call list_scorehack_sessions first. This is read-only."
    )]
    async fn get_score_overview(
        &self,
        Parameters(request): Parameters<SessionRequest>,
    ) -> Result<CallToolResult, McpError> {
        match bridge::call_session(&request.session_id, "getScoreOverview", json!({})) {
            Ok(value) => Ok(result(value)),
            Err(error) => Ok(CallToolResult::error(vec![ContentBlock::text(
                json!({ "code": error.code, "message": error.message }).to_string(),
            )])),
        }
    }
}

#[tool_handler]
impl ServerHandler for ScorehackMcpServer {
    fn get_info(&self) -> ServerConfig {
        ServerConfig::new(ServerCapabilities::builder().enable_tools().build())
            .with_server_info(
                Implementation::new(env!("CARGO_PKG_NAME"), env!("CARGO_PKG_VERSION"))
                    .with_title("Scorehack MCP"),
            )
            .with_instructions("Use list_scorehack_sessions to find a live local app session, then get_score_overview with its complete sessionId. Score reads are from the app's current unsaved state. No tool edits the score.".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fixed_tool_catalog() {
        let router = ScorehackMcpServer::tool_router();
        assert!(router.has_route("ping"));
        assert!(router.has_route("list_scorehack_sessions"));
        assert!(router.has_route("get_score_overview"));
        assert_eq!(router.list_all().len(), 3);
    }
}
