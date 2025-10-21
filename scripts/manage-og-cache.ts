import { OGImageCache } from "../src/utils/og/ogCache";

async function main() {
  const cache = new OGImageCache();
  const command = process.argv[2];

  switch (command) {
    case "clear":
      await cache.clearCache();
      break;
    case "stats":
      const stats = await cache.getCacheStats();
      console.log(`Cache statistics:`);
      console.log(`  Images: ${stats.count}`);
      console.log(`  Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
      break;
    default:
      console.log("Usage: npm run og-cache <command>");
      console.log("Commands:");
      console.log("  clear  - Clear all cached OG images");
      console.log("  stats  - Show cache statistics");
  }
}

main().catch(console.error);
