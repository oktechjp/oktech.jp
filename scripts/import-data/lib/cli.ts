import { Cleaner, type ClearTarget } from "./cleaner";
import { Importer } from "./importer";
import { logger } from "./logger";

/**
 * Parse command line arguments into options object
 */
function parseArgs(args: string[]): Record<string, string | boolean> {
  const options: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith("--")) {
        options[key] = nextArg;
        i++; // Skip next arg
      } else {
        options[key] = true;
      }
    }
  }

  return options;
}

/**
 * Display help information
 */
function showHelp(): void {
  logger.info("Osaka Tech Import Tool");
  logger.info("");
  logger.info("Usage:");
  logger.info("  npm run import [options]                    - Import events and venues from JSON");
  logger.info("  npm run import -- clear <type>              - Clear specific data");
  logger.info("");
  logger.info("Import Options:");
  logger.info("  --overwrite-maps                  Regenerate all existing venue maps");
  logger.info(
    "  --overwrite-maps <theme>          Regenerate only light or dark maps (theme: light|dark)",
  );
  logger.info(
    "  --repo <owner/repo>               Use custom GitHub repository (default: oktechjp/public)",
  );
  logger.info("  --commit <sha>                    Use specific commit SHA instead of latest");
  logger.info("");
  logger.info("Clear Types:");
  logger.info("  markdown         Clear all markdown files (events and venues)");
  logger.info("  events           Clear event markdown files");
  logger.info("  venues           Clear venue markdown files");
  logger.info("  image-files      Clear image files");
  logger.info("  image-metadata   Clear image metadata files");
  logger.info("  images           Clear images (files and metadata)");
  logger.info("  maps             Clear venue map files");
  logger.info("  empty-dirs       Clear empty directories");
  logger.info("  all              Clear all data");
  logger.info("");
  logger.info("Examples:");
  logger.info("  npm run import");
  logger.info("  npm run import -- --overwrite-maps");
  logger.info("  npm run import -- --overwrite-maps light");
  logger.info("  npm run import -- clear all");
  logger.info("  npm run import -- clear events");
}

/**
 * Handle clear command
 */
async function handleClear(target: string): Promise<void> {
  const validTargets = Cleaner.getValidTargets();

  if (!validTargets.includes(target)) {
    logger.error(`Unknown clear type: ${target}`);
    logger.error("");
    logger.error(`Valid clear types: ${validTargets.join(", ")}`);
    process.exit(1);
  }

  const cleaner = new Cleaner();
  await cleaner.clear(target as ClearTarget);
}

/**
 * Handle import command
 */
async function handleImport(args: string[]): Promise<void> {
  const options = parseArgs(args);

  // Validate known options
  const validOptions = ["overwrite-maps", "repo", "commit"];
  for (const key of Object.keys(options)) {
    if (!validOptions.includes(key)) {
      logger.error(`Unknown option: --${key}`);
      logger.error("");
      logger.error("Valid options:");
      logger.error("  --overwrite-maps              - Regenerate all maps");
      logger.error("  --overwrite-maps <theme>      - Regenerate light or dark maps");
      logger.error("  --repo <owner/repo>           - Use custom GitHub repository");
      logger.error("  --commit <sha>                - Use specific commit SHA");
      logger.error("");
      logger.error("Use --help for more information");
      process.exit(1);
    }
  }

  // Validate overwrite-maps value if provided
  if (
    options["overwrite-maps"] &&
    typeof options["overwrite-maps"] === "string" &&
    options["overwrite-maps"] !== "light" &&
    options["overwrite-maps"] !== "dark"
  ) {
    logger.error(`Invalid value for --overwrite-maps: ${options["overwrite-maps"]}`);
    logger.error("Valid values: light, dark (or omit for both)");
    process.exit(1);
  }

  // Determine map overwrite setting
  let overwriteMaps: boolean | "light" | "dark" = false;
  if (options["overwrite-maps"] === true) {
    overwriteMaps = true;
  } else if (options["overwrite-maps"] === "light" || options["overwrite-maps"] === "dark") {
    overwriteMaps = options["overwrite-maps"] as "light" | "dark";
  }

  const importOptions = {
    overwriteMaps,
    customRepo: options["repo"] as string | undefined,
    customCommit: options["commit"] as string | undefined,
  };

  const importer = new Importer();
  await importer.run(importOptions);
}

/**
 * Main CLI entry point
 */
export async function runCLI(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  // If help flag is explicitly requested, show help
  if (command === "--help" || command === "-h") {
    showHelp();
    process.exit(0);
  }

  try {
    // Handle clear command
    if (command === "clear") {
      const clearType = args[1];
      if (!clearType) {
        logger.error("Please specify what to clear.");
        logger.error("");
        logger.error("Usage: npm run import -- clear <type>");
        logger.error(`Valid types: ${Cleaner.getValidTargets().join(", ")}`);
        process.exit(1);
      }
      await handleClear(clearType);
    } else if (!command || command.startsWith("--")) {
      // No command or starts with -- means it's import with options
      await handleImport(args);
    } else {
      // Unknown command
      logger.error(`Unknown command: ${command}`);
      logger.error("");
      logger.error("Valid commands:");
      logger.error("  npm run import                    - Run import");
      logger.error("  npm run import -- --help          - Show help");
      logger.error("  npm run import -- clear <type>    - Clear data");
      logger.error("");
      logger.error("Did you mean '--help' instead of 'help'?");
      process.exit(1);
    }
  } catch (error) {
    logger.error("Operation failed:", error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}
