"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/auth-context"
import { usePackages } from "@/hooks/usePackages"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PackageForm, type PackageFormValues } from "./_components/PackageForm"

export default function CreatePackagePage() {
  const { user }       = useAuth()
  const { addPackage } = usePackages()
  const router         = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (values: PackageFormValues) => {
    if (!user) return
    setSubmitting(true)
    try {
      addPackage(
        {
          title:            values.title,
          destination:      values.destination,
          country:          values.country     || undefined,
          price:            parseFloat(values.price),
          duration:         values.duration,
          image:            values.image ||
            `https://source.unsplash.com/800x600/?${encodeURIComponent(values.destination)},travel`,
          description:      values.description,
          includedServices: values.includedServices || undefined,
          excludedServices: values.excludedServices || undefined,
          status:           values.status,
          tags:             values.tags,
          agencyName:
            user.full_name || user.username || user.email.split("@")[0],
          contactEmail: values.contactEmail || undefined,
          contactPhone: values.contactPhone || undefined,
        },
        user.uid,
      )
      router.push("/agency/packages/list")
    } catch (err) {
      console.error("Error creating package:", err)
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="agency">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/agency/packages/list">
            <Button variant="ghost" size="sm" className="text-muted-foreground mb-2 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Packages
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Create Package</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Build a new travel package for your clients
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PackageForm
            onSubmit={handleSubmit}
            isSubmitting={submitting}
            submitLabel="Create Package"
            cancelHref="/agency/packages/list"
          />
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}
