import React, { createContext, useCallback, useContext, useState } from "react"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface LoginOptions {
  name?: string
  rememberMe?: boolean
}

interface RegisterPayload {
  email: string
  password: string
  name: string
}

type AuthErrorCode =
  | "UNREGISTERED_USER"
  | "EMAIL_ALREADY_REGISTERED"
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
  login: (email: string, password: string, options?: LoginOptions) => Promise<void>
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
  email: string
  password: string
  name: string
}

function getRegisteredUsers(): StoredRegisteredUser[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredRegisteredUser[]
    return Array.isArray(parsed) ? parsed : []
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
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, password: string, options?: LoginOptions) => {
    setIsLoading(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const users = getRegisteredUsers()
      const existingUser = users.find((registeredUser) => registeredUser.email === normalizedEmail)

      if (!existingUser) {
        throw new AuthError("UNREGISTERED_USER", "User is un-registered. Please sign up first.")
      }

      if (existingUser.password !== password) {
        throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password.")
      }

      const nameFromEmail = normalizedEmail.split("@")[0]
      const displayName = options?.name?.trim() || existingUser.name || nameFromEmail
      const u: User = {
        id: existingUser.id,
        email: normalizedEmail,
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      }
      setUser(u)
      const storage = options?.rememberMe ? localStorage : sessionStorage
      storage.setItem(options?.rememberMe ? STORAGE_KEY : SESSION_KEY, JSON.stringify(u))
      if (options?.rememberMe) sessionStorage.removeItem(SESSION_KEY)
      else localStorage.removeItem(STORAGE_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signup = useCallback(async (payload: RegisterPayload, options?: LoginOptions) => {
    setIsLoading(true)
    try {
      const normalizedEmail = payload.email.trim().toLowerCase()
      const users = getRegisteredUsers()
      const alreadyRegistered = users.some((registeredUser) => registeredUser.email === normalizedEmail)
      if (alreadyRegistered) {
        throw new AuthError("EMAIL_ALREADY_REGISTERED", "Email is already registered. Please sign in.")
      }

      const fallbackName = normalizedEmail.split("@")[0]
      const finalName = payload.name.trim() || options?.name?.trim() || fallbackName
      const registeredUser: StoredRegisteredUser = {
        id: crypto.randomUUID(),
        email: normalizedEmail,
        password: payload.password,
        name: finalName,
      }
      setRegisteredUsers([...users, registeredUser])

      const authenticatedUser: User = {
        id: registeredUser.id,
        email: registeredUser.email,
        name: finalName.charAt(0).toUpperCase() + finalName.slice(1),
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
