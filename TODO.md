## Inbox

Figure out accidentally cancelled event logic.
Discuss with martin how to implement the join page.
Also, I noticed the issue Martin mentioned regarding the About page. I can't open Figma right now, but the title 'About OK Tech' on the webpage does seem a bit large.
Could you please try to adjust its size to match the title size of 'Upcoming Event' on the All Events page? Thanks~
Remove instructional items from big slideshow? standardize script; removed vs instructional
Figure out srcsets
Wrap markdown tables and checkboxes
Evaluate https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/loading#lazy
I think we can use https://docs.astro.build/en/guides/prefetch/ without a custom react component?
We still have multiple requests for the slideshow
, New screenshot

Still not working with image srcset.
Wrap markdown tables and checkboxes
Evaluate https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/loading#lazy
I think we can use https://docs.astro.build/en/guides/prefetch/ without a custom react component?
We still have multiple requests for the slideshow
Clean up data getters
const venueId = typeof event.data.venue === "object" ? event.data.venue.id : event.data.venue;
, New screenshot

## After Presnetaiton

- Optimize SVGs
- Lighthouse stuff
- Add slides to projector mode (CTAs for discord, next event, after-party, etc.)
- Fix too much content caching / memoization in dev mode.
- Test no upcoming events
- Reimport covers when they're higher quality.
- Refactor sitemap, og cache, utils
- Implement new experimental fonts api in astro
- Include venue details on event page?
- Optimize carousel on wide screen (it doesn't fully scroll to last item?)

## Mini Epic: Generative OG Images / Meetup.com Sync Workflow

- Figure out a workflow that works for everyone, and meetup.com
- Implement template, Venue OG images, no SVGs in logos
- Update theme script to sync values with OG images.
- Ask martin to include link to homepage in meetup.com pages _strip on site_

## Later

- Martin's time library?
- Renaming Events: Manual and Automatic Test, Slug Renaming
- Activity Feed (firehose + event specific)
- Remove the noto sans JP if it's super heavy? It's ok to fallback to system font for Japanese. See how new astro fonts api works.
- Venue instructions
- Static Links to files within markdown links.
- Preview builds for PRs
- fade between slides in gallery mode.
- Thank you section on about
- Test an event witout a map ?
- Add searchable short description to events?
- Add info button on the lightbox
- Tagging with LLMs and shiz.
- How to find us photos for hankyu etc.
- Members: with hasPage: true.
- Venue type ; inside / outside / etc.
- Add interactive japan map somewhere, with heatmap of all the event locations.
- Tree shaking animejs ?
- Add / Include the event date to the URL so its easier to see in links how old events are.
