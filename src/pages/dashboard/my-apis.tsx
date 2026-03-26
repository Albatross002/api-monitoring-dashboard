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
import { useMonitorsQuery } from "@/hooks/use-monitors"
import { formatRelativeTime } from "@/lib/format-relative"
import { Badge } from "@/components/ui/badge"
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

export function MyApisPage() {
  const { data: monitors = [], isLoading } = useMonitorsQuery()

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My APIs</h1>
          <p className="text-muted-foreground">Endpoints you are monitoring</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/apis/new">
            <Plus className="size-4" />
            Add API
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered APIs</CardTitle>
          <CardDescription>Manage from the dashboard or add new monitors.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : monitors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No APIs yet.{" "}
              <Link to="/apis/new" className="font-medium text-primary underline-offset-4 hover:underline">
                Add your first API
              </Link>
              .
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Last checked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monitors.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.method}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {m.url}
                    </TableCell>
                    <TableCell>{statusBadge(m.status)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatRelativeTime(m.lastChecked)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
