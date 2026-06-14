"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Compass,
  Sparkles,
  Coffee,
  Sun,
  Utensils,
  BedDouble,
  Hotel,
} from "lucide-react";
import {
  buildItineraryFromDestination,
  type GeneratedDay,
  type ItineraryHotel,
  type ItineraryRestaurant,
  type ItineraryActivity,
} from "@/lib/destination-itinerary-generator";

const PREFERENCES = ["Culture", "Adventure", "Food", "Relaxation"] as const;

const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget", symbol: "$" },
  { value: "mid-range", label: "Mid-Range", symbol: "$$" },
  { value: "luxury", label: "Luxury", symbol: "$$$" },
];

const SLOT_ICONS = {
  Morning: Coffee,
  Afternoon: Sun,
  Evening: Utensils,
  Overnight: BedDouble,
} as const;

const SLOT_COLORS = {
  activity: "bg-primary/10 text-primary",
  food: "bg-orange-500/10 text-orange-500",
  hotel: "bg-blue-500/10 text-blue-500",
} as const;

interface ItineraryGeneratorProps {
  destinationName: string;
  hotels: ItineraryHotel[];
  restaurants: ItineraryRestaurant[];
  activities: ItineraryActivity[];
  initialBudget?: string;
  initialDates?: { start: string; end: string };
  /** Pre-generated days from multiplayer sync */
  initialDays?: GeneratedDay[];
  /** Called after generation — use for multiplayer sync */
  onSync?: (days: GeneratedDay[]) => void;
}

export function ItineraryGenerator({
  destinationName,
  hotels,
  restaurants,
  activities,
  initialBudget,
  initialDates,
  initialDays,
  onSync,
}: ItineraryGeneratorProps) {
  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(initialDates?.start ?? "");
  const [endDate, setEndDate] = useState(initialDates?.end ?? "");
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>(["Culture"]);
  const [budget, setBudget] = useState(initialBudget ?? "mid-range");
  const [generatedDays, setGeneratedDays] = useState<GeneratedDay[] | null>(
    initialDays ?? null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync budget + dates from single-mode localStorage on mount
  useEffect(() => {
    if (initialBudget && initialDates) return;
    try {
      const raw = localStorage.getItem("single_mode_preferences");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!initialBudget && parsed.budget) setBudget(parsed.budget);
      if (!initialDates) {
        if (parsed.dateRange?.start) setStartDate(parsed.dateRange.start);
        if (parsed.dateRange?.end) setEndDate(parsed.dateRange.end);
      }
    } catch {
      // silently ignore storage errors
    }
  }, [initialBudget, initialDates]);

  // If the multiplayer host generates and syncs, reflect it
  useEffect(() => {
    if (initialDays) setGeneratedDays(initialDays);
  }, [initialDays]);

  const togglePref = (pref: string) => {
    setSelectedPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleGenerate = () => {
    if (!startDate || !endDate) return;
    setIsGenerating(true);
    // Defer the synchronous calculation so the loading spinner renders first
    setTimeout(() => {
      const days = buildItineraryFromDestination({
        destinationName,
        hotels,
        restaurants,
        activities,
        startDate,
        endDate,
        preferences: selectedPrefs,
        budget,
      });
      setGeneratedDays(days);
      setIsGenerating(false);
      onSync?.(days);
    }, 500);
  };

  const numDays =
    startDate && endDate
      ? Math.max(
          0,
          Math.round(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              86_400_000
          ) + 1
        )
      : 0;

  const canGenerate = Boolean(startDate && endDate && !isGenerating);

  return (
    <section>
      <h2 className="mb-6 flex items-center gap-2 text-3xl font-bold">
        <Sparkles className="h-8 w-8 text-primary" />
        Smart Itinerary
      </h2>

      {/* Input form */}
      <Card className="border-2 bg-card/50 backdrop-blur-sm p-6 mb-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Travel dates */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" />
              Travel Dates
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setGeneratedDays(null);
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setGeneratedDays(null);
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            {numDays > 0 && (
              <p className="text-xs text-muted-foreground">
                {numDays} day{numDays !== 1 ? "s" : ""} planned
              </p>
            )}
          </div>

          {/* Preferences + Budget */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2 text-base mb-2">
                <Compass className="h-4 w-4 text-primary" />
                Preferences
              </h3>
              <div className="flex flex-wrap gap-2">
                {PREFERENCES.map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => togglePref(pref)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      selectedPrefs.includes(pref)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Budget</p>
              <div className="flex gap-2">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setBudget(opt.value);
                      setGeneratedDays(null);
                    }}
                    className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                      budget === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary"
                    }`}
                  >
                    {opt.label}{" "}
                    <span className="opacity-60">{opt.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate button */}
        <div className="mt-6 flex justify-end">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            {isGenerating ? (
              <>
                <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin inline-block" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Itinerary
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Generated day cards */}
      <AnimatePresence>
        {generatedDays && generatedDays.length > 0 && (
          <motion.div
            key="itinerary-results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            {onSync && (
              <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                <Hotel className="h-3.5 w-3.5" />
                Itinerary synced with squad
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {generatedDays.map((day, idx) => (
                <motion.div
                  key={day.dayNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07, duration: 0.35 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <Card className="border-2 bg-card/50 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                    {/* Day header */}
                    <div className="bg-primary/10 px-5 py-4 border-b border-border">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Day {day.dayNumber}
                          </p>
                          <h3 className="font-bold text-base mt-0.5 leading-snug">
                            {day.theme}
                          </h3>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0 mt-0.5">
                          {new Date(day.date + "T12:00:00").toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" }
                          )}
                        </Badge>
                      </div>
                    </div>

                    {/* Slots */}
                    <div className="p-4 space-y-3">
                      {day.slots.map((slot, slotIdx) => {
                        const Icon = SLOT_ICONS[slot.time];
                        return (
                          <div key={slotIdx} className="flex gap-3 items-start">
                            <div
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${SLOT_COLORS[slot.type]}`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground">
                                {slot.time}
                              </p>
                              <p className="text-sm font-semibold leading-snug">
                                {slot.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {slot.detail}
                              </p>
                              {slot.tag && (
                                <span className="inline-block mt-1 text-xs text-primary font-medium">
                                  {slot.tag}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
