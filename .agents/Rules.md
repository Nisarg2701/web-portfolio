# Project Rules

## What to Use
- **Strict AIDA Structure:** Attention (Hero), Interest (Bento), Desire (Scroll/Media), Action (Footer).
- **Python-Driven True Randomization:** Use deterministic seeds to pick layout architectures to avoid LLM defaults.
- **Wide Editorial Typography:** Use ultra-wide containers (`max-w-5xl`, `w-full`).
- **Gapless Bento Grids:** Use `grid-flow-dense` and perfectly interlocking spans.
- **Massive Spacing:** Use `py-32` or `py-48` to separate cinematic chapters.
- **Ponytail Constraints:** Reach for standard library / native features first. Minimal working code.

## What to Avoid (Banned Patterns)
- **NO 6-Line Wraps:** H1s must be 2-3 lines max. 
- **NO Em-Dashes (`—`):** Use regular hyphens.
- **NO Emoji:** Professional formatting only in code, UI, and comments.
- **NO AI Slop Palettes:** Avoid generic purple/blue glows or standard beige/brass premium tropes unless specifically requested.
- **NO Centered Text Walls:** Avoid generic center-aligned layouts for everything.
- **NO Meta-Labels:** Do not use "SECTION 01", "QUESTION 05", etc.
- **NO Div-Based Fake Screenshots:** Use real images or avoid completely.
- **NO Over-engineering:** Do not add Redux, complex state management, or heavy libraries if local state suffices.

# Autonomous Decision & Multi-Agent Routing Policy

All agent operations must adhere to this decision-first workflow:

## 1. Initial Task Routing & Subagent Dispatch
Before creating subagents, generating code, or planning file edits:
- Call `route_task_to_agent` with the incoming user request or task description.
- Branch execution strictly based on the evaluated `tier`:
  - **`local_code_gen`:** Do not invoke heavy cloud reasoning for synthesis. Delegate the generation of unit tests, boilerplate, or isolated methods directly to `generate_local_code`.
  - **`complex_cloud`:** Proceed with the primary Antigravity multi-file orchestrator agent.
  - **`human_approval`:** Halt autonomous edits immediately. Generate a dry-run plan/diff and wait for explicit user confirmation.

## 2. Pre-Edit Scope Gating
- Before touching existing files in multi-file edits, evaluate whether the change is `local_only`, `breaking_api`, or `architectural_migration` using `fast_decision_evaluator`.
- If evaluated as `breaking_api` or `architectural_migration`, require explicit user confirmation before applying diffs.

## 3. Root Cause Analysis
- On any build failure, runtime exception, or test failure, evaluate the stack trace and diff with `fast_decision_evaluator` to classify the defect type before attempting code patches.

## 4. Dependency Addition
- Do not add new third-party packages to project manifests unless `fast_decision_evaluator` confirms the task cannot be cleanly resolved via `use_stdlib` or `leverage_existing_dep`.

## 5. Commit & Label Generation
- Classify all git diffs into Conventional Commit types (`feat`, `fix`, `refactor`, `perf`, `chore`) via `fast_decision_evaluator` prior to staging or writing commit messages.