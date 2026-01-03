export function shouldShowSeasonalSnow(): boolean {
  const now = new Date();
  const isDecember = now.getMonth() === 11;
  const isSecondHalf = now.getDate() >= 15;
  return isDecember && isSecondHalf;
}
