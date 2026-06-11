"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/auth-context";
import { usePackages } from "@/hooks/usePackages";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

const AVAILABLE_TAGS = [
  "beach", "mountain", "nature", "adventure", "hiking", "relax",
  "luxury", "urban", "culture", "traditional", "modern", "night",
  "low-budget", "mid-budget", "high-budget", "tropical", "desert",
  "cold", "wildlife", "photography", "outdoor", "shopping", "food"
];

const DURATIONS = [
  "3 days", "5 days", "7 days", "10 days", "14 days", "21 days"
];

const DESTINATIONS = [
  "Spain", "Thailand", "Switzerland", "Canada", "Dubai", "France",
  "Italy", "Japan", "Iceland", "Maldives", "Morocco", "New Zealand",
  "Greece", "Portugal", "Netherlands", "Germany", "Austria", "USA",
  "Mexico", "Brazil", "Argentina", "Chile", "Peru", "Egypt",
  "Turkey", "India", "Indonesia", "Malaysia", "Singapore", "Australia"
];

export default function CreatePackagePage() {
  const { user } = useAuth();
  const { addPackage } = usePackages();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    price: "",
    duration: "",
    image: "",
    description: "",
    tags: [] as string[],
    contactEmail: "",
    contactPhone: ""
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagToggle = (tag: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tags: checked
        ? [...prev.tags, tag]
        : prev.tags.filter(t => t !== tag)
    }));
  };

  const generateUnsplashImage = () => {
    const imageUrl = `https://source.unsplash.com/800x600/?${formData.destination.replace(/\s+/g, ',')},travel,landscape`;
    handleInputChange("image", imageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setIsSubmitting(true);

    try {
      const packageData = {
        title: formData.title,
        destination: formData.destination,
        price: parseFloat(formData.price),
        duration: formData.duration,
        image: formData.image || `https://source.unsplash.com/800x600/?${formData.destination},travel`,
        description: formData.description,
        tags: formData.tags,
        agencyName: user.full_name || user.username || user.email.split("@")[0],
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined
      };

      await addPackage(packageData, user.uid);
      router.push("/agency/packages/list");
    } catch (error) {
      console.error("Error creating package:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title && formData.destination && formData.price && formData.duration && formData.tags.length > 0;

  return (
    <ProtectedRoute requiredRole="agency">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href="/agency/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Create Travel Package</h1>
          </div>
          <p className="text-muted-foreground">
            Create a compelling travel package that matches user preferences
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Package Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Tropical Paradise Getaway"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <Select value={formData.destination} onValueChange={(value) => handleInputChange("destination", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {DESTINATIONS.map(dest => (
                        <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 1299"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    required
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map(duration => (
                        <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image */}
              <div className="space-y-2">
                <Label htmlFor="image">Package Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateUnsplashImage}
                    disabled={!formData.destination}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Leave empty to auto-generate from Unsplash
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the package highlights, inclusions, and what makes it special..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Contact Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email (optional)</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="agency@example.com"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone (optional)</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+1 555 000 0000"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <Label>Tags * (select at least one)</Label>
                <div className="grid gap-3 md:grid-cols-3">
                  {AVAILABLE_TAGS.map(tag => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag}
                        checked={formData.tags.includes(tag)}
                        onCheckedChange={(checked) => handleTagToggle(tag, checked as boolean)}
                      />
                      <Label htmlFor={tag} className="capitalize text-sm">
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Selected: {formData.tags.length} tags
                </p>
              </div>

              {/* Preview */}
              {formData.image && (
                <div className="space-y-2">
                  <Label>Image Preview</Label>
                  <div className="w-full h-48 rounded-lg overflow-hidden border">
                    <img
                      src={formData.image}
                      alt="Package preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Creating..." : "Create Package"}
                  <Plus className="h-4 w-4 ml-2" />
                </Button>
                <Link href="/agency/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
