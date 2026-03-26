export function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return "—"
  const diff = Date.now() - t
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return "Just now"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`
  const d = Math.floor(hr / 24)
  return `${d} day${d === 1 ? "" : "s"} ago`
}
