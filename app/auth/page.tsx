"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedBackgroundElements } from "@/components/animated-background-elements"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export default function AuthPage() {
  const router = useRouter()
  const { login, signup, user } = useAuth()

  const [activeTab,  setActiveTab]  = useState("login")
  const [isLoading,  setIsLoading]  = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState("")
  const [loginPassword,   setLoginPassword]   = useState("")

  // Signup state
  const [signupFullName,        setSignupFullName]        = useState("")
  const [signupUsername,        setSignupUsername]        = useState("")
  const [signupEmail,           setSignupEmail]           = useState("")
  const [signupPassword,        setSignupPassword]        = useState("")
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("")
  const [signupRole,            setSignupRole]            = useState<"user" | "agency">("user")

  useEffect(() => {
    if (user) {
      router.push(user.role === "agency" ? "/agency/dashboard" : "/single")
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login(loginIdentifier, loginPassword)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      await signup({
        fullName: signupFullName,
        username: signupUsername,
        email:    signupEmail,
        password: signupPassword,
        role:     signupRole,
      })
      router.push(signupRole === "agency" ? "/agency/dashboard" : "/single")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackgroundElements />

      <section className="relative flex min-h-screen items-center justify-center px-4 py-20">
        <div className="container relative z-10 mx-auto max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card className="border-2 bg-card/50 backdrop-blur-sm p-8 space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">AI Trip Planner</h1>
                <p className="text-muted-foreground">Create your account or log in</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setError(null) }} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* ── LOGIN ─────────────────────────────────────────────── */}
                <TabsContent value="login" className="space-y-4 mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Email or Username</label>
                      <Input
                        type="text"
                        placeholder="email@example.com or username"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        disabled={isLoading}
                        autoComplete="username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Password</label>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isLoading || !loginIdentifier || !loginPassword}
                      >
                        {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Logging in…</> : "Login"}
                      </Button>
                    </motion.div>
                  </form>
                </TabsContent>

                {/* ── SIGN UP ───────────────────────────────────────────── */}
                <TabsContent value="signup" className="space-y-4 mt-6">
                  <form onSubmit={handleSignup} className="space-y-4">
                    {/* Account type */}
                    <div>
                      <label className="block text-sm font-semibold mb-3">Account Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={signupRole === "user" ? "default" : "outline"}
                          className="w-full"
                          onClick={() => setSignupRole("user")}
                        >
                          Traveler
                        </Button>
                        <Button
                          type="button"
                          variant={signupRole === "agency" ? "default" : "outline"}
                          className="w-full"
                          onClick={() => setSignupRole("agency")}
                        >
                          Travel Agency
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Full Name</label>
                      <Input
                        type="text"
                        placeholder="Your full name"
                        value={signupFullName}
                        onChange={(e) => setSignupFullName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Username</label>
                      <Input
                        type="text"
                        placeholder="3–50 chars, letters/numbers/_.-"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        disabled={isLoading}
                        autoComplete="username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Email</label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Password</label>
                      <Input
                        type="password"
                        placeholder="At least 8 characters"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                      <Input
                        type="password"
                        placeholder="Repeat your password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={
                          isLoading ||
                          !signupUsername ||
                          !signupEmail ||
                          !signupPassword ||
                          !signupConfirmPassword
                        }
                      >
                        {isLoading
                          ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Creating account…</>
                          : "Sign Up"
                        }
                      </Button>
                    </motion.div>
                  </form>
                </TabsContent>
              </Tabs>

              <p className="text-xs text-muted-foreground text-center">
                By continuing you agree to our terms and conditions.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
