# Import Data CLI

This CLI ingests OKTech event, venue, and photo data from the `oktechjp/public` repository (or a custom override), transforms it into local markdown and assets, and keeps supporting metadata up to date.

## Data Sources

- **Events & Venues** – `events.json` combines groups, events, and venue records.
- **Photos** – `photos.json` provides photo batches plus optional event hints.

## Directory Layout

```
scripts/import-data/
├── index.ts           # CLI bootstrap
├── lib/
│   ├── cli.ts         # Commander setup (import + clear commands)
│   ├── config.ts      # Paths, providers, feature flags, env wiring
│   ├── importer.ts    # Orchestrates fetch, processing, reporting
│   ├── processor.ts   # Event & venue content pipelines
│   ├── photos.ts      # Gallery downloads, caption metadata
│   ├── maps.ts        # Static map generation (light/dark)
│   ├── cleaner.ts     # Targeted cleanup strategies
│   ├── github.ts      # Authenticated GitHub fetch utilities
│   ├── logger.ts      # Timestamped, colorised logging
│   └── utils.ts       # Filesystem helpers
└── README.md
```

## Workflow Overview

1. **Repository Sync** – Determines the commit to use (latest by default, or `--repo`/`--commit` overrides) and configures downstream services to target that ref.
2. **Fetch** – Downloads raw JSON for events/venues and photos, keeping the raw payloads for hashing.
3. **Photos** – Assigns photo batches to events (explicit `event` IDs first, then `photoEventPatches`) and prepares galleries.
4. **Events** – Writes or updates `content/events/*/event.md`, pulls covers, and manages `gallery/` contents (download, resize to WebP, caption YAML, stale-file cleanup).
5. **Venues** – Writes or updates `content/venues/*/venue.md` and generates `map.jpg` / `map-dark.jpg` with per-theme overwrite controls.
6. **Metadata** – Produces `content/meta.json` containing the Git commit, content hash (SHA256 of raw JSON), and the next event end time/slug for runtime features.
7. **Reporting** – Prints an aligned summary table plus warnings for photo or map issues.

## CLI Usage

Run the tool through the package script:

```bash
npm run import
```

### Import Options

- `--overwrite-maps [theme]` – Regenerate maps. Supply no value to redo both themes, or pass `light` / `dark` to target one.
- `--repo <owner/repo>` – Source data from a different public repository that matches the JSON schema.
- `--commit <sha>` – Pin the import to a specific commit hash (useful for rollbacks or testing historical data).
- `--help` – Display the built-in command reference and valid clear targets.

```bash
npm run import -- --overwrite-maps
npm run import -- --overwrite-maps dark
npm run import -- --repo oktechjp/public --commit <sha>
```

### Clear Subcommand (same CLI)

```bash
npm run import -- clear markdown       # All markdown files (events + venues)
npm run import -- clear events         # Event markdown only
npm run import -- clear venues         # Venue markdown only
npm run import -- clear image-files    # Event images (covers + gallery)
npm run import -- clear cover-images   # Event cover images only
npm run import -- clear image-metadata # Gallery YAML / JSON sidecars
npm run import -- clear images         # All gallery assets + metadata
npm run import -- clear maps           # Venue map outputs
npm run import -- clear empty-dirs     # Prune empty folders
npm run import -- clear all            # Run every strategy + empty dir sweep
```

`Cleaner.getValidTargets()` drives the valid values, so check `npm run import -- help` if unsure.

## Photo & Gallery Handling

- Photo batches marked `removed` or `instructional` are skipped automatically.
- Images are downloaded through the GitHub service, resized with Sharp (max width 1920px, aspect preserved), converted to WebP (`imageQuality` default 85), and written to `gallery/`.
- Captions become YAML files (`<image>.yaml`) alongside the WebP images.
- Stale gallery files are deleted; empty gallery directories are removed.

## Maps & Venues

- Venue markdown is generated with normalized city names, coordinates, Google Maps URLs, and Meetup IDs.
- `MapService.generateMaps` produces `map.jpg` and `map-dark.jpg` using the configured providers (`defaultProvider` / `darkModeProvider`). Providers that require API keys (e.g. Stadia) validate the key before rendering.
- Use `--overwrite-maps` to regenerate outputs when switching map providers or fixing corrupted assets.

## Metadata Output

`content/meta.json` includes:

- `commitDate` / `commitHash` – Source commit information.
- `contentHash` – SHA256 hash of the raw JSON payloads (matches CI behaviour).
- `repository` – URL of the data repo.
- `nextEventEnds` / `nextEventSlug` – Calculated from upcoming events using `@/utils/eventFilters`. Useful for countdowns or cache busting.

## Configuration Snapshot (`lib/config.ts`)

```typescript
export const config = {
  github: {
    repo: "oktechjp/public",
    defaultRef: "refs/heads/main",
    getApiUrl: (endpoint, repo = "oktechjp/public") =>
      `https://api.github.com/repos/${repo}${endpoint}`,
  },
  paths: {
    content: "content",
    events: "content/events",
    venues: "content/venues",
  },
  features: {
    parallelDownloads: 5,
    maxImageWidth: 1920,
    imageQuality: 85,
  },
  photoEventPatches: {
    1676970780777: "291352411",
  },
  maps: {
    providers: {
      openstreetmap: {
        /* … */
      },
      carto: {
        /* … */
      },
      stadiaWaterColor: {
        /* … requires key */
      },
    },
    defaultProvider: "stadiaWaterColor",
    darkModeProvider: "stadiaAlidadeSmoothDark",
    defaultOptions: { width: 1024, height: 1024, zoom: 15, type: "jpeg", quality: 90 },
  },
  api: {
    stadiaApiKey: process.env.STADIA_MAPS_API_KEY,
  },
} as const;
```

Update `photoEventPatches` when photo batches need manual assignment, or adjust map providers if you switch tile services.

## Environment Variables

Create `.env.local` (auto-loaded) or configure CI secrets:

```bash
STADIA_MAPS_API_KEY=your_key   # Required for Stadia map providers
GITHUB_TOKEN=ghp_xxx           # Optional; helps avoid API rate limits in CI
```
