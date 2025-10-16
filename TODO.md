## Critical Before Presentation

- Fix contrast in dark mode for alert / rsvp
- update cards (no long address, single line times)
- Optimize carousel on wide screen (it doesn't fully scroll to last item?)
- General Refactoring
- Exclude test events from prod
- Update built with love link to be the commit on the main repo

## "V1 Release"

- Check on mobile, safari
- Squash/Purge the git history.

## Nice to have

- Test no upcoming events
- Update OG Image template, Venue OG images, no SVGs
- Implement new fonts API
- Refactor sitemap, og cache, utils
- Nicer Readme, include components style guide - documenting naming conventions, prop patterns, and composition rules
- Remove SubSection, shouldn't be needed
- Figure out how to overlay the sticky right panel
- replace data-astro-prefetch with just `prefetch` for react components
- Fix too much content caching / memoization in dev mode.
- Update theme script
- Use the py-responseive and gap-responseive classes more.
- Refactor rawJson usage in the import script.
- In the grid view, try a horizontal layout for the polaroid on mobile
- Manual test for renaming events
- Slug Renaming

## Later?

- Remove the noto sans JP if it's super heavy? It's ok to fallback to system font for Japanese.
- Venue instructions
- Create test case for event name changing.
- Tweak grid count based on new designs.
- Static Links to files within markdown links.
- Preview builds for PRs
- fade between slides in gallery mode.
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

## Presentation Topic Ideas

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
- `isolate`
