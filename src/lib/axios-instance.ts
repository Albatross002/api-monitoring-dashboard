import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? ""

/** Axios instance for your FastAPI backend (set `VITE_API_URL` in `.env`). */
export const apiClient = axios.create({
  baseURL: baseURL || undefined,
  headers: { "Content-Type": "application/json" },
  timeout: 60_000,
})

export function isApiConfigured(): boolean {
  return Boolean(baseURL)
}
