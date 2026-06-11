'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, User, Heart, Users, Users2 } from 'lucide-react';
import { AnimatedBackgroundElements } from '@/components/animated-background-elements';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/date-range-picker';
import { Loader2 } from 'lucide-react';
import { ImageSelector } from '@/components/multiplayer/image-selector';
import { SessionLobby } from '@/components/multiplayer/session-lobby';
import { SingleModeProvider, useSingleMode } from '@/contexts/single-mode-context';
import { saveTravelSession } from '@/lib/travel-firestore';

function SingleModePageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const singleModeContext = useSingleMode();
  const preferences = singleModeContext?.preferences || {
    selectedImages: [],
    budget: '',
    interests: [],
  };
  const updatePreferences = singleModeContext?.updatePreferences || (() => {});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [mounted, setMounted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const sessionTracked = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  // Record single-mode session once on mount
  useEffect(() => {
    if (sessionTracked.current || !user) return;
    sessionTracked.current = true;
    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid, mode: 'single' }),
    }).catch(() => {});
  }, [user]);

  const handleBudgetSelect = (budget: string) => {
    updatePreferences({ budget });
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    updatePreferences({
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });
    setShowDatePicker(false);
  };

  const handleCompanionSelect = (companion: "solo" | "couple" | "friends" | "family") => {
    updatePreferences({
      travelCompanion: preferences.travelCompanion === companion ? undefined : companion,
    });
  };

  const COMPANIONS = [
    { id: "solo" as const,    label: "Solo",          icon: User,   description: "Just me" },
    { id: "couple" as const,  label: "Couple / Duo",  icon: Heart,  description: "Two travelers" },
    { id: "friends" as const, label: "Friends / Squad", icon: Users2, description: "Group of friends" },
    { id: "family" as const,  label: "Family",        icon: Users,  description: "Family trip" },
  ];

  const dateRangeDisplay = preferences.dateRange
    ? `${new Date(preferences.dateRange.start).toDateString()} → ${new Date(
        preferences.dateRange.end,
      ).toDateString()}`
    : 'Select dates';

  const handleAnalyze = async () => {
    setValidationError(null);

    if (!preferences.selectedImages || preferences.selectedImages.length === 0) {
      setValidationError('Please select at least one image before continuing.');
      setActiveTab('images');
      return;
    }
    if (!preferences.budget) {
      setValidationError('Please select a budget.');
      return;
    }
    if (!preferences.dateRange) {
      setValidationError('Please select travel dates.');
      return;
    }

    setIsUpdating(true);

    try {
      // Generate seed for consistent randomization across this request
      const requestSeed = Date.now() + Math.random() * 1000000;

      // Build request body — include per-image metadata so the engine
      // can score without Gemini when the key is absent.
      const requestBody = {
        imageMetadata: preferences.selectedImages.map((url, i) => ({
          url,
          ...(preferences.selectedImageMetadata?.[i] ?? {}),
        })),
        language: "en",
        preferences: {
          budget: preferences.budget,
          travelDates: preferences.dateRange,
        },
        travelCompanion: preferences.travelCompanion ?? null,
        seed: requestSeed,
      };

      console.log('Sending request to /api/analyze:', requestBody);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        cache: "no-store",
      });

      const rawText = await response.text()
      let data: any
      try {
        data = JSON.parse(rawText)
      } catch {
        console.error("[single] Non-JSON response from /api/analyze:", rawText.slice(0, 300))
        throw new Error("Server returned an unexpected response. Please try again.")
      }

      if (!response.ok) {
        throw new Error(data?.error || `API error: ${response.status}`)
      }
      console.log('Analysis results:', data);
      
      // Store seed for use in destination API calls
      sessionStorage.setItem("analysisResults", JSON.stringify({ ...data, seed: data.requestSeed || requestSeed }));
      sessionStorage.setItem("travelDates", JSON.stringify(preferences.dateRange));
      sessionStorage.setItem("requestSeed", String(data.requestSeed || requestSeed));
      sessionStorage.setItem("selectedBudget", preferences.budget || "medium");

      // Persist session to Firestore (fire-and-forget — never blocks navigation)
      saveTravelSession({
        selectedImages: preferences.selectedImages || [],
        imageAnalysis: data.geminiAnalysis || [],
        extractedPreferences: {
          dominantMood:         data.userProfile?.dominantMood        || "",
          preferredClimate:     data.userProfile?.preferredClimate     || "",
          preferredEnvironment: data.userProfile?.preferredEnvironment || "",
          activityLevel:        data.userProfile?.activityLevel        || "",
          foodPreferences:      data.userProfile?.foodPreferences      || [],
          allTags:              [],
        },
        recommendedDestinations: (data.countries || []).map((c: any) => ({
          name:            c.name,
          code:            c.code || "",
          matchPercentage: c.matchPercentage || 0,
        })),
        travelDates: preferences.dateRange
          ? { start: preferences.dateRange.start, end: preferences.dateRange.end }
          : null,
        budget:   preferences.budget || "",
        language: "en",
      }).catch(() => {}); // silent — never surface Firestore errors to the user

      setTimeout(() => {
        router.push("/results");
      }, 1500);
    } catch (error) {
      console.error("Error analyzing images:", error);
      setValidationError(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
      setIsUpdating(false);
    }
  };

  // Don't render preferences until after hydration — avoids SSR mismatch from localStorage
  if (!mounted) {
    return (
      <div className="relative min-h-screen px-4 py-16">
        <AnimatedBackgroundElements />
        <div className="container relative z-10 mx-auto max-w-2xl flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-16">
      <AnimatedBackgroundElements />

      <div className="container relative z-10 mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Plane className="h-8 w-8" />
          </motion.div>

          <h1 className="mb-4 text-balance text-5xl font-bold md:text-6xl">
            Plan Your Trip
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Set your preferences and let AI find the perfect destination for you.
          </p>
        </motion.div>

        {/* Preferences Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-2 bg-card/50 backdrop-blur-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Your Preferences</h2>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-4">
                <ImageSelector mode="single" />
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                {/* Budget Selection */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <label className="block text-sm font-semibold mb-2">Budget</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'standard', label: 'Standard' },
                      { value: 'premium', label: 'Premium' },
                      { value: 'luxury', label: 'Luxury' },
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBudgetSelect(option.value)}
                        disabled={isUpdating}
                        className="relative"
                      >
                        <div
                          className={`px-3 py-2 rounded-lg border-2 font-medium transition-all ${
                            preferences.budget === option.value
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {option.label}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Date Range */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-semibold mb-2">Travel Dates</label>
                  {showDatePicker ? (
                    <DateRangePicker onDateRangeChange={handleDateRangeChange} />
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowDatePicker(true)}
                      className="w-full"
                    >
                      <div className="w-full px-4 py-3 rounded-lg border-2 border-border hover:border-primary/50 bg-card text-foreground font-medium transition-all text-left">
                        {dateRangeDisplay}
                      </div>
                    </motion.button>
                  )}
                </motion.div>

                {/* Travel Companion */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.22 }}
                >
                  <label className="block text-sm font-semibold mb-1">Who are you traveling with?</label>
                  <p className="text-xs text-muted-foreground mb-3">Optional — helps us tailor recommendations</p>
                  <div className="grid grid-cols-2 gap-2">
                    {COMPANIONS.map((c) => {
                      const Icon = c.icon;
                      const selected = preferences.travelCompanion === c.id;
                      return (
                        <motion.button
                          key={c.id}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleCompanionSelect(c.id)}
                          disabled={isUpdating}
                          className="relative text-left"
                        >
                          <div
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 font-medium transition-all ${
                              selected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <div>
                              <div className="text-sm font-semibold leading-tight">{c.label}</div>
                              <div className={`text-xs leading-tight ${selected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{c.description}</div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Traveling Together? */}
                <AnimatePresence>
                  {(preferences.travelCompanion === "couple" ||
                    preferences.travelCompanion === "friends" ||
                    preferences.travelCompanion === "family") && (
                    <motion.div
                      key="traveling-together"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-border">
                        <h3 className="text-sm font-semibold mb-1">Traveling Together?</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          Create a shared room for real-time collaborative planning, or join one your group already started.
                        </p>
                        <SessionLobby />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Analyze Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4"
                >
                  {validationError && (
                    <p className="text-sm text-destructive mb-3">{validationError}</p>
                  )}
                  <Button
                    onClick={handleAnalyze}
                    disabled={isUpdating}
                    size="lg"
                    className="w-full"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Find Destinations'
                    )}
                  </Button>
                </motion.div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function SingleModePage() {
  return (
    <SingleModeProvider>
      <SingleModePageContent />
    </SingleModeProvider>
  );
}
