This project is a Static Site Generator Website built with Astro 5, TypeScript, React, Tailwind, and Daisy UI.

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