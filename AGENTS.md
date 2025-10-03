## Project Overview

- The website is built with Astro - a static site builder, version 5.x

```
/
├── content/             # Static content and data - do not touch!
├── src/                 # Source code
│   ├── components/      # React and Astro components
│   ├── layouts/         # Page layouts
│   ├── pages/           # Astro pages (routes)
│   ├── styles/          # Global CSS
│   └── utils/           # Utility functions
├── scripts/             # Build and data scripts
├── test/                # Test files
│   ├── e2e/             # End-to-end tests
├── package.json         # NPM dependencies and scripts
├── astro.config.ts      # Astro framework configuration
└── tsconfig.json        # TypeScript configuration
```

## Agent Behavior

- Do what has been asked - nothing more, nothing less
- Never assume missing context - ask questions if even slightly uncertain
- Only install libraries if you need to - framework may support what you need
- Never hallucinate libraries or functions - use verified packages from package.json
- Always confirm file paths and module names exist before referencing them
- Use the `context7` MCP tool for unfamiliar or updated libraries
- Never make git commands unless explicitly instructed
- Always prefer editing existing files over creating new ones
- Never create files unless absolutely necessary for the task
- Never proactively create documentation files (\*.md) unless explicitly requested
- Clean up after yourself - remove unused imports, variables, and functions
- Actively identify and remove dead code - if code isn't being used, delete it
- Always use existing utilities - check `/src/utils/` for common functions first

## Development Workflow

- We are running a dev server in the background - don't start your own
- Use TDD for new big features - create failing tests first, then implement
- Update existing tests when logic changes
- Use `npm run checks` frequently to verify imports (it's cheap)
- Use `npm run test -- my-test-name` during development to run single tests

## Code Style

- Always use TypeScript, never JavaScript
- Follow the DRY principle - avoid duplication
- Never create a file longer than 150 lines - refactor into modules or helpers
- Use consistent naming conventions, file structure, and architecture patterns
- Organize code into clearly separated modules, grouped by feature or responsibility
- Use `@/` imports unless component is a direct `./` sibling, avoid `../` imports
- For React components, use `export default function ComponentName` pattern
- Prefer React components (.tsx) over Astro components for most components
- Follow existing patterns and check neighboring files for style/structure
- Keep comments minimal - only for important or unintuitive nuances
- Never use `any`, `// eslint-disable-next-line`, or similar type shortcuts
- Astro templates require opening and closing frontmatter fences (---) with TypeScript
- We are using daisy ui v5 - always use these components and theme classes
- Use Tailwind classes instead of inline styles - prefer `className="text-[2vw]"`
- Always use `flex` on divs in OG image templates - limitation of og image generator
- Use `react-icons/lu` for UI icons and `react-icons/fa6` for brand icons
- Use `client:visible` directive when importing interactive React components in Astro
- Always use the Link component to handle internal links correctly
