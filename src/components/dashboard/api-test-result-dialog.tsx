import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { TestApiResult } from "@/api/monitors"

interface ApiTestResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: TestApiResult | null
}

export function ApiTestResultDialog({ open, onOpenChange, result }: ApiTestResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-4">
        <DialogHeader>
          <DialogTitle>API Test Result</DialogTitle>
        </DialogHeader>
        {result ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium tabular-nums">
                  {result.status} {result.statusText}
                </p>
                {result.status === 0 ? (
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    No HTTP status returned to the browser (often CORS/network). Check the response body
                    below for details.
                  </p>
                ) : null}
              </div>
              <div>
                <p className="text-muted-foreground">Response time</p>
                <p className="font-medium tabular-nums">{result.responseTimeMs} ms</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-muted-foreground">Response body</p>
              <pre className="max-h-48 overflow-auto rounded-md border bg-muted/50 p-3 text-xs leading-relaxed">
                {result.body}
              </pre>
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button
            className="bg-emerald-600 hover:bg-emerald-600/90"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
