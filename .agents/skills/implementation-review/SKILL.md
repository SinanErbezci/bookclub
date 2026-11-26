---
name: implementation-review
description: Review BookClub code changes for defects, regressions, and merge readiness. Use for independent reviews and re-reviews after fixes.
---

# Implementation review

Follow the repository's [AGENTS.md](../../../AGENTS.md) and [PLANS.md](../../../PLANS.md). Review produces findings and a recommendation. It grants no additional permissions. Leave application code and Git state untouched, and do not commit, push, merge, or deploy as part of the review.

## Establish the review scope

- Identify the proposed revision, comparison base, and whether the review covers committed changes, the workspace, or both. Use the user-approved scope and acceptance criteria, including the applicable execution plan and approved amendments. Treat implementation handoffs and plan status as leads. Flag missing criteria or an uncertain baseline when they affect the recommendation.
- Inspect the committed diff against the applicable base. For workspace changes, use `git status --short --untracked-files=all`, `git diff --cached`, and `git diff` to identify staged, unstaged, and untracked material. Read relevant untracked files directly since Git diffs omit them. Inspect only filenames and ignore rules for suspected secret files. Keep unrelated workspace changes outside the review.
- For an initial review, map each material acceptance criterion to the implementation and its evidence. Trace affected entry points, callers, and data through the changed behavior. Look for correctness, security, reliability, compatibility, and regression risks, including failure and recovery paths where applicable.
- For a remediation re-review, start with prior findings and their dispositions. Compare the current changes with the previously reviewed state where available. Verify each claimed fix, inspect newly changed behavior and directly affected paths, and rerun affected checks. Record each finding as resolved, open, or unverified. Report new defects tied to the fixes or their effects. Flag material scope drift for a decision and leave unrelated improvements as follow-ups.

## Verify independently

- Inspect what the tests actually assert. Ask whether the previous defect or a plausible broken implementation would fail the test. Check that mocks preserve the behavior under test and that fixtures distinguish the expected result from accidental passes.
- Run relevant checks against the reviewed state when authorized and feasible. Use the repository's documented commands and prerequisites. Record direct source observations and checks you ran, with exact commands, working directories, outcomes, and any blocked or skipped verification. Attribute implementation-agent or prior reviewer results to their source. If you materially contributed to the implementation, identify your work as a self-review and leave any required independent review pending.

## Report findings and readiness

Lead with findings in descending severity. For each, give the severity, file and line, trigger or failed criterion, concrete impact, and a suggested correction. State when no actionable findings were found within the reviewed scope. Include the reviewed revision or workspace scope, verification gaps, and applicable migration or deployment implications.

Recommend **ready to merge**, **changes required**, or **verification pending**. Tie the recommendation to unresolved blockers and required evidence. After remediation, include the prior findings' dispositions and affected check results so the plan can record closure or pending work.