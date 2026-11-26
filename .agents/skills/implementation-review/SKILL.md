---
name: implementation-review
description: Review BookClub code for defects, regressions, and merge readiness. Use for independent reviews and re-reviews after fixes.
---

# Implementation review

Follow [AGENTS.md](../../../AGENTS.md) and [PLANS.md](../../../PLANS.md). Report
findings and recommend whether the change is ready. A review grants no extra
permissions. Leave application code and Git state untouched. Do not commit,
push, merge, or deploy during a review.

## Establish the review scope

- Identify the proposed revision, comparison base, and whether the review covers
  commits, workspace changes, or both. Follow the user-approved scope and
  acceptance criteria, including the applicable plan and approved amendments.
  Use handoffs and plan status as leads. Flag missing criteria or an uncertain
  baseline if they affect the recommendation.
- Compare committed changes with the applicable base. For workspace changes,
  use `git status --short --untracked-files=all`, `git diff --cached`, and
  `git diff` to identify staged, unstaged, and untracked changes. Read relevant
  untracked files directly because diffs omit them. For suspected secret files,
  inspect only filenames and ignore rules. Exclude unrelated workspace changes.
- For an initial review, match each material acceptance criterion to the code
  and its evidence. Trace the changed behavior through affected entry points,
  callers, and data. Check for defects, security and reliability risks,
  compatibility issues, and regressions. Include failure and recovery paths
  where relevant.
- For a re-review after fixes, start with prior findings and their status.
  Compare with the last reviewed state if available. Verify each claimed fix,
  inspect changed behavior and directly affected paths, and rerun affected
  checks. Mark each finding resolved, open, or unverified. Report new defects
  caused by the fixes or their effects. Flag material scope drift for a
  decision and leave unrelated improvements as follow-ups.

## Verify independently

- Read the test assertions. Check whether a prior defect or a plausible broken
  implementation would fail the test. Make sure mocks preserve the behavior
  under test and fixtures rule out accidental passes.
- Run relevant checks against the reviewed state when authorized and feasible.
  Use the documented commands and prerequisites. Record what you saw in source
  and what you ran, including exact commands, working directories, outcomes,
  and blocked or skipped checks. Attribute results from implementers or prior
  reviewers. If you contributed materially to the implementation, call it a
  self-review and leave any required independent review pending.

## Report findings and readiness

Lead with findings in descending severity. For each, give the severity, file
and line, trigger or failed criterion, concrete impact, and suggested fix.
State if you found no actionable issues within scope. Identify the reviewed
revision or workspace scope, verification gaps, and any migration or
deployment implications.

Recommend **ready to merge**, **changes required**, or **verification pending**.
Base the recommendation on unresolved blockers and required evidence. After
fixes, include the status of prior findings and the affected check results so
the plan can record what closed and what remains pending.
