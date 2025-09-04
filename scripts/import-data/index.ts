import { runCLI } from "./lib/cli";
import { logger } from "./lib/logger";

// Run the CLI
runCLI()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    logger.error("Fatal error:", err);
    if (err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  });
