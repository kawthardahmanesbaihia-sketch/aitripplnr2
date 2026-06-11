"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { Plane, Building, Loader2 } from "lucide-react"

export function RoleSelector() {
  const { login } = useAuth()
  const [selectedRole, setSelectedRole] = useState<"user" | "agency">("user")
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier || !password) return
    setError(null)
    setIsLoading(true)
    try {
      await login(identifier, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Choose Your Role</h1>
            <p className="text-muted-foreground">Select your account type to continue</p>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">I am a:</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={selectedRole === "user" ? "default" : "outline"}
                onClick={() => setSelectedRole("user")}
                className="h-16 flex flex-col gap-2"
              >
                <Plane className="h-6 w-6" />
                <span>Traveler</span>
              </Button>
              <Button
                type="button"
                variant={selectedRole === "agency" ? "default" : "outline"}
                onClick={() => setSelectedRole("agency")}
                className="h-16 flex flex-col gap-2"
              >
                <Building className="h-6 w-6" />
                <span>Agency</span>
              </Button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Username</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="email@example.com or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || !identifier || !password}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</> : `Continue as ${selectedRole === "agency" ? "Agency" : "Traveler"}`}
            </Button>
          </form>

          <div className="p-4 bg-muted/50 rounded-lg text-sm">
            <h3 className="font-medium mb-2">{selectedRole === "agency" ? "Agency" : "Traveler"} Information</h3>
            {selectedRole === "user" ? (
              <div className="space-y-1 text-muted-foreground">
                <p>• Discover personalized travel destinations</p>
                <p>• Get AI-generated itineraries</p>
                <p>• Save favourites and track your history</p>
              </div>
            ) : (
              <div className="space-y-1 text-muted-foreground">
                <p>• Create and manage travel packages</p>
                <p>• View analytics and leads</p>
                <p>• Connect with interested travelers</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
