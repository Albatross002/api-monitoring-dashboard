import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Subscription and usage for PulseAPI.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Placeholder</CardTitle>
          <CardDescription>Integrate Stripe or Azure Marketplace billing here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page matches your navigation shell; connect it to your billing provider when you
            deploy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
