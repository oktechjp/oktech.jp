## vNow - fixes/refactoring

- In the grid view, try a horizontal layout for the polaroid on mobile
- Implement Theme
- Projector styling
- Check on mobile, safari
- Update OG Image template, Venue OG images, no SVGs
- Refactor SEO, sitemap, og cache, utils
- Fix too much content caching / memoization in dev mode.
- Nicer Readme, include components style guide - documenting naming conventions, prop patterns, and composition rules
- Remove the noto sans JP if it's super heavy? It's ok to fallback to system font for Japanese.
- Remove SimpleSection, shouldn't be used
- Replace calendar tooltip with modal
- Update theme script
- Use the py-responseive and gap-responseive classes more.
- Use react-spring for parralax
- Implement react spring elsewhere
- fix carousel on wide screen
- Fix bug where the gallery item doesn't open the correct image
- Increase font to 24?
- REfactor rawJson usage in the import script.
- Tweak grid count based on new diszes.
- replace data-astro-prefetch with just `prefetch` for react components
- Scroll to top button on long pages

## New Features

- Static Links to files within markdown links.

## Release

- Squash the git history.

## Later?

- Preview builds for PRs
- fade between slides in gallery mode.
- Create a plan for cancelled events logic.
- Article for about History.
- Thank you section on about
- Test an event witout a map ?
- Add searchable short description to events?
- Add info button on the lightbox
- Carousel for upcoming events
- Random slideshow of all images
- Tagging with LLMs and shiz.
- How to find us photos for hankyu etc.
- Members: with hasPage: true.
- Venue type ; inside / outside / etc.
- Add interactive japan map somewhere, with heatmap of all the event locations.
- Tree shaking animejs ?
- Backlog Idea: maybe add the event date to the URL so its easier to see in links how old events are.

## Presnetation Topic Ideazs

- Workflows
- Content Collections
- The SVGs
- OG images
- Astro and React Pain
- Claude
- Hover peresitance on mobile
- Blob saga
- Explain client:only="react" and other astro directives
- `<TopBar client:load transition:persist="topbar" />`
- `https://tailwindcss.com/docs/will-change`
