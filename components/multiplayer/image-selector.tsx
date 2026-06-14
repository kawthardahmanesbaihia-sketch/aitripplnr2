'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mountain,
  Building2,
  Activity,
  UtensilsCrossed,
  Waves,
  Landmark,
  Loader2,
  Check,
  RefreshCw,
  X,
  ChevronDown,
} from 'lucide-react';
import { useMultiplayer } from '@/contexts/multiplayer-context';
import { useSingleMode } from '@/contexts/single-mode-context';
import type { CategoryImage } from '@/contexts/single-mode-context';
import type { ImageTemplateTags } from '@/lib/image-templates';

// ImageItem is the in-component alias for the shared CategoryImage type.
// Single mode uses context-backed state (survives tab switches).
// Multiplayer mode uses local component state (unchanged behaviour).
type ImageItem = CategoryImage;

interface AIImageCategory {
  id:    string;
  name:  string;
  icon:  typeof Mountain;
  color: string;
}

interface ImageSelectorProps {
  mode?: 'multiplayer' | 'single';
}

// Pinterest-style varied aspect-ratio rhythm
const ASPECT_CLASSES = [
  'aspect-[4/3]',
  'aspect-[3/4]',
  'aspect-[16/9]',
  'aspect-square',
  'aspect-[4/5]',
  'aspect-[3/2]',
  'aspect-[2/3]',
] as const

