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

# Autonomous Decision Engine (Nimble MCP) Policy

Delegate evaluation to the `fast_decision_evaluator` tool under these conditions:

1. **Pre-edit Scope Check:**
   - Before executing multi-file edits, evaluate whether the proposed change is `local_only`, `breaking_api`, or `architectural_migration`.
   - If evaluated as `breaking_api` or `architectural_migration`, require explicit user confirmation before touching files.

2. **Root Cause Analysis:**
   - On build failure, runtime exception, or test failure, run the stack trace and relevant diff through `fast_decision_evaluator` to pick the root-cause category before writing code.

3. **Dependency Addition:**
   - Do not add new external libraries unless the evaluator confirms the task cannot be cleanly resolved via `use_stdlib` or `leverage_existing_dep`.

4. **Commit & Label Generation:**
   - Classify all git diffs into Conventional Commit types (`feat`, `fix`, `refactor`, `perf`, `chore`) prior to drafting commit messages or summaries.