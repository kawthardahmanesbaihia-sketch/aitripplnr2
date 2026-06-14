"use client"

import Link from "next/link"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Image as ImageIcon } from "lucide-react"

// Constants
const AVAILABLE_TAGS = [
  "beach", "mountain", "nature", "adventure", "hiking", "relax",
  "luxury", "urban", "culture", "traditional", "modern", "night",
  "low-budget", "mid-budget", "high-budget", "tropical", "desert",
  "cold", "wildlife", "photography", "outdoor", "shopping", "food",
]

const DURATIONS = [
  "3 days", "5 days", "7 days", "10 days", "14 days", "21 days",
]

const DESTINATIONS = [
  "Spain", "Thailand", "Switzerland", "Canada", "Dubai", "France",
  "Italy", "Japan", "Iceland", "Maldives", "Morocco", "New Zealand",
  "Greece", "Portugal", "Netherlands", "Germany", "Austria", "USA",
  "Mexico", "Brazil", "Argentina", "Chile", "Peru", "Egypt",
  "Turkey", "India", "Indonesia", "Malaysia", "Singapore", "Australia",
]

const STATUS_OPTIONS = [
  { value: "draft",    label: "Draft",    hint: "Not visible to users" },
  { value: "active",   label: "Active",   hint: "Visible to users" },
  { value: "featured", label: "Featured", hint: "Highlighted on listings" },
] as const

// Types
export interface PackageFormValues {
  title:            string
  destination:      string
  country:          string
  price:            string
  duration:         string
  image:            string
  description:      string
  includedServices: string
  excludedServices: string
  status:           "draft" | "active" | "featured"
  tags:             string[]
  contactEmail:     string
  contactPhone:     string
}

const DEFAULT_VALUES: PackageFormValues = {
  title: "", destination: "", country: "", price: "", duration: "",
  image: "", description: "", includedServices: "", excludedServices: "",
  status: "draft", tags: [], contactEmail: "", contactPhone: "",
}

export interface PackageFormProps {
  initialValues?: Partial<PackageFormValues>
  onSubmit:        (values: PackageFormValues) => Promise<void>
  isSubmitting:    boolean
  submitLabel:     string
  cancelHref:      string
}

// Component
export function PackageForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  cancelHref,
}: PackageFormProps) {
  const [form, setForm] = useState<PackageFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  })

  const set = (field: keyof PackageFormValues, value: string | string[]) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleTag = (tag: string, checked: boolean) =>
    setForm(prev => ({
      ...prev,
      tags: checked
        ? [...prev.tags, tag]
        : prev.tags.filter(t => t !== tag),
    }))

  const generateImage = () => {
    if (!form.destination) return
    set(
      "image",
      `https://source.unsplash.com/800x600/?${encodeURIComponent(form.destination)},travel,landscape`,
    )
  }

  const isValid =
    !!form.title && !!form.destination && !!form.price &&
    !!form.duration && !!form.description && form.tags.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isSubmitting) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Basic Information */}
      <Card className="p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">
          Basic Information
        </p>
        <div className="grid gap-4 sm:grid-cols-2">

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pf-title">Package Title *</Label>
            <Input
              id="pf-title"
              placeholder="e.g., Tropical Paradise Getaway"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Destination *</Label>
            <Select value={form.destination} onValueChange={v => set("destination", v)}>
              <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
              <SelectContent>
                {DESTINATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf-country">Country</Label>
            <Input
              id="pf-country"
              placeholder="e.g., Spain"
              value={form.country}
              onChange={e => set("country", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pf-price">Price (USD) *</Label>
            <Input
              id="pf-price"
              type="number"
              placeholder="e.g., 1299"
              value={form.price}
              onChange={e => set("price", e.target.value)}
              required
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label>Duration *</Label>
            <Select value={form.duration} onValueChange={v => set("duration", v)}>
              <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
              <SelectContent>
                {DURATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={v => set("status", v as PackageFormValues["status"])}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>
                    <span className="font-medium">{o.label}</span>
                    <span className="text-muted-foreground ml-1.5 text-xs">— {o.hint}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Image */}
      <Card className="p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">
          Package Image
        </p>
        <div className="space-y-2">
          <Label htmlFor="pf-image">Image URL</Label>
          <div className="flex gap-2">
            <Input
              id="pf-image"
              placeholder="https://example.com/image.jpg"
              value={form.image}
              onChange={e => set("image", e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={generateImage}
              disabled={!form.destination}
              className="shrink-0"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Leave empty to auto-generate from destination on save
          </p>
        </div>
        {form.image && (
          <div className="mt-4 h-48 rounded-lg overflow-hidden border">
            <img
              src={form.image}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={e => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
              }}
            />
          </div>
        )}
      </Card>

      {/* Description & Services */}
      <Card className="p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">
          Description & Services
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pf-description">Description *</Label>
            <Textarea
              id="pf-description"
              placeholder="Describe the package highlights, inclusions, and what makes it special…"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pf-included">Included Services</Label>
              <Textarea
                id="pf-included"
                placeholder={"Flights\nHotel accommodation\nBreakfast daily\nAirport transfers"}
                value={form.includedServices}
                onChange={e => set("includedServices", e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-excluded">Excluded Services</Label>
              <Textarea
                id="pf-excluded"
                placeholder={"Travel insurance\nVisa fees\nPersonal expenses\nOptional tours"}
                value={form.excludedServices}
                onChange={e => set("excludedServices", e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tags */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tags *
          </p>
          <span className="text-xs text-muted-foreground">
            {form.tags.length} selected
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AVAILABLE_TAGS.map(tag => (
            <div key={tag} className="flex items-center gap-2">
              <Checkbox
                id={`pf-tag-${tag}`}
                checked={form.tags.includes(tag)}
                onCheckedChange={checked => toggleTag(tag, checked as boolean)}
              />
              <Label
                htmlFor={`pf-tag-${tag}`}
                className="capitalize text-sm font-normal cursor-pointer"
              >
                {tag}
              </Label>
            </div>
          ))}
        </div>
        {form.tags.length === 0 && (
          <p className="text-xs text-destructive mt-3">Select at least one tag</p>
        )}
      </Card>

      {/* Contact */}
      <Card className="p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">
          Contact <span className="normal-case font-normal">(optional)</span>
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pf-email">Email</Label>
            <Input
              id="pf-email"
              type="email"
              placeholder="agency@example.com"
              value={form.contactEmail}
              onChange={e => set("contactEmail", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pf-phone">Phone</Label>
            <Input
              id="pf-phone"
              type="tel"
              placeholder="+1 555 000 0000"
              value={form.contactPhone}
              onChange={e => set("contactPhone", e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pb-6">
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="flex-1 sm:flex-none sm:px-8"
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
        <Link href={cancelHref}>
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
      </div>
    </form>
  )
}
