import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ApiTestResultDialog } from "@/components/dashboard/api-test-result-dialog"
import { parseCurlSnippet, type TestApiResult } from "@/api/monitors"
import { useSaveMonitorMutation, useTestMonitorMutation } from "@/hooks/use-monitors"
import { cn } from "@/lib/utils"

const curlSchema = z.object({
  curl: z.string().min(1, "Paste a cURL command"),
})

const manualSchema = z.object({
  name: z.string().optional(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  url: z.string().url("Enter a valid URL (include https://)"),
})

type CurlFormValues = z.infer<typeof curlSchema>
type ManualFormValues = z.infer<typeof manualSchema>

const defaultCurl = `curl -X GET "https://api.example.com/data" -H "Authorization: Bearer xyz123"`

export function AddApiPage() {
  const [tab, setTab] = useState<"curl" | "manual">("curl")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [testResult, setTestResult] = useState<TestApiResult | null>(null)
  const [formError, setFormError] = useState("")

  const testMutation = useTestMonitorMutation()
  const saveMutation = useSaveMonitorMutation()
  const busy = testMutation.isPending || saveMutation.isPending

  const curlForm = useForm<CurlFormValues>({
    resolver: zodResolver(curlSchema),
    defaultValues: { curl: defaultCurl },
  })

  const manualForm = useForm<ManualFormValues>({
    resolver: zodResolver(manualSchema),
    defaultValues: { method: "GET", url: "", name: "" },
  })

  async function onCurlSubmit(values: CurlFormValues) {
    setFormError("")
    const parsed = parseCurlSnippet(values.curl)
    if (!parsed.ok) {
      setFormError(parsed.message)
      return
    }
    try {
      const result = await testMutation.mutateAsync({
        method: parsed.method,
        url: parsed.url,
        headers: parsed.headers,
        body: parsed.body,
        curlRaw: values.curl,
      })
      await saveMutation.mutateAsync({
        method: parsed.method,
        url: parsed.url,
        result,
      })
      setTestResult(result)
      setDialogOpen(true)
    } catch {
      setFormError("Could not reach the API. If you use a real URL, ensure CORS/backend allows it.")
    }
  }

  async function onManualSubmit(values: ManualFormValues) {
    setFormError("")
    try {
      const result = await testMutation.mutateAsync({
        method: values.method,
        url: values.url,
      })
      await saveMutation.mutateAsync({
        method: values.method,
        url: values.url,
        name: values.name,
        result,
      })
      setTestResult(result)
      setDialogOpen(true)
    } catch {
      setFormError("Could not reach the API. If you use a real URL, ensure CORS/backend allows it.")
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New API</CardTitle>
          <CardDescription>Paste a cURL command or define the request manually.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as "curl" | "manual")
              setFormError("")
            }}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="curl">cURL Input</TabsTrigger>
              <TabsTrigger value="manual">Manual Setup</TabsTrigger>
            </TabsList>

            <TabsContent value="curl" className="mt-6 space-y-4">
              <form onSubmit={curlForm.handleSubmit(onCurlSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="curl">cURL</Label>
                  <Textarea
                    id="curl"
                    className="min-h-[200px] font-mono text-xs md:text-sm"
                    {...curlForm.register("curl")}
                  />
                  {curlForm.formState.errors.curl?.message ? (
                    <p className="text-sm text-destructive">
                      {curlForm.formState.errors.curl.message}
                    </p>
                  ) : null}
                </div>
                {formError && tab === "curl" ? (
                  <p className="text-sm text-destructive">{formError}</p>
                ) : null}
                <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={busy}>
                  {busy ? "Working…" : "Parse & Test"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="manual" className="mt-6 space-y-4">
              <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiName">API name (optional)</Label>
                  <Input
                    id="apiName"
                    placeholder="Payment API"
                    {...manualForm.register("name")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Method</Label>
                  <select
                    id="method"
                    className={cn(
                      "flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm",
                      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                    {...manualForm.register("method")}
                  >
                    {(["GET", "POST", "PUT", "PATCH", "DELETE"] as const).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://api.example.com/health"
                    autoComplete="off"
                    {...manualForm.register("url")}
                  />
                </div>
                {manualForm.formState.errors.url?.message ? (
                  <p className="text-sm text-destructive">
                    {manualForm.formState.errors.url.message}
                  </p>
                ) : null}
                {formError && tab === "manual" ? (
                  <p className="text-sm text-destructive">{formError}</p>
                ) : null}
                <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={busy}>
                  {busy ? "Working…" : "Parse & Test"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ApiTestResultDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        result={testResult}
      />
    </div>
  )
}
