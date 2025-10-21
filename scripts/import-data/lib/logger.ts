/**
 * Logger module for import scripts
 * Provides consistent logging with timestamps and different log levels
 */

enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
  DEBUG = "DEBUG",
}

const COLORS = {
  [LogLevel.INFO]: "\x1b[36m", // Cyan
  [LogLevel.WARN]: "\x1b[33m", // Yellow
  [LogLevel.ERROR]: "\x1b[31m", // Red
  [LogLevel.SUCCESS]: "\x1b[32m", // Green
  [LogLevel.DEBUG]: "\x1b[90m", // Gray
  RESET: "\x1b[0m",
  BOLD: "\x1b[1m",
};

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString().replace("T", " ").slice(0, -5);
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    const timestamp = this.getTimestamp();
    const color = COLORS[level];
    const prefix = `${COLORS.BOLD}[${timestamp}] ${color}${level}${COLORS.RESET}`;

    // Use process.stdout.write for consistent output
    process.stdout.write(`${prefix} ${message}\n`);

    // Log additional arguments if provided
    if (args.length > 0) {
      args.forEach((arg) => {
        if (typeof arg === "object") {
          process.stdout.write(`  ${JSON.stringify(arg, null, 2)}\n`);
        } else {
          process.stdout.write(`  ${arg}\n`);
        }
      });
    }
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  success(message: string, ...args: any[]): void {
    this.log(LogLevel.SUCCESS, message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  // Progress logging for batch operations
  progress(current: number, total: number, message: string): void {
    const percentage = Math.round((current / total) * 100);
    const progressBar = this.createProgressBar(percentage);
    process.stdout.write(`\r${progressBar} ${percentage}% - ${message}`);

    if (current === total) {
      process.stdout.write("\n");
    }
  }

  private createProgressBar(percentage: number): string {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return `[${COLORS[LogLevel.SUCCESS]}${"█".repeat(filled)}${COLORS.RESET}${" ".repeat(empty)}]`;
  }

  // Clear line for updating progress
  clearLine(): void {
    process.stdout.write("\r\x1b[K");
  }

  // Separator for visual organization
  separator(): void {
    process.stdout.write(`${COLORS[LogLevel.INFO]}${"─".repeat(60)}${COLORS.RESET}\n`);
  }

  // Section header for grouping related logs
  section(title: string): void {
    this.separator();
    this.info(`▶ ${title.toUpperCase()}`);
    this.separator();
  }
}

// Export singleton instance
export const logger = new Logger();
