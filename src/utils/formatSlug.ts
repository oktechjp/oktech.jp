export function replaceDate(slug: string): string {
  return slug.replace(/-\d{4}-\d{2}-\d{2}$/, "");
}
