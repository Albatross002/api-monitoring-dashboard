export function getHeaderTitle(pathname: string): string {
  if (pathname.startsWith("/apis/new")) return "Add New API"
  if (pathname.startsWith("/apis")) return "My APIs"
  if (pathname.startsWith("/logs")) return "Logs"
  if (pathname.startsWith("/analytics")) return "Analytics"
  if (pathname.startsWith("/billing")) return "Billing"
  if (pathname.startsWith("/settings")) return "Settings"
  return "Dashboard"
}
