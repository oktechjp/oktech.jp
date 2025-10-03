# Repository Guidelines

## Project Structure & Module Organization

- Routes live in `src/pages`; UI lives in `src/components/**`, `src/layouts`, and `src/hooks`.
- Markdown sources stay under `content/`; keep collections read-only unless data owners request updates.
- Utilities belong in `src/utils`, styles in `src/styles`, and static assets in `src/assets`.
- Tooling sits in `scripts/`; treat `dist/` as disposable build output.

## Build, Test & Development Commands

- Run `npm run dev` when `DEV_PORT` (defaults to 4321) is free.
- `npm run build` outputs to `dist/`; follow with `npm run preview` to verify the bundle.
- `npm run test` runs the Playwright suite; scope with `npm run test -- timeline` and refresh baselines with `npm run test:screenshots`.
- `npm run typecheck` runs `astro check` plus `tsc`; `npm run checks` adds formatting and dependency hygiene.

## Coding Style & Naming Conventions

- Ship TypeScript only—no `any`, no loose JavaScript—and let Prettier (2-space indent, width 100, sorted imports) format commits.
- Use PascalCase for components, camelCase for utilities, and prefix hooks with `use`; prefer React `.tsx` unless an `.astro` page stays static.
- Lean on Tailwind and DaisyUI classes; tokens live in `src/styles/*.css`, and OG image layouts must wrap content in `flex` containers.
- Reference modules through the `@/` alias, reuse helpers from `src/utils` before adding new dependencies, and pair interactive Astro imports with `client:visible` plus the shared `Link` wrapper.
- Delete unused imports or variables immediately.

## Testing Guidelines

- Playwright specs live in `test/e2e`; shared fixtures and helpers stay under `test/helpers`.
- Name specs after the feature (e.g. `timeline.spec.ts`) and commit images to `test/screenshots/reference`.
- Start big features with a failing spec; run `npm run test:build` before merges and clear `test/screenshots/output`.

## Commit & Pull Request Guidelines

- Use short, Title Case commit subjects (see `git log`); add body details when touching multiple areas.
- Before opening a PR, run `npm run build`, `npm run checks`, and the relevant Playwright command; document any failing checks.
- PR descriptions should link to related issues, summarize user-facing impact, and include screenshots or videos for visual changes.
- Flag configuration updates (.env, Astro config, Playwright baselines) so reviewers can reproduce them.

## Workflow Notes

- Leave git operations (stage, commit, push, reset) to maintainers unless instructed otherwise.
- Clarify ambiguous requirements—never guess about missing context.

## Environment & Deployment Notes

- Copy `.env.local.example` to `.env.local` and set `SITE_URL`, `BASE_PATH`, or OG cache keys for production data.
