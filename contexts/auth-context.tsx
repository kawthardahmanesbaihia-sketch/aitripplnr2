"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface User {
  uid:        string
  email:      string
  username:   string
  role:       "user" | "agency"
  full_name:  string | null
  phone:      string | null
  country:    string | null
  city:       string | null
  bio:        string | null
  avatar_url: string | null
  last_login: string | null
  created_at: string | null
}

interface AuthContextType {
  user:          User | null
  isLoading:     boolean
  signup:        (opts: SignupOpts) => Promise<void>
  login:         (identifier: string, password: string) => Promise<void>
  logout:        () => Promise<void>
  refreshUser:   () => Promise<void>
}

interface SignupOpts {
  fullName:  string
  username:  string
  email:     string
  password:  string
  role?:     "user" | "agency"
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/profile", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }

  // Load session on mount
  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [])

  const signup = async ({ fullName, username, email, password, role = "user" }: SignupOpts) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/signup", {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ full_name: fullName, username, email, password, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Signup failed")
      setUser(data.user)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (identifier: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/login", {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Invalid credentials")
      setUser(data.user)

      if (typeof window !== "undefined") {
        window.location.href = data.user.role === "agency" ? "/agency/dashboard" : "/single"
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signup, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
