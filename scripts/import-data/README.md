# Import Data Script

This CLI tool imports event and venue data from external JSON sources and processes them into the local content structure for the OKTech website.

## Data Sources

The script fetches data from GitHub-hosted JSON files:

- **[Events and Venues](https://github.com/oktechjp/public/blob/main/events.json)**: Contains event metadata and venue information
- **[Photos](https://github.com/oktechjp/public/blob/main/photos.json)**: Photo batches with optional event associations

## Architecture

```
scripts/import-data/
├── index.ts           # Entry point
├── lib/
│   ├── cli.ts         # CLI interface and command handling
│   ├── config.ts      # Configuration and constants
│   ├── importer.ts    # Main import orchestrator
│   ├── processor.ts   # Content processors (events/venues)
│   ├── cleaner.ts     # Data cleanup utilities
│   ├── github.ts      # GitHub API service
│   ├── maps.ts        # Static map generation
│   ├── photos.ts      # Photo processing service
│   └── logger.ts      # Logging utilities
└── README.md
```

## Core Features

### Import Pipeline

1. **Fetch**: Retrieves latest data from GitHub repository
2. **Process**: Transforms and validates data
3. **Generate**: Creates markdown files, downloads images, generates maps
4. **Report**: Displays comprehensive statistics

### Photo Assignment

Photos are assigned to events through a configuration-based system:

1. **Explicit Assignment**: Photos with event IDs are directly assigned
2. **Manual Patches**: Photo-to-event mappings defined in `lib/config.ts`:
   ```typescript
   photoEventPatches: {
     1676970780777: "291352411",  // Maps photo batch timestamp to event ID
     // ...
   }
   ```

### Content Processing

- **Events**: Creates structured markdown with frontmatter, manages photo galleries
  - Processes cover images with Sharp for consistent encoding
  - Maintains frontmatter field order for zero-diff builds
  - Skips existing images to avoid re-processing
- **Venues**: Generates venue pages with maps (light and dark themes)
  - Static map generation with configurable providers
  - Supports both free and API-key based providers

Note: Venues are automatically generated, but descriptions and `hasPage` flags must be added manually.

### Image Processing

All images are processed with Sharp for:

- Consistent WebP encoding at 85% quality
- Maximum width of 1920px (configurable)
- Preservation of aspect ratio
- Existing images are skipped to maintain consistency

## Usage

### Import Commands

```bash
# Standard import
npm run import

# Show help
npm run import -- --help

# Regenerate all maps (if you change both dark and light providers)
npm run import -- --overwrite-maps

# Regenerate specific theme maps (if you change the provider for just one theme)
npm run import -- --overwrite-maps light
npm run import -- --overwrite-maps dark
```

### Clear Commands

```bash
# Clear specific data types
npm run import -- clear markdown        # All markdown files
npm run import -- clear events          # Event files only
npm run import -- clear venues          # Venue files only
npm run import -- clear image-files     # Image files only
npm run import -- clear image-metadata  # Image metadata only
npm run import -- clear images          # All images and metadata
npm run import -- clear maps            # Venue maps
npm run import -- clear empty-dirs      # Empty directories
npm run import -- clear all             # Complete reset
```

## Configuration

Configuration is centralized in `lib/config.ts`:

```typescript
{
  github: {
    repo: 'oktechjp/public',
  },
  paths: {
    content: 'content',
    events: 'content/events',
    venues: 'content/venues',
  },
  features: {
    parallelDownloads: 5,     // Concurrent download limit
    maxImageWidth: 1920,      // Maximum image width for resizing
    imageQuality: 85,         // WebP compression quality
  },
  photoEventPatches: {
    // Manual photo-to-event assignments, e.g. for photos that don't have an event ID:
    // [batchTimestamp]: "eventId"
    1676970780777: "291352411",
  },
  maps: {
    defaultProvider: 'stadiaWaterColor',
    darkModeProvider: 'stadiaAlidadeSmoothDark',
    defaultOptions: {
      width: 1024,
      height: 1024,
      zoom: 15,
      type: 'jpeg',
      quality: 90,
    }
  }
}
```

### Map Providers

Available map providers (configured in `lib/config.ts`):

**Free Providers:**

- `openstreetmap` - Standard OSM tiles
- `carto` - Voyager style
- `cartoPositron` - Light theme
- `cartoDarkMatter` - Dark theme

**API Key Required:**

- `stadiaWaterColor` - Watercolor style (default)
- `stadiaAlidadeSmoothDark` - Dark theme (dark mode default)

You can find more providers here: https://leaflet-extras.github.io/leaflet-providers/preview/

## Environment Variables

Optional environment configuration in `.env.local`:

```bash
# Map provider API key (required for Stadia Maps)
STADIA_MAPS_API_KEY=your_key_here

# GitHub token (only needed in CI environment)
GITHUB_TOKEN=your_token_here
```

## Development

### Project Structure

- **Entry Point**: `index.ts` - Minimal entry point that calls the CLI
- **CLI**: `lib/cli.ts` - Command parsing, validation, and routing
- **Orchestration**: `lib/importer.ts` - Coordinates the import pipeline
- **Processing**: `lib/processor.ts` - Base class and implementations for content processing
- **Services**:
  - `lib/github.ts` - GitHub API interactions
  - `lib/photos.ts` - Photo processing and gallery management
  - `lib/maps.ts` - Static map generation
- **Utilities**:
  - `lib/cleaner.ts` - File cleanup strategies
  - `lib/logger.ts` - Colored console output