export function ImageSelector({ mode = 'multiplayer' }: ImageSelectorProps) {
  const multiplayerContext = useMultiplayer();
  const singleModeContext  = useSingleMode();

  const { preferences, updatePreferences } =
    mode === 'single' && singleModeContext
      ? singleModeContext
      : multiplayerContext;

  // Category image state
  // For single mode: use context state so the grid survives tab switches.
  // Radix UI TabsContent unmounts inactive panels, destroying component-local state.
  // For multiplayer: use local state (no cross-tab persistence needed).
  const [localCategoryImages, setLocalCategoryImages] = useState<Record<string, ImageItem[]>>({});
  const isSingle = mode === 'single' && !!singleModeContext;

  const categoryImages: Record<string, ImageItem[]> = isSingle
    ? singleModeContext!.categoryImages
    : localCategoryImages;

  // setCategoryImages accepts either the context or local setter — both have the same type
  // since ImageItem = CategoryImage.
  const setCategoryImages = (
    isSingle
      ? singleModeContext!.setCategoryImages
      : setLocalCategoryImages
  ) as React.Dispatch<React.SetStateAction<Record<string, ImageItem[]>>>;

  // Ephemeral per-mount state
  const [loadingCategories, setLoadingCategories] = useState<Record<string, boolean>>({});
  const [showMoreLoading,   setShowMoreLoading]   = useState<Record<string, boolean>>({});
  const [categoryErrors,    setCategoryErrors]    = useState<Record<string, string>>({});
  const [activeCategory,    setActiveCategory]    = useState<string | null>(null);

  const lastSyncedImagesRef = useRef<string[]>([]);

  const categories: AIImageCategory[] = [
    { id: 'nature',     name: 'Nature',     icon: Mountain,        color: 'from-green-400 to-emerald-600' },
    { id: 'city',       name: 'City Style', icon: Building2,       color: 'from-blue-400 to-blue-600'    },
    { id: 'activities', name: 'Activities', icon: Activity,        color: 'from-orange-400 to-red-600'   },
    { id: 'food',       name: 'Food',       icon: UtensilsCrossed, color: 'from-pink-400 to-rose-600'    },
    { id: 'beaches',    name: 'Beaches',    icon: Waves,           color: 'from-cyan-400 to-blue-500'    },
    { id: 'culture',    name: 'Culture',    icon: Landmark,        color: 'from-amber-400 to-amber-600'  },
  ];

  // Feature 1: Load category images (initial or refresh)
  const generateCategoryImages = async (categoryId: string) => {
    if (loadingCategories[categoryId]) return;
    setLoadingCategories((prev) => ({ ...prev, [categoryId]: true }));
    setCategoryErrors((prev) => ({ ...prev, [categoryId]: '' }));

    try {
      const res = await fetch(`/api/image-templates?category=${categoryId}&count=24`);

      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try { const j = await res.json(); detail = j.error ?? detail; } catch {}
        console.error(`[image-selector] API error for "${categoryId}": ${detail}`);
        setCategoryErrors((prev) => ({ ...prev, [categoryId]: detail }));
        return;
      }

      const data = await res.json();
      const fetchedImages: any[] = data.images ?? [];

      if (fetchedImages.length === 0) {
        console.warn(`[image-selector] API returned 0 images for category "${categoryId}"`);
        setCategoryErrors((prev) => ({
          ...prev,
          [categoryId]: 'No images returned. Check the server logs and your Unsplash key.',
        }));
        return;
      }

      const newImages: ImageItem[] = fetchedImages.map((img: any) => ({
        url:        img.imageUrl,
        thumbUrl:   img.thumbUrl ?? img.imageUrl,
        source:     'ai' as const,
        selected:   false,
        templateId: img.templateId,
        tags:       img.tags as ImageTemplateTags,
        category:   categoryId,
      }));

      setCategoryImages((prev) => ({ ...prev, [categoryId]: newImages }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[image-selector] Fetch failed for "${categoryId}":`, msg);
      setCategoryErrors((prev) => ({ ...prev, [categoryId]: `Network error: ${msg}` }));
    } finally {
      setLoadingCategories((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  // Feature 2: Show More — append without replacing
  const showMoreCategoryImages = async (categoryId: string) => {
    if (showMoreLoading[categoryId] || loadingCategories[categoryId]) return;
    const existing = categoryImages[categoryId] ?? [];
    setShowMoreLoading((prev) => ({ ...prev, [categoryId]: true }));

    try {
      const res = await fetch(`/api/image-templates?category=${categoryId}&count=12`);
      if (!res.ok) return;

      const data = await res.json();
      const fetchedImages: any[] = data.images ?? [];

      // Client-side URL dedup — never surface an image already visible in the grid
      const existingUrls = new Set(existing.map((img) => img.url));
      const newImages: ImageItem[] = fetchedImages
        .filter((img: any) => !existingUrls.has(img.imageUrl))
        .map((img: any) => ({
          url:        img.imageUrl,
          thumbUrl:   img.thumbUrl ?? img.imageUrl,
          source:     'ai' as const,
          selected:   false,
          templateId: img.templateId,
          tags:       img.tags as ImageTemplateTags,
          category:   categoryId,
        }));

      console.log(
        `[ShowMore] Category: ${categoryId} | ` +
        `Previous image count: ${existing.length} | ` +
        `New appended: ${newImages.length} | ` +
        `Final image count: ${existing.length + newImages.length}`
      );

      setCategoryImages((prev) => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] ?? []), ...newImages],
      }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[image-selector] Show more failed for "${categoryId}":`, msg);
    } finally {
      setShowMoreLoading((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  // Feature 3: Clear all selections without reloading
  const clearSelection = () => {
    const totalSelected = Object.values(categoryImages)
      .flatMap((imgs) => imgs.filter((img) => img.selected)).length;

    console.log(`[ClearSelection] Removed selections: ${totalSelected} | Metadata cleared: ${totalSelected}`);

    setCategoryImages((prev) => {
      const cleared: Record<string, ImageItem[]> = {};
      Object.entries(prev).forEach(([catId, imgs]) => {
        cleared[catId] = imgs.map((img) => ({ ...img, selected: false }));
      });
      return cleared;
    });

    // Reset the sync ref so Effect A doesn't see a stale diff on next fire.
    lastSyncedImagesRef.current = [];
    updatePreferences({ selectedImages: [], selectedImageMetadata: [] });
  };

  // Toggle individual image selection
  const toggleImageSelection = (categoryId: string, imageIndex: number) => {
    setCategoryImages((prev) => {
      const category = prev[categoryId] || [];
      const updated  = [...category];
      updated[imageIndex] = { ...updated[imageIndex], selected: !updated[imageIndex].selected };
      return { ...prev, [categoryId]: updated };
    });
  };

  // Sync selected images → preferences (source of truth for /api/analyze)
  // Fires whenever categoryImages changes (toggle, clear, append).
  // The JSON comparison prevents redundant updatePreferences calls.
  useEffect(() => {
    const selectedObjects = Object.values(categoryImages)
      .flatMap((images) => images.filter((img) => img.selected));

    const selectedImages = selectedObjects.map((img) => img.url);

    if (JSON.stringify(lastSyncedImagesRef.current) !== JSON.stringify(selectedImages)) {
      console.log(
        `[SelectionPersistence] Selected count: ${selectedImages.length} | ` +
        `Preserved after navigation: ${selectedImages.length > 0}`
      );

      lastSyncedImagesRef.current = selectedImages;

      const selectedImageMetadata = selectedObjects.map((img) => ({
        tags:           [img.tags.vibe, ...img.tags.interests, img.tags.tripStyle],
        mood:           img.tags.vibe,
        climate:        img.tags.climate,
        environment:    img.tags.environment,
        activity_level: tripStyleToActivityLevel(img.tags.tripStyle),
        food_style:     img.tags.foodStyle,
        budget:         img.tags.budget,
        travelers:      img.tags.travelers,
        templateId:     img.templateId,
        templateTags:   img.tags,
        category:       img.category,
      }));

      updatePreferences({ selectedImages, selectedImageMetadata });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryImages]);

  // NOTE: The "restore from preferences" useEffect that previously existed here has been
  // intentionally removed. It fired on every preferences.selectedImages change (not just mount),
  // creating a feedback loop and a race window where stale localStorage URLs could survive
  // into the analyze payload. categoryImages now lives in the context for single mode,
  // so it persists naturally across tab switches without any restoration logic.

  // Derived UI state
  const totalSelected = Object.values(categoryImages)
    .flatMap((imgs) => imgs.filter((img) => img.selected)).length;

  // Render
  return (
    <Card className="border-2 bg-card/50 backdrop-blur-sm p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold mb-2">Select Images You Like</h2>
          <p className="text-sm text-muted-foreground">
            Browse and select images that match your travel style.
            {mode === 'multiplayer' && ' Your selections sync with other players in real-time.'}
          </p>
        </div>
        {totalSelected > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSelection}
            className="text-muted-foreground hover:text-destructive shrink-0 mt-1"
            title="Clear all selections"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear ({totalSelected})
          </Button>
        )}
      </div>

      {/* Category selector grid */}
      <div className="grid grid-cols-6 gap-2">
        {categories.map((category) => {
          const Icon              = category.icon;
          const imgs              = categoryImages[category.id] ?? [];
          const hasImages         = imgs.length > 0;
          const selectedInCat     = imgs.filter((img) => img.selected).length;

          return (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveCategory(category.id);
                // Auto-fetch only on first visit; Refresh button handles explicit reload
                if (!categoryImages[category.id]?.length) {
                  generateCategoryImages(category.id);
                }
              }}
              className={`relative group transition-all w-full min-w-0 ${
                activeCategory === category.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div
                className={`p-3 rounded-lg bg-gradient-to-br ${category.color} text-white text-center cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col items-center justify-center gap-1`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate text-xs font-semibold">{category.name}</span>
                {hasImages && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {selectedInCat > 0 ? `${selectedInCat} ✓` : imgs.length}
                  </Badge>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Active category image grid */}
      {activeCategory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {categories.find((c) => c.id === activeCategory)?.name}
            </h3>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => generateCategoryImages(activeCategory)}
                disabled={loadingCategories[activeCategory]}
                title="Refresh images"
              >
                {loadingCategories[activeCategory] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setActiveCategory(null)}>
                Close
              </Button>
            </div>
          </div>

          {loadingCategories[activeCategory] && !categoryImages[activeCategory]?.length ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary mx-auto mb-2 animate-spin" />
            </div>
          ) : categoryErrors[activeCategory] ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive space-y-2">
              <p className="font-semibold">Could not load images</p>
              <p className="text-destructive/80">{categoryErrors[activeCategory]}</p>
              <button
                onClick={() => generateCategoryImages(activeCategory)}
                className="text-xs underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="columns-2 sm:columns-3 md:columns-4 gap-3">
                {(categoryImages[activeCategory] ?? []).map((image, idx) => (
                  <div key={image.url} className="break-inside-avoid mb-3">
                    <button
                      onClick={() => toggleImageSelection(activeCategory, idx)}
                      className={`relative w-full group rounded-xl overflow-hidden border-2 transition-all duration-200 block ${
                        image.selected
                          ? 'border-primary ring-2 ring-primary shadow-lg shadow-primary/20'
                          : 'border-transparent hover:border-primary/40'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.tags.vibe}
                        className={`w-full object-cover block ${ASPECT_CLASSES[idx % ASPECT_CLASSES.length]}`}
                        loading="lazy"
                      />
                      <div
                        className={`absolute inset-0 transition-all duration-200 ${
                          image.selected
                            ? 'bg-primary/25'
                            : 'bg-transparent group-hover:bg-black/10'
                        }`}
                      />
                      {image.selected && (
                        <div className="absolute top-2 right-2 h-6 w-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Show More — appends images without replacing or resetting selections */}
              {(categoryImages[activeCategory]?.length ?? 0) > 0 && (
                <div className="flex justify-center pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => showMoreCategoryImages(activeCategory)}
                    disabled={showMoreLoading[activeCategory] || loadingCategories[activeCategory]}
                  >
                    {showMoreLoading[activeCategory] ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading more…
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show More
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </Card>
  );
}

function tripStyleToActivityLevel(tripStyle: ImageTemplateTags["tripStyle"]): "low" | "medium" | "high" {
  if (tripStyle === "adventure") return "high"
  if (tripStyle === "party")     return "high"
  if (tripStyle === "relaxed" || tripStyle === "wellness") return "low"
  return "medium"
}
