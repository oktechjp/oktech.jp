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
