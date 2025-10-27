<div align="center">
  <a href="https://oktech.jp">
    <img src="./src/assets/OKTech-logo-auto.svg" alt="OKTech.jp logo" height="120" />
  </a>

<h1>
  <a href="https://oktech.jp">OKTech.jp Website</a>
</h1>
  <p>OKTech Technology Meetup Group in Osaka, Kyoto, Kansai (formerly OWDDM and KWDDM).</p>
</div>

---

## Overview

This project is a Static Site Generator website, built with Astro 5, TypeScript, React, Tailwind, and Daisy UI.

It is hosted on GitHub Pages, available at [oktech.jp](https://oktech.jp).

## Development Environment

The recommended way to develop is to launch the provided [Dev Container](.devcontainer/devcontainer.json) (see [containers.dev](https://containers.dev/)) which provides a Node 22 environment.

Install dependencies and run common tasks with the following commands (see [package.json](./package.json) for all scripts):

```bash
npm install # or npm ci
npm run dev # starts the development server
npm run build # builds the SSG website
npm run preview # previews the SSG website
npm run checks # checks types, lints, and prunes code
npm run test # runs the tests (playwright)
```

See [./AGENTS.md](./AGENTS.md) for automation tips, code-style expectations, and task-specific checklists.

## Content

Primary content lives in `content/` and syncs with upstream data from [oktechjp/public](https://github.com/oktechjp/public).

- [./content/events](./content/events) are synced automatically by the import [workflow](#workflows).
- [./content/venues](./content/venues) and [./content/articles](./content/articles) are added manually.

## Workflows

For now, most of the time, event content and photos should only be edited in the [oktechjp/public](https://github.com/oktechjp/public) repository. This will trigger a [scheduler](.github/workflows/scheduler.yml) workflow that [imports](.github/workflows/import.yml) and commits the changes, and triggers a [build](.github/workflows/astro.yml) that that gets deployed to GitHub Pages.

```mermaid
flowchart LR
    %% External Triggers
    Cron([Daily Cron<br/>15:00 UTC])
    Manual1([Manual Trigger])
    Manual2([Manual Trigger])
    Manual3([Manual Trigger])
    Upstream([Upstream Commit<br/>oktechjp/public])
    DirectPush([Direct Push<br/>to main])

    subgraph scheduler["scheduler.yml"]
        direction TB
        Scheduler[[Scheduler Workflow]]
        CheckMeta[Read content/meta.json<br/>commitHash, contentHash<br/>nextEventEnds]
        FetchUpstream[Fetch Latest Commit<br/>from oktechjp/public]
        CheckEvent{Event<br/>Ended?}
        CompareCommit{Commit Hash<br/>Changed?}
        FetchContent[Fetch events.json<br/>& photos.json]
        ComputeHash[Compute Content Hash<br/>SHA256]
        CompareHash{Content Hash<br/>Changed?}
        NeedsBuild{Needs<br/>Build?}
        TriggerImport[Trigger Import Workflow]
        End1(End)

        Scheduler --> CheckMeta
        CheckMeta --> FetchUpstream
        FetchUpstream --> CheckEvent
        CheckEvent -->|Yes| NeedsBuild
        CheckEvent -->|No| CompareCommit
        CompareCommit -->|Yes| FetchContent
        CompareCommit -->|No| NeedsBuild
        FetchContent --> ComputeHash
        ComputeHash --> CompareHash
        CompareHash -->|Yes| NeedsBuild
        CompareHash -->|No| NeedsBuild
        NeedsBuild -->|Yes| TriggerImport
        NeedsBuild -->|No| End1
    end

    subgraph import["import.yml"]
        direction TB
        Import[[Import Workflow]]
        RunImport[Run npm import script<br/>Fetch from oktechjp/public]
        UpdateMeta[Update content/meta.json<br/>with new commitHash<br/>contentHash, nextEventEnds]
        CheckChanges{Content<br/>Changes?}
        CommitPush[Commit & Push<br/>to main branch]
        TriggerBuild[Trigger Build Workflow]
        End2(End)

        Import --> RunImport
        RunImport --> UpdateMeta
        UpdateMeta --> CheckChanges
        CheckChanges -->|Yes| CommitPush
        CheckChanges -->|No| End2
    end

    subgraph build["astro.yml"]
        direction TB
        Build[[Build Workflow]]
        BuildAstro[Build Astro Site]
        RunTests[Run Playwright Tests]
        TestsPassed{Tests<br/>Pass?}
        Deploy[Deploy to<br/>GitHub Pages]
        End3(End)

        Build --> BuildAstro
        BuildAstro --> RunTests
        RunTests --> TestsPassed
        TestsPassed -->|Yes| Deploy
        TestsPassed -->|No| End3
    end

    %% Cross-workflow connections
    Cron --> Scheduler
    Manual1 --> Scheduler
    Upstream -.influences.-> Scheduler
    TriggerImport --> Import
    Manual2 --> Import
    CommitPush --> TriggerBuild
    TriggerBuild --> Build
    Manual3 --> Build
    DirectPush --> Build

    %% Styling with border colors that work in light and dark mode
    classDef triggerStyle stroke:#3b82f6,stroke-width:3px
    classDef workflowStyle stroke:#f59e0b,stroke-width:3px
    classDef decisionStyle stroke:#a855f7,stroke-width:2px
    classDef actionStyle stroke:#10b981,stroke-width:2px
    classDef endpointStyle stroke:#ec4899,stroke-width:2px

    class Cron,Manual1,Manual2,Manual3,Upstream,DirectPush triggerStyle
    class Scheduler,Import,Build workflowStyle
    class CheckEvent,CompareCommit,CompareHash,NeedsBuild,CheckChanges,TestsPassed decisionStyle
    class CheckMeta,FetchUpstream,FetchContent,ComputeHash,TriggerImport,RunImport,UpdateMeta,CommitPush,TriggerBuild,BuildAstro,RunTests,Deploy actionStyle
    class End1,End2,End3 endpointStyle
```

## Import Script Overview

You can also manually run the import script within a dev environment. See
[./scripts/import-data/README.md](./scripts/import-data/README.md) for invocation details, required environment variables, and troubleshooting steps. Use `npm run import -- --help` to see all options.

## Tests

- Playwright-based tests live under `test/`.
- `npm run test:dev` runs against the dev server; `npm run test:build` builds first and then tests; `npm run test:dist` test an existing build and is used in CI.
- Install browsers with `npx playwright install --with-deps` if they are missing and keep fixtures in sync with layout changes.

## Contributing

- Review the Style Guide in `./AGENTS.md` before starting work.
- Fork the repository, create a feature branch, and open a pull request with passing `npm run checks` and relevant tests.

## Artificial Intelligence (AI) and Large Language Model (LLM) Disclosure

This project was created with the assistance of AI development tools including Cursor IDE, Claude Code, Codex CLI, and others, utilizing various models throughout the development of this project since its start in April 2025. Thank you to all who made it possible.
