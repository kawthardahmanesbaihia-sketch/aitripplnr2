"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/auth-context";
import { autoTag, enhanceTagsWithAuto, validateTags } from "@/lib/autoTagging";
import { 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Tag, 
  Check, 
  X,
  Eye
} from "lucide-react";
import Link from "next/link";

type MediaItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  autoTags: string[];
  confidence: number;
  agencyId: string;
  createdAt: string;
};

export default function AgencyMediaPage() {
  const { user } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    tags: [] as string[]
  });
  const [autoTags, setAutoTags] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    loadMediaItems();
  }, []);

  const loadMediaItems = () => {
    try {
      const stored = localStorage.getItem("agencyMedia");
      if (stored) {
        const parsed = JSON.parse(stored);
        setMediaItems(parsed.filter((item: MediaItem) => item.agencyId === user?.uid));
      }
    } catch (error) {
      console.error("Error loading media items:", error);
    }
  };

  const saveMediaItems = (items: MediaItem[]) => {
    try {
      localStorage.setItem("agencyMedia", JSON.stringify(items));
      setMediaItems(items);
    } catch (error) {
      console.error("Error saving media items:", error);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate tags when title changes
    if (field === "title" && typeof value === "string") {
      const autoResult = autoTag(value, formData.description);
      setAutoTags(autoResult.tags);
      setConfidence(autoResult.confidence);
    }
  };

  const handleTagToggle = (tag: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tags: checked
        ? [...prev.tags, tag]
        : prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAutoTagToggle = (tag: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        tags: [...new Set([...prev.tags, tag])]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      }));
    }
  };

  const generateUnsplashImage = () => {
    const keywords = [formData.title, ...formData.tags].join(",");
    const imageUrl = `https://source.unsplash.com/800x600/?${keywords},travel,landscape`;
    handleInputChange("imageUrl", imageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setIsUploading(true);

    try {
      // Validate tags
      const { valid, invalid } = validateTags(formData.tags);
      if (invalid.length > 0) {
        alert(`Invalid tags: ${invalid.join(", ")}`);
        return;
      }

      const enhancedTags = enhanceTagsWithAuto(formData.tags, formData.title, formData.description);
      
      const newMediaItem: MediaItem = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl || `https://source.unsplash.com/800x600/?${formData.title},travel`,
        tags: enhancedTags,
        autoTags: autoTags,
        confidence,
        agencyId: user.uid,
        createdAt: new Date().toISOString()
      };

      const updatedItems = [...mediaItems, newMediaItem];
      saveMediaItems(updatedItems);

      // Reset form
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        tags: []
      });
      setAutoTags([]);
      setConfidence(0);

    } catch (error) {
      console.error("Error uploading media:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteMediaItem = (id: string) => {
    if (window.confirm("Are you sure you want to delete this media item?")) {
      const updatedItems = mediaItems.filter(item => item.id !== id);
      saveMediaItems(updatedItems);
    }
  };

  const isFormValid = formData.title && formData.imageUrl && formData.tags.length > 0;

  return (
    <ProtectedRoute requiredRole="agency">
      <div className="container mx-auto max-w-6xl px-4 py-8">
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
            <h1 className="text-3xl font-bold">Media Management</h1>
          </div>
          <p className="text-muted-foreground">
            Upload and tag travel images to enhance your package offerings
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Upload New Media</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Tropical Beach Paradise"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this travel destination or activity..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateUnsplashImage}
                      disabled={!formData.title}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>

                {/* Auto-generated Tags */}
                {autoTags.length > 0 && (
                  <div className="space-y-2">
                    <Label>Auto-generated Tags (Confidence: {confidence}%)</Label>
                    <div className="flex flex-wrap gap-2">
                      {autoTags.map(tag => (
                        <div key={tag} className="flex items-center gap-1">
                          <Checkbox
                            id={`auto-${tag}`}
                            checked={formData.tags.includes(tag)}
                            onCheckedChange={(checked) => handleAutoTagToggle(tag, checked as boolean)}
                          />
                          <Label htmlFor={`auto-${tag}`} className="text-sm capitalize">
                            {tag}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Tags */}
                <div className="space-y-2">
                  <Label>Additional Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {["beach", "mountain", "nature", "luxury", "urban", "culture", "adventure", "relax", "desert", "cold", "tropical", "food", "shopping"].map(tag => (
                      <div key={tag} className="flex items-center gap-1">
                        <Checkbox
                          id={`manual-${tag}`}
                          checked={formData.tags.includes(tag)}
                          onCheckedChange={(checked) => handleTagToggle(tag, checked as boolean)}
                        />
                        <Label htmlFor={`manual-${tag}`} className="text-sm capitalize">
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selected: {formData.tags.length} tags
                  </p>
                </div>

                {/* Image Preview */}
                {formData.imageUrl && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="w-full h-48 rounded-lg overflow-hidden border">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={!isFormValid || isUploading}
                  className="w-full"
                >
                  {isUploading ? "Uploading..." : "Upload Media"}
                  <Upload className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Media Gallery */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Your Media Library</h2>
              
              {mediaItems.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No media uploaded yet</h3>
                  <p className="text-muted-foreground">
                    Start by uploading your first travel image
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {mediaItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden">
                        <div className="relative h-32">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";
                            }}
                          />
                          
                          {/* Actions */}
                          <div className="absolute top-2 right-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-white/90 backdrop-blur-sm hover:bg-white"
                              onClick={() => window.open(item.imageUrl, '_blank')}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-50 hover:bg-red-100 border-red-200"
                              onClick={() => deleteMediaItem(item.id)}
                            >
                              <X className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-medium mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 5).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.tags.length - 5}
                              </Badge>
                            )}
                          </div>
                          
                          {item.confidence > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Auto-tag confidence: {item.confidence}%
                            </p>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
