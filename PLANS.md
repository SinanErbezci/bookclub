# Execution plans

## When to use a plan

Write a plan if the user asks for one, the work spans dependent milestones or
sessions, or a change needs explicit compatibility, isolation, or recovery
checks. For small, well-understood fixes or documentation edits, the usual checks
in [AGENTS.md](AGENTS.md) are generally enough.

Keep one plan per effort in `docs/plans/<short-name>.md` and update it as work
progresses. Get user approval for the initial plan before substantial
implementation unless the user explicitly delegated planning and implementation
together. Get renewed approval for material scope or architecture changes where
applicable.

Follow [AGENTS.md](AGENTS.md) and all applicable permission and security rules.
A plan grants no authority. Git, external service, infrastructure, and
deployment restrictions still apply. Identify steps that require separate
authorization and get it before proceeding.

## Required sections

Give a fresh agent enough context to resume safely using only the plan and its
repository references. Include relevant paths, constraints, decisions, and
evidence.

- **Status and handoff.** Record the last verified milestone, blockers, partial
  changes, any resources still running, and the next safe action.
- **Objective, context, and scope.** State the intended outcome, relevant paths,
  current behavior, constraints, and what is out of scope. Record material
  scope changes and any required approval.
- **Milestones and acceptance criteria.** Order milestones by dependency and use
  checkboxes. Define observable outcomes. Cover compatibility, failure behavior,
  and cleanup where relevant. Check off each milestone after recording its
  evidence.
- **Discoveries and decisions.** Date findings that change the approach, scope,
  or risk. Record the evidence, what you decided and why, and how it affects
  the remaining work. Keep failed attempts and revised decisions in the plan.
- **Safety and recovery.** Identify targets, data and secret boundaries, preflight
  checks, stop conditions, and scoped cleanup or rollback. Use local stubs,
  dummy settings, and disposable resources where applicable. If a step fails,
  record what ran, what may have changed, and what remains unknown.
  Diagnose with the smallest safe reproduction. Before retrying, verify
  preconditions and stay within your authorization. Keep secrets out of the
  plan and logs.
- **Validation and evidence.** Match each acceptance criterion to a check.
  Record the working directory, exact commands, relevant prerequisites or
  versions, and actual results. Include exit status where useful. Distinguish
  source inspection, local validation, and live verification. Explain skipped
  or blocked checks and rerun affected checks after fixes.
- **Independent review and remediation.** Define the review scope when the user
  or engineering rules require independent review, or when risk warrants it,
  such as for changes to isolation or recovery. Use an authorized review
  channel. Record findings, their status, fixes, rerun results, and re-review
  of material fixes. Mark required review as pending if it is unavailable.

## Updating and closing

Update the plan after milestones, material findings, failed checks, and review.
Mark it complete once the agreed acceptance criteria are met, required checks
pass, material review blockers are resolved, and applicable cleanup is verified.
Summarize affected components and any migration or deployment implications.
Record non-blocking improvements and unrelated discoveries as follow-up work.

If a step cannot continue safely, stop that step and continue independent work
within scope. If the effort is blocked, paused, or canceled, record why, what's
incomplete, what state remains, and what would let work resume.
