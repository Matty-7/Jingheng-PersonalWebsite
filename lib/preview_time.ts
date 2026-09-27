export function preview_time(seconds: number): string {
  const safe_seconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  return `${Math.floor(safe_seconds / 60)}:${String(Math.floor(safe_seconds % 60)).padStart(2, '0')}`;
}
