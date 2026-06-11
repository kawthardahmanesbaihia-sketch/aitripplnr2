"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/auth-context"
import { usePackages } from "@/hooks/usePackages"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { PackageForm, type PackageFormValues } from "../../_components/PackageForm"
import type { Package } from "@/types/package"

export default function EditPackagePage() {
  const { user }                               = useAuth()
  const { packages, updatePackage, isLoading } = usePackages()
  const router                                 = useRouter()
  const params                                 = useParams()
  const packageId                              = params.id as string

  const [pkg, setPkg]             = useState<Package | null>(null)
  const [notFound, setNotFound]   = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isLoading) return
    const found = packages.find(p => p.id === packageId)
    if (found) setPkg(found)
    else       setNotFound(true)
  }, [packages, packageId, isLoading])

  const handleSubmit = async (values: PackageFormValues) => {
    if (!user || !pkg) return
    setSubmitting(true)
    try {
      updatePackage(pkg.id, {
        title:            values.title,
        destination:      values.destination,
        country:          values.country          || undefined,
        price:            parseFloat(values.price),
        duration:         values.duration,
        image:            values.image ||
          `https://source.unsplash.com/800x600/?${encodeURIComponent(values.destination)},travel`,
        description:      values.description,
        includedServices: values.includedServices  || undefined,
        excludedServices: values.excludedServices  || undefined,
        status:           values.status,
        tags:             values.tags,
        contactEmail:     values.contactEmail      || undefined,
        contactPhone:     values.contactPhone      || undefined,
      })
      router.push("/agency/packages/list")
    } catch (err) {
      console.error("Error updating package:", err)
      setSubmitting(false)
    }
  }

  // Loading from localStorage
  if (isLoading || (!pkg && !notFound)) {
    return (
      <ProtectedRoute requiredRole="agency">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </ProtectedRoute>
    )
  }

  // Package not found
  if (notFound || !pkg) {
    return (
      <ProtectedRoute requiredRole="agency">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-muted-foreground mb-5">Package not found.</p>
          <Link href="/agency/packages/list">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Packages
            </Button>
          </Link>
        </div>
      </ProtectedRoute>
    )
  }

  const initialValues: Partial<PackageFormValues> = {
    title:            pkg.title,
    destination:      pkg.destination,
    country:          pkg.country          ?? "",
    price:            String(pkg.price),
    duration:         pkg.duration,
    image:            pkg.image            ?? "",
    description:      pkg.description,
    includedServices: pkg.includedServices ?? "",
    excludedServices: pkg.excludedServices ?? "",
    status:           pkg.status           ?? "active",
    tags:             pkg.tags,
    contactEmail:     pkg.contactEmail     ?? "",
    contactPhone:     pkg.contactPhone     ?? "",
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
          <h1 className="text-2xl font-bold">Edit Package</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Updating{" "}
            <span className="font-medium text-foreground">{pkg.title}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PackageForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
            submitLabel="Save Changes"
            cancelHref="/agency/packages/list"
          />
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}
