# Execution plans

## When to use a plan

Write a plan when the user requests one, the work spans dependent milestones or
sessions, or a change needs explicit compatibility, isolation, or recovery
checks. A small, well-understood fix or documentation edit usually needs only
the normal checks in `AGENTS.md`.

Keep one living plan per effort in `docs/plans/<short-name>.md`. Obtain user
approval of the initial plan before substantial implementation unless the user
has explicitly delegated planning and implementation together. Seek renewed
approval for material scope or architectural changes where applicable.

Follow `AGENTS.md` and all applicable permission and security rules. A plan
grants no authority. Existing restrictions on Git, external services,
infrastructure, and deployment still apply. Identify steps that require
separate authorization and obtain it before proceeding.

## Required sections

A fresh agent should be able to resume safely from the plan and its repository
references alone. Include the relevant paths, constraints, decisions, and
evidence the agent would otherwise need from prior conversation.

- **Status and handoff.** Record the last verified milestone, current blockers,
  any partial changes or resources left running, and the next safe action.
- **Objective, context, and scope.** State the intended outcome, relevant
  paths and existing behavior, constraints, and explicit non-goals. Record
  material scope changes and any required approval.
- **Milestones and acceptance criteria.** Order milestones by dependency and
  track them with checkboxes. Define observable outcomes, including
  compatibility, failure behavior, and cleanup where relevant. Check off
  milestones when their evidence is recorded.
- **Discoveries and decisions.** Date findings that change the approach, scope,
  or risk. Record the evidence, the decision and rationale, and the effect on
  remaining work. Preserve failed attempts and revised decisions.
- **Safety and recovery.** Identify targets, data and secrets boundaries,
  preflight checks, stop conditions, and scoped cleanup or rollback. Use local
  stubs, dummy settings, and disposable resources where applicable. On failure,
  record what ran, what may have changed, and what remains unknown. Diagnose
  with the smallest safe reproduction and verify preconditions before retrying
  within authorization. Keep secrets out of the plan and logs.
- **Validation and evidence.** Map acceptance criteria to checks. Record the
  working directory, exact commands, relevant prerequisites or versions, and
  actual outcomes, including exit status where useful. Distinguish source
  inspection, local validation, and live verification. Explain skipped or
  blocked checks and rerun affected checks after fixes.
- **Independent review and remediation.** Define the scope of independent
  review when the user or engineering rules require it or when risk warrants
  it, such as changes to isolation or recovery. Use an authorized review
  channel. Record findings, dispositions, fixes, rerun results, and re-review
  of material fixes. Mark unavailable required review as pending.

## Updating and closing

Update the plan after milestones, material findings, failed checks, and review.
Close it as complete once the agreed acceptance criteria are satisfied,
required validation passes, material review blockers are resolved, and
applicable cleanup is verified. Summarize affected components and any migration
or deployment implications. Record non-blocking improvements and unrelated
discoveries as follow-up work.

If a step cannot safely continue, stop that step and continue independent work
within scope. If the effort is blocked, paused, or canceled, record why, what
remains incomplete, any residual state, and what would allow work to resume.
