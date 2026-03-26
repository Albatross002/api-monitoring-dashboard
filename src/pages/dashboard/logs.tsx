import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Logs</h1>
        <p className="text-muted-foreground">Request and probe history will appear here.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Wire this view to your FastAPI logs or Azure Application Insights when the backend is
            ready.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Until then, dashboard monitors are stored locally or returned from your API when{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">VITE_API_URL</code> is set.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
