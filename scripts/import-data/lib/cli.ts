import { Command, CommanderError, InvalidArgumentError } from "commander";

import { Cleaner, type ClearTarget } from "./cleaner";
import { Importer } from "./importer";
import { logger } from "./logger";

type OverwriteOption = boolean | "light" | "dark";

type ImportCLIOptions = {
  overwriteMaps: OverwriteOption;
  customRepo?: string;
  customCommit?: string;
};

const VALID_MAP_THEMES = new Set<Extract<OverwriteOption, string>>(["light", "dark"]);

function parseOverwrite(theme: string | undefined): OverwriteOption {
  if (theme === undefined) {
    // Flag provided without value
    return true;
  }

  const normalized = theme.trim().toLowerCase();
  if (VALID_MAP_THEMES.has(normalized as Extract<OverwriteOption, string>)) {
    return normalized as Extract<OverwriteOption, string>;
  }

  throw new InvalidArgumentError(
    `Invalid value for --overwrite-maps: ${theme}. Expected "light" or "dark".`,
  );
}

function toImporterOptions(options: {
  overwriteMaps?: OverwriteOption;
  repo?: string;
  commit?: string;
}): ImportCLIOptions {
  const overwriteValue = options.overwriteMaps ?? false;

  return {
    overwriteMaps: overwriteValue,
    customRepo: options.repo,
    customCommit: options.commit,
  };
}

async function runImport(options: ImportCLIOptions): Promise<void> {
  const importer = new Importer();
  await importer.run({
    overwriteMaps: options.overwriteMaps,
    customRepo: options.customRepo,
    customCommit: options.customCommit,
  });
}

async function runClear(target: string): Promise<void> {
  const validTargets = Cleaner.getValidTargets();
  if (!validTargets.includes(target)) {
    logger.error(`Unknown clear type "${target}"`);
    logger.error(`Valid types: ${validTargets.join(", ")}`);
    process.exit(1);
  }

  const cleaner = new Cleaner();
  await cleaner.clear(target as ClearTarget);
}

export async function runCLI(): Promise<void> {
  const clearTargets = Cleaner.getValidTargets();
  const program = new Command("oktech-import");

  program
    .description("OKTech Website Import Tool")
    .helpOption("-h, --help", "Show help")
    .addHelpText("after", () => {
      const lines = [
        "",
        `Valid clear types: ${clearTargets.join(", ")}`,
        "",
        "Examples:",
        "  npm run import",
        "  npm run import -- --overwrite-maps",
        "  npm run import -- --overwrite-maps light",
        "  npm run import -- --repo oktechjp/public --commit <sha>",
        "  npm run import -- clear all",
        "",
      ];

      return lines.join("\n");
    });

  program
    .option(
      "--overwrite-maps [theme]",
      "Regenerate venue maps (theme: light|dark, omit for both)",
      parseOverwrite,
    )
    .option("--repo <owner/repo>", "Use custom GitHub repository (default: oktechjp/public)")
    .option("--commit <sha>", "Use specific commit SHA instead of latest")
    .allowUnknownOption(false)
    .action(async (rawOptions) => {
      try {
        const importOptions = toImporterOptions(rawOptions);
        await runImport(importOptions);
      } catch (error) {
        logger.error("Import failed:", error);
        if (error instanceof Error && error.stack) {
          console.error(error.stack);
        }
        process.exit(1);
      }
    });

  program
    .command("clear <type>")
    .description("Clear generated content or assets")
    .action(async (target: string) => {
      try {
        await runClear(target);
      } catch (error) {
        logger.error("Clear operation failed:", error);
        if (error instanceof Error && error.stack) {
          console.error(error.stack);
        }
        process.exit(1);
      }
    });

  program
    .command("help")
    .description("Show help")
    .action(() => {
      logger.info(`Valid clear types: ${clearTargets.join(", ")}`);
      program.outputHelp();
    });

  program.showHelpAfterError();

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    if (error instanceof InvalidArgumentError || error instanceof CommanderError) {
      logger.error(error.message);
      program.outputHelp();
      process.exit(1);
    }
    throw error;
  }
}
