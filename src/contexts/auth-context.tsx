import React, { createContext, useCallback, useContext, useState } from "react"

export interface User {
  id: string
  username: string
  email?: string
  name: string
  avatar?: string
}

interface LoginOptions {
  rememberMe?: boolean
}

interface RegisterPayload {
  fullName: string
  email: string
  password: string
}

type AuthErrorCode =
  | "UNREGISTERED_USER"
  | "EMAIL_ALREADY_REGISTERED"
  | "USERNAME_ALREADY_TAKEN"
  | "INVALID_CREDENTIALS"

export class AuthError extends Error {
  code: AuthErrorCode

  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = "AuthError"
  }
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string, options?: LoginOptions) => Promise<void>
  signup: (payload: RegisterPayload, options?: LoginOptions) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = "dashboard-auth-user"
const SESSION_KEY = "dashboard-auth-user-session"
const REGISTERED_USERS_KEY = "dashboard-auth-registered-users"

interface StoredRegisteredUser {
  id: string
  username: string
  email?: string
  name?: string
  password: string
  avatar?: string
}

function normalizeUsername(input: string): string {
  return input
    .trim()
    .toLowerCase()
    // Keep it simple for a dashboard demo: lowercase letters + numbers + underscore.
    .replace(/[^a-z0-9_]/g, "")
}

function normalizeEmail(input: string): string {
  return input.trim().toLowerCase()
}

function deriveUsernameFromFullName(fullName: string): string {
  const normalized = normalizeUsername(fullName)
  if (!normalized) return ""
  // Try to ensure the username starts with a letter when possible.
  const withLetterStart = normalized.replace(/^[^a-z]+/, "")
  return withLetterStart || normalized
}

function getRegisteredUsername(u: StoredRegisteredUser): string {
  if (u.username) return normalizeUsername(u.username)
  if (u.name) return deriveUsernameFromFullName(u.name)
  if (u.email) return normalizeUsername(u.email.split("@")[0])
  return ""
}

function migrateOldUsers() {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return
    if (parsed[0].username) return // already migrated
    const migrated: StoredRegisteredUser[] = parsed.map(
      (u: { id: string; email: string; password: string; name: string }) => ({
        id: u.id,
        username: normalizeUsername(u.email.split("@")[0]),
        email: normalizeEmail(u.email),
        name: u.name,
        password: u.password,
      })
    )
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(migrated))
  } catch {
    // ignore
  }
}

migrateOldUsers()

function getRegisteredUsers(): StoredRegisteredUser[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((u: any) => {
        const password = typeof u?.password === "string" ? u.password : null
        if (!password) return null

        const username = getRegisteredUsername(u as StoredRegisteredUser)
        if (!username) return null

        return {
          id: typeof u?.id === "string" ? u.id : crypto.randomUUID(),
          username,
          email: typeof u?.email === "string" ? normalizeEmail(u.email) : undefined,
          name: typeof u?.name === "string" ? u.name : undefined,
          password,
          avatar: typeof u?.avatar === "string" ? u.avatar : undefined,
        } as StoredRegisteredUser
      })
      .filter(Boolean) as StoredRegisteredUser[]
  } catch {
    return []
  }
}

function setRegisteredUsers(users: StoredRegisteredUser[]) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
}

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as any

    const email = typeof parsed?.email === "string" ? normalizeEmail(parsed.email) : undefined
    const nameCandidate =
      typeof parsed?.name === "string" ? parsed.name : email ? email.split("@")[0] : typeof parsed?.username === "string" ? parsed.username : ""

    const usernameCandidate =
      typeof parsed?.username === "string" ? parsed.username : email ? email.split("@")[0] : nameCandidate

    const username = normalizeUsername(String(usernameCandidate ?? ""))
    if (!username) return null

    const id = typeof parsed?.id === "string" ? parsed.id : crypto.randomUUID()
    const name = typeof nameCandidate === "string" ? nameCandidate : username

    return {
      id,
      username,
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      avatar: typeof parsed?.avatar === "string" ? parsed.avatar : undefined,
    } satisfies User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (username: string, password: string, options?: LoginOptions) => {
    setIsLoading(true)
    try {
      const normalizedUsername = normalizeUsername(username)
      const users = getRegisteredUsers()
      const existingUser = users.find((u) => getRegisteredUsername(u) === normalizedUsername)

      if (!existingUser) {
        throw new AuthError("UNREGISTERED_USER", "User is un-registered. Please sign up first.")
      }

      if (existingUser.password !== password) {
        throw new AuthError("INVALID_CREDENTIALS", "Invalid username or password.")
      }

      const displayName = existingUser.name?.trim() || existingUser.email?.split("@")[0] || normalizedUsername
      const u: User = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        avatar: existingUser.avatar,
      }

      setUser(u)
      const storage = options?.rememberMe ? localStorage : sessionStorage
      storage.setItem(options?.rememberMe ? STORAGE_KEY : SESSION_KEY, JSON.stringify(u))
      if (options?.rememberMe) sessionStorage.removeItem(SESSION_KEY)
      else localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      if (err instanceof AuthError) throw err
      throw new AuthError("INVALID_CREDENTIALS", "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signup = useCallback(async (payload: RegisterPayload, options?: LoginOptions) => {
    setIsLoading(true)
    try {
      const normalizedEmail = normalizeEmail(payload.email)
      const fullName = payload.fullName.trim()
      const normalizedUsername = deriveUsernameFromFullName(fullName)

      if (!normalizedEmail) throw new AuthError("INVALID_CREDENTIALS", "Please enter a valid email.")
      if (!fullName) throw new AuthError("INVALID_CREDENTIALS", "Please enter your full name.")
      if (!normalizedUsername) {
        throw new AuthError("INVALID_CREDENTIALS", "Could not create a valid username from your full name. Try a different full name.")
      }

      const usernameRegex = /^[a-z][a-z0-9_]*$/
      if (!usernameRegex.test(normalizedUsername)) {
        throw new AuthError(
          "INVALID_CREDENTIALS",
          "Username must start with a letter and contain only lowercase letters, numbers, and underscore."
        )
      }

      const users = getRegisteredUsers()

      const emailTaken = users.some((u) => normalizeEmail(u.email ?? "") === normalizedEmail)
      if (emailTaken) {
        throw new AuthError("EMAIL_ALREADY_REGISTERED", "Email is already registered. Please sign in.")
      }

      const usernameTaken = users.some((u) => getRegisteredUsername(u) === normalizedUsername)
      if (usernameTaken) {
        throw new AuthError("USERNAME_ALREADY_TAKEN", "Username is already taken. Please sign in.")
      }

      const registeredUser: StoredRegisteredUser = {
        id: crypto.randomUUID(),
        username: normalizedUsername,
        email: normalizedEmail,
        name: fullName,
        password: payload.password,
      }
      setRegisteredUsers([...users, registeredUser])

      const authenticatedUser: User = {
        id: registeredUser.id,
        username: registeredUser.username,
        email: registeredUser.email,
        name: fullName.charAt(0).toUpperCase() + fullName.slice(1),
        avatar: registeredUser.avatar,
      }
      setUser(authenticatedUser)
      const storage = options?.rememberMe ? localStorage : sessionStorage
      storage.setItem(options?.rememberMe ? STORAGE_KEY : SESSION_KEY, JSON.stringify(authenticatedUser))
      if (options?.rememberMe) sessionStorage.removeItem(SESSION_KEY)
      else localStorage.removeItem(STORAGE_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  }, [])

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    isLoading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
