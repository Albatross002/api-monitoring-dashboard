import { apiClient, isApiConfigured } from "@/lib/axios-instance"

export type ApiHealthStatus = "healthy" | "degraded" | "down"

export interface MonitoredApi {
  id: string
  name: string
  method: string
  url: string
  status: ApiHealthStatus
  responseTimeMs: number
  lastChecked: string
  createdAt: string
}

export interface TestApiResult {
  status: number
  statusText: string
  responseTimeMs: number
  body: string
}

const STORAGE_KEY = "pulseapi-monitors"

type ParsedCurl =
  | {
      ok: false
      message: string
    }
  | {
      ok: true
      method: string
      url: string
      headers?: Record<string, string>
      body?: string
    }

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function readLocal(): MonitoredApi[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as MonitoredApi[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocal(apis: MonitoredApi[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apis))
}

function defaultNameFromUrl(url: string): string {
  try {
    const u = new URL(url)
    const parts = u.pathname.split("/").filter(Boolean)
    const last = parts[parts.length - 1]
    return last ? `${last[0].toUpperCase()}${last.slice(1)} API` : `${u.hostname} API`
  } catch {
    return "New API"
  }
}

/** List monitors — uses GET `/monitors` when API is configured, else localStorage. */
export async function fetchMonitors(): Promise<MonitoredApi[]> {
  await delay(200)
  if (isApiConfigured()) {
    const { data } = await apiClient.get<MonitoredApi[]>("/monitors")
    return data
  }
  return readLocal()
}

export async function saveMonitorFromTest(input: {
  method: string
  url: string
  name?: string
  result: TestApiResult
}): Promise<MonitoredApi[]> {
  const status: ApiHealthStatus =
    input.result.status === 0
      ? "down"
      : input.result.status >= 500
        ? "down"
        : input.result.status >= 400
          ? "degraded"
          : "healthy"
  const entry: MonitoredApi = {
    id: crypto.randomUUID(),
    name: (input.name?.trim() || defaultNameFromUrl(input.url)).slice(0, 80),
    method: input.method.toUpperCase(),
    url: input.url,
    status,
    responseTimeMs: input.result.responseTimeMs,
    lastChecked: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }

  if (isApiConfigured()) {
    await apiClient.post("/monitors", {
      name: entry.name,
      method: entry.method,
      url: entry.url,
      status: entry.status,
      response_time_ms: entry.responseTimeMs,
      last_checked: entry.lastChecked,
    })
    return fetchMonitors()
  }

  await delay(150)
  const list = readLocal()
  const next = [entry, ...list]
  writeLocal(next)
  return next
}

/** Call backend probe when configured; otherwise return a demo result. */
export async function testMonitorRequest(input: {
  method: string
  url: string
  headers?: Record<string, string>
  body?: string
  curlRaw?: string
}): Promise<TestApiResult> {
  const started = performance.now()
  if (isApiConfigured()) {
    const { data } = await apiClient.post<TestApiResult>("/monitors/test", input)
    return data
  }

  // In "no backend configured" mode, we still want real HTTP status:
  // Prefer a dev-time proxy (server-side) to avoid browser CORS.
  // Fall back to calling from the browser if proxy is not available.
  const method = input.method.toUpperCase()
  const url = input.url

  try {
    if (import.meta.env.DEV) {
      try {
        const startedProxy = performance.now()
        const proxyRes = await fetch("/__pulse_proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            (() => {
              const payload: {
                method: string
                url: string
                headers: Record<string, string>
                body?: string
              } = {
                method,
                url,
                headers: input.headers ?? {},
              }
              const b = input.body?.trim()
              if (b && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
                payload.body = b
              }
              return payload
            })()
          ),
        })
        const proxyData = (await proxyRes.json()) as {
          status: number
          statusText?: string
          body?: string
        }
        const responseTimeMs = Math.round(performance.now() - startedProxy)
        return {
          status: proxyData.status ?? 0,
          statusText: proxyData.statusText ?? "",
          responseTimeMs,
          body: proxyData.body ?? "",
        }
      } catch {
        // Proxy failed; continue to direct browser fetch.
      }
    }

    const headers = new Headers()
    for (const [k, v] of Object.entries(input.headers ?? {})) {
      if (!k.trim()) continue
      if (v == null) continue
      headers.set(k.trim(), String(v))
    }
    if (!headers.has("Accept")) headers.set("Accept", "*/*")

    const init: RequestInit = {
      method,
      headers,
      mode: "cors",
      credentials: "omit",
    }

    const body = input.body?.trim() ?? ""
    if (body && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      init.body = body
      // If the user pasted JSON, set JSON content-type when it looks like JSON.
      if (!headers.has("Content-Type") && (body.startsWith("{") || body.startsWith("["))) {
        headers.set("Content-Type", "application/json")
      }
    }

    const res = await fetch(url, init)
    const responseTimeMs = Math.round(performance.now() - started)
    const text = await res.text()
    return {
      status: res.status,
      statusText: res.statusText || (res.ok ? "OK" : "Error"),
      responseTimeMs,
      body: text || "(empty body)",
    }
  } catch (err) {
    const responseTimeMs = Math.round(performance.now() - started)
    const message = err instanceof Error ? err.message : String(err)
    return {
      status: 0,
      statusText: "No response (browser)",
      responseTimeMs,
      body: [
        "The browser could not complete this request (no HTTP status from the server).",
        "",
        `Details: ${message}`,
        "",
        "Most common causes:",
        "• CORS blocked this request (Postman ignores CORS).",
        "• DNS/network error.",
      ].join("\n"),
    }
  }
}

