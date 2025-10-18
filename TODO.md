## Critical Before Presentation

- Visual checks on safari
- Optimize carousel on wide screen (it doesn't fully scroll to last item?)

- Ensure that the correct srcset is used with new sizes (list view mobile)
- Improve quality of the projector image
- Better touch feedback for buttons (ipad)
- Fix: Bug on about page with mega tall screen -- first should always be seleced when no scrolling occurs.
- FIx down line on timeline safari
- Reduce get involved mobile gap

## Pre-Event Refactoring / Invisible Changes

### Priority

- General Refactoring
- Squash/Purge the git history.
- Nicer Readme, include components style guide - documenting naming conventions, prop patterns, and composition rules

### Nice to Have

- replace data-astro-prefetch with just `prefetch` for react components
- Use the py-responseive and gap-responseive classes more.
- Refactor rawJson usage in the import script.
- Update theme script
- Fix too much content caching / memoization in dev mode.
- Test no upcoming events
- Generative OG Image template, Venue OG images, no SVGs in logos
- Refactor sitemap, og cache, utils
- Implement new fonts API

## Later?

- Ask martin to include link to homepage in meetup.com pages _strip on site_
- Include venue details on event page?
- Manual test for renaming events
- Slug Renaming if event name changes
- Activity Feed (firehose + event specific)
- Update built with love link to be the commit on the main repo
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
