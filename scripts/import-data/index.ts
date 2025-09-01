import { handleClear } from "./lib/clear";
import { handleImport } from "./lib/import";
import { logger } from "./lib/logger";
import { handleRemoveFields, showRemoveFieldsHelp } from "./lib/remove-fields";

function showHelp() {
  logger.info("Osaka Tech Import Tool");
  logger.info("");
  logger.info("Usage:");
  logger.info(
    "  npm run import [options]                              - Import events and venues from JSON",
  );
  logger.info("  npm run import -- clear <type>                        - Clear specific data");
  logger.info(
    "  npm run import -- remove-fields <type> [options]      - Remove fields from content files",
  );
  logger.info("");
  logger.info("Import Options:");
  logger.info("  --overwrite-maps                  Regenerate all existing venue maps");
  logger.info(
    "  --overwrite-maps-theme <theme>    Regenerate only light or dark maps (theme: light|dark)",
  );
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
  showRemoveFieldsHelp();
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // If help flag is explicitly requested, show help
  if (command === "--help" || command === "-h") {
    showHelp();
    process.exit(0);
  }

  // Handle clear command
  if (command === "clear") {
    const clearType = args[1];
    if (!clearType) {
      logger.error("Please specify what to clear.");
      logger.error("");
      logger.error("Usage: npm run import -- clear <type>");
      logger.error(
        "Valid types: markdown, events, venues, image-files, image-metadata, images, maps, empty-dirs, all",
      );
      process.exit(1);
    }
    await handleClear(clearType);
    return;
  }

  // Handle remove-fields command
  if (command === "remove-fields") {
    await handleRemoveFields(args);
    return;
  }

  // Default to import command (no args or flags like --overwrite-maps)
  await handleImport(args);
}

main()
  .then(() => {
    // Explicitly exit on success to ensure the process terminates
    process.exit(0);
  })
  .catch((err) => {
    logger.error("Operation failed:", err);
    if (err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  });
