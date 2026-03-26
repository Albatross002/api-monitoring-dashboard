import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function pulseApiProxyPlugin() {
  return {
    name: "pulse-api-proxy",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith("/__pulse_proxy")) return next()
        if (req.method !== "POST") {
          res.statusCode = 405
          res.end("Method not allowed")
          return
        }

        let raw = ""
        req.on("data", (chunk) => {
          raw += chunk
        })

        req.on("end", async () => {
          try {
            const payload = raw ? JSON.parse(raw) : {}
            const method = String(payload.method ?? "GET").toUpperCase()
            const url = String(payload.url ?? "")
            const headers = payload.headers && typeof payload.headers === "object" ? payload.headers : {}
            const body = typeof payload.body === "string" ? payload.body : undefined

            if (!/^https?:\/\//i.test(url)) {
              res.statusCode = 200
              res.setHeader("Content-Type", "application/json; charset=utf-8")
              res.end(JSON.stringify({ status: 0, statusText: "Invalid URL", body: "" }))
              return
            }

            const upstreamRes = await fetch(url, {
              method,
              headers,
              body,
            })

            const text = await upstreamRes.text()
            res.statusCode = 200
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(
              JSON.stringify({
                status: upstreamRes.status,
                statusText: upstreamRes.statusText,
                body: text,
              })
            )
          } catch (e) {
            const message = e instanceof Error ? e.message : String(e)
            res.statusCode = 200
            res.setHeader("Content-Type", "application/json; charset=utf-8")
            res.end(
              JSON.stringify({
                status: 0,
                statusText: "Proxy failed",
                body: message,
              })
            )
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [pulseApiProxyPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
