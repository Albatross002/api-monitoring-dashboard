import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AuthError, useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { login, signup, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage("")
    try {
      if (mode === "signup") {
        await signup(
          { email, password, name: fullName },
          { name: fullName || undefined, rememberMe }
        )
      } else {
        await login(email, password, { name: fullName || undefined, rememberMe })
      }
      navigate(from, { replace: true })
    } catch (error) {
      if (error instanceof AuthError) {
        setErrorMessage(error.message)
        return
      }
      setErrorMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">
            {mode === "signin" ? "Sign in" : "Sign up"}
          </CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Enter your details to access the dashboard"
              : "Create your account to access the dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required={mode === "signup"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? mode === "signin"
                  ? "Signing in..."
                  : "Signing up..."
                : mode === "signin"
                  ? "Sign in"
                  : "Sign up"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setErrorMessage("")
                setMode((currentMode) => (currentMode === "signin" ? "signup" : "signin"))
              }}
              disabled={isLoading}
            >
              {mode === "signin"
                ? "New user? Create an account"
                : "Already registered? Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
