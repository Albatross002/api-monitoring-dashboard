import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { useMonitorsQuery } from "@/hooks/use-monitors"
import { formatRelativeTime } from "@/lib/format-relative"
import type { ApiHealthStatus } from "@/api/monitors"

function statusBadge(status: ApiHealthStatus) {
  switch (status) {
    case "healthy":
      return <Badge variant="success">Healthy</Badge>
    case "degraded":
      return <Badge variant="warning">Degraded</Badge>
    case "down":
      return <Badge variant="destructive">Down</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function DashboardHome() {
  const { data: monitors = [], isLoading } = useMonitorsQuery()

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Loading dashboard…
      </div>
    )
  }

  if (monitors.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Welcome to PulseAPI!
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          No APIs added yet. Start by adding your first API to monitor.
        </p>
        <Button asChild className="mt-8 gap-2" size="lg">
          <Link to="/apis/new">
            <Plus className="size-5" />
            Add API
          </Link>
        </Button>
      </div>
    )
  }

  const total = monitors.length
  const failed = monitors.filter((m) => m.status === "down").length
  const active = monitors.filter((m) => m.status !== "down").length
  const avgMs = Math.round(
    monitors.reduce((acc, m) => acc + m.responseTimeMs, 0) / Math.max(total, 1)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your monitored endpoints</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total APIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{total}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">All registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active APIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{active}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Healthy or degraded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed APIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{failed}</p>
            <p className="text-xs text-destructive">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg response time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{avgMs} ms</p>
            <p className="text-xs text-muted-foreground">Across last probes</p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts seed={total} />

      <Card>
        <CardHeader>
          <CardTitle>API status</CardTitle>
          <CardDescription>Latest health checks</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>API name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Response time</TableHead>
                <TableHead className="text-right">Last checked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monitors.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{statusBadge(row.status)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.responseTimeMs} ms
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatRelativeTime(row.lastChecked)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
