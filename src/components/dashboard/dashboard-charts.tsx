import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function seededJitter(seed: number, i: number) {
  const x = Math.sin(seed * 999 + i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export function DashboardCharts({ seed = 1 }: { seed?: number }) {
  const responseSeries = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        t: `${i * 2}m`,
        ms: Math.round(220 + Math.sin(i / 2) * 60 + seededJitter(seed, i) * 55),
      })),
    [seed]
  )

  const uptimeSeries = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        up: Math.round(92 + seededJitter(seed, i + 10) * 8),
        down: Math.round(seededJitter(seed, i + 20) * 12),
      })),
    [seed]
  )

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Response time</CardTitle>
          <CardDescription>Trend across recent checks</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px] pl-0 pr-2 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={responseSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" width={48} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-card)",
                }}
              />
              <Line
                type="monotone"
                dataKey="ms"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Uptime & failures</CardTitle>
          <CardDescription>Weekly availability vs errors</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px] pl-0 pr-2 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={uptimeSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" width={36} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-card)",
                }}
              />
              <Bar dataKey="up" fill="rgb(16 185 129)" name="Uptime %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="down" fill="rgb(239 68 68)" name="Failures %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
