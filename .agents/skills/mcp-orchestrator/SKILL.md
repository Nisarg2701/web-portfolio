---
name: mcp-orchestrator
description: Standard operating procedure for invoking local MCP tools (Nimble decision engine and Qwen code generator) to triage, route, and gate agent actions.
---

# MCP Orchestration Skill

Use this workflow whenever interacting with connected Model Context Protocol (MCP) servers.

## Available Local MCP Capabilities

| MCP Tool | Model / Engine | Purpose | Output |
| :--- | :--- | :--- | :--- |
| `route_task_to_agent` | Nimble 9B (System 1) | Tiers task into local, cloud, or human review | JSON (tier, confidence) |
| `fast_decision_evaluator` | Nimble 9B (System 1) | Categorical classification & sanity gating | JSON (choice, probabilities) |
| `generate_local_code` | Qwen 2.5 Coder 7B | Offline code/test synthesis | Raw Code / Text |

---

## Operating Procedure

### Phase 1: Incoming Task Routing
1. Before generating execution plans or touching code, call `route_task_to_agent` with the prompt.
2. If `tier == "local_code_gen"`:
   - Call `generate_local_code` to draft the required method or unit test.
   - Do not spend heavy cloud tokens on routine boilerplate.
3. If `tier == "human_approval"`:
   - Immediately stop autonomous execution.
   - Present a dry-run plan/diff to the user and await explicit confirmation.
4. If `tier == "complex_cloud"`:
   - Proceed with multi-file reasoning and workspace orchestration.

### Phase 2: Failure Triage
- When a terminal command, test suite, or build fails:
  - Do not guess the fix.
  - Call `fast_decision_evaluator` passing the compiler/runtime stack trace as `state`.
  - Pass the suspected error types in `criteria` (e.g., `syntax_error`, `missing_import`, `type_mismatch`, `flaky_test`).
  - Follow the highest-probability path.

### Phase 3: Scope Gating
- Before applying multi-file edits, evaluate whether the modification is `local_only`, `breaking_api`, or `architectural_migration`.
- Request user review if the score favors `breaking_api` or `architectural_migration`.