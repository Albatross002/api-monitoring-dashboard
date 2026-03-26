import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Deeper trends and reports (beyond the home dashboard).</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Connect this route to aggregated metrics from your FastAPI service.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Home already shows response time and uptime charts. Use this area for filters, exports, and
            team-wide analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
