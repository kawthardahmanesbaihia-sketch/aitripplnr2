"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { PersonalInfoTab } from "./_components/PersonalInfoTab"
import { FavoritesTab }   from "./_components/FavoritesTab"
import { SecurityTab }    from "./_components/SecurityTab"
import { AgencyTab }      from "./_components/AgencyTab"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth?redirect=/profile")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isAgency = user.role === "agency"

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-1">My Profile</h1>
        <p className="text-muted-foreground mb-8">Manage your account and preferences</p>

        <Tabs defaultValue="personal">
          <TabsList className={`grid w-full mb-8 ${isAgency ? "grid-cols-4" : "grid-cols-3"}`}>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            {isAgency && <TabsTrigger value="agency">Agency</TabsTrigger>}
          </TabsList>

          <TabsContent value="personal">
            <PersonalInfoTab />
          </TabsContent>
          <TabsContent value="favorites">
            <FavoritesTab />
          </TabsContent>
          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
          {isAgency && (
            <TabsContent value="agency">
              <AgencyTab />
            </TabsContent>
          )}
        </Tabs>
      </motion.div>
    </div>
  )
}