export function parseCurlSnippet(raw: string): ParsedCurl {
  const text = raw.trim()
  if (!text.toLowerCase().startsWith("curl")) {
    return { ok: false, message: "Paste a command that starts with `curl`." }
  }

  const allowedMethods = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"])
  const methodMatch = text.match(/-X\s+([A-Z]+)/i)
  const method = (methodMatch?.[1] ?? "GET").toUpperCase()
  if (!allowedMethods.has(method)) {
    return { ok: false, message: `Invalid HTTP method in curl: ${method}.` }
  }

  // URL: prefer quoted; fallback to first http(s) token.
  let url: string | null = null
  const quotedUrl = text.match(/([\"'])(https?:\/\/[^\"']+)\1/i)
  if (quotedUrl) {
    url = quotedUrl[2]
  } else {
    const bare = text.match(/\s(https?:\/\/[^\s"']+)/i)
    url = bare?.[1]?.replace(/[\"',;]+$/, "").trim() ?? null
  }

  if (!url) return { ok: false, message: "Could not find a valid http(s) URL in your curl." }
  if (!/^https?:\/\//i.test(url)) {
    return { ok: false, message: "URL must be absolute and start with http:// or https://." }
  }

  const headers: Record<string, string> = {}
  // Extract -H 'Key: Value' or -H "Key: Value"
  const headerMatches = Array.from(text.matchAll(/-H\s+([\"'])(.*?)\1/gi))
  for (const m of headerMatches) {
    const pair = m[2]?.trim() ?? ""
    const colon = pair.indexOf(":")
    if (colon <= 0) {
      return { ok: false, message: `Invalid header format in curl: ${pair}. Expected "Key: Value".` }
    }
    const key = pair.slice(0, colon).trim()
    const value = pair.slice(colon + 1).trim()
    if (!key) return { ok: false, message: `Invalid header key in curl: ${pair}.` }
    headers[key] = value
  }

  // Extract -d/--data JSON/raw body (quoted only).
  let body: string | undefined
  const dataMatch = text.match(
    /(?:^|\s)(?:--data-raw|--data-binary|--data|-d)\s+([\"'])([\s\S]*?)\1/i
  )
  if (dataMatch) {
    body = dataMatch[2]
  }

  if (body) {
    const trimmed = body.trim()
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        JSON.parse(trimmed)
      } catch {
        return {
          ok: false,
          message:
            "Invalid JSON payload in curl `-d/--data`. Fix the JSON format (Postman would fail/complain for invalid JSON raw bodies).",
        }
      }
    }
  }

  const out: ParsedCurl =
    Object.keys(headers).length > 0 || body
      ? {
          ok: true,
          method,
          url,
          ...(Object.keys(headers).length > 0 ? { headers } : {}),
          ...(body ? { body } : {}),
        }
      : { ok: true, method, url }

  return out
}
