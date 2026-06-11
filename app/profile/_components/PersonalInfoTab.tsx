"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Camera, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { uploadAvatar } from "@/lib/firebase-storage"

export function PersonalInfoTab() {
  const { user, refreshUser } = useAuth()

  const [fullName,  setFullName]  = useState(user?.full_name  ?? "")
  const [username,  setUsername]  = useState(user?.username   ?? "")
  const [phone,     setPhone]     = useState(user?.phone      ?? "")
  const [country,   setCountry]   = useState(user?.country    ?? "")
  const [city,      setCity]      = useState(user?.city       ?? "")
  const [bio,       setBio]       = useState(user?.bio        ?? "")

  const [saving,        setSaving]        = useState(false)
  const [uploadingImg,  setUploadingImg]  = useState(false)
  const [message,       setMessage]       = useState<{ type: "ok" | "err"; text: string } | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/profile", {
        method:      "PUT",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ full_name: fullName, username, phone, country, city, bio }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Save failed")
      await refreshUser()
      setMessage({ type: "ok", text: "Profile updated successfully." })
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Save failed" })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingImg(true)
    setMessage(null)
    try {
      const url = await uploadAvatar(user.uid, file)
      const res = await fetch("/api/profile/avatar", {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      await refreshUser()
      setMessage({ type: "ok", text: "Profile picture updated." })
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Upload failed" })
    } finally {
      setUploadingImg(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <Card className="p-6 flex items-center gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
              : <User className="h-10 w-10" />
            }
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingImg}
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
          >
            {uploadingImg ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="font-semibold">{user?.full_name || user?.username}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground capitalize mt-0.5">{user?.role === "agency" ? "Agency" : "Traveler"}</p>
        </div>
      </Card>

      {/* Info grid */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-5">Account Information</h3>
        <div className="grid grid-cols-2 gap-3 text-sm mb-6">
          <div><span className="text-muted-foreground">Member since</span><p className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</p></div>
          <div><span className="text-muted-foreground">Last login</span><p className="font-medium">{user?.last_login ? new Date(user.last_login).toLocaleDateString() : "—"}</p></div>
          <div><span className="text-muted-foreground">Email</span><p className="font-medium truncate">{user?.email}</p></div>
          <div><span className="text-muted-foreground">Account type</span><p className="font-medium capitalize">{user?.role === "agency" ? "Agency" : "Traveler"}</p></div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself…" rows={3} />
          </div>

          {message && (
            <p className={`text-sm ${message.type === "ok" ? "text-green-600" : "text-destructive"}`}>{message.text}</p>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save Changes"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
