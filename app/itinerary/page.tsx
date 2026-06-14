"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DayCard } from "@/components/DayCard";
import { useAgencyRequests } from "@/hooks/useAgencyRequests";
import { saveItinerary } from "@/lib/travel-firestore";
import type { Itinerary, UserInput } from "@/types/itinerary";
import {
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function ItineraryPage() {
  const { createRequest } = useAgencyRequests();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isContacting, setIsContacting] = useState(false);
  const [contactStatus, setContactStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    generateUserItinerary();
  }, []);

  const generateUserItinerary = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const sessionRaw = sessionStorage.getItem("analysisResults");
      const datesRaw   = sessionStorage.getItem("travelDates");

      if (!sessionRaw) {
        setErrorMsg("No analysis results found. Please complete the preference survey first.");
        return;
      }

      const session     = JSON.parse(sessionRaw);
      const travelDates = datesRaw ? JSON.parse(datesRaw) : null;
      const selectedCountry = session.countries?.[0];

      if (!selectedCountry) {
        setErrorMsg("No destination selected. Please run the analysis first.");
        return;
      }

      const budget    = sessionStorage.getItem("selectedBudget") || session.userProfile?.budget || "medium";
      const interests: string[] = [];
      if (session.userProfile?.dominantMood)         interests.push(session.userProfile.dominantMood);
      if (session.userProfile?.preferredEnvironment) interests.push(session.userProfile.preferredEnvironment);

      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: selectedCountry.code,
          countryName: selectedCountry.name,
          budget,
          travelDates: travelDates
            ? {
                start: new Date(travelDates.start).toISOString().split("T")[0],
                end:   new Date(travelDates.end).toISOString().split("T")[0],
              }
            : undefined,
          interests,
        }),
        cache: "no-store",
      });

      const text = await response.text();
      let data: any;
      try { data = JSON.parse(text); } catch {
        throw new Error("Server returned an unexpected response.");
      }
      if (!response.ok) throw new Error(data?.error || `Server error: ${response.status}`);

      setItinerary(data as Itinerary);

      // Persist to Firestore (fire-and-forget)
      saveItinerary({
        destination:        data.destination,
        city:               data.city ?? selectedCountry.name,
        budget,
        travelDates:        travelDates
          ? { start: new Date(travelDates.start).toISOString().split("T")[0],
              end:   new Date(travelDates.end).toISOString().split("T")[0] }
          : undefined,
        totalDays:          data.totalDays,
        totalEstimatedCost: data.totalEstimatedCost,
        days:               data.days,
      }).catch(() => {})
    } catch (err) {
      console.error("[itinerary]", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to generate itinerary.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContactAgency = async () => {
    if (!itinerary) return;
    setIsContacting(true);
    setContactStatus("idle");
    try {
      const userInput: UserInput = {
        preferences: {},
        budget:      itinerary.budget as "low" | "medium" | "premium",
        startDate:   itinerary.startDate,
        endDate:     itinerary.endDate,
        destination: itinerary.destination,
      };
      createRequest(userInput, itinerary, "user@example.com", "Travel Enthusiast");
      setContactStatus("success");
    } catch {
      setContactStatus("error");
    } finally {
      setIsContacting(false);
    }
  };

  // Loading
  if (isGenerating) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Generating Your Itinerary</h2>
            <p className="text-muted-foreground">
              Fetching real hotels, restaurants, and activities for your trip…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error / empty
  if (!itinerary) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Unable to Generate Itinerary</h2>
          <p className="text-muted-foreground mb-6">
            {errorMsg ?? "Please complete the preference survey first."}
          </p>
          <Link href="/explore">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Main view (unchanged UI structure, real data)
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Travel Itinerary</h1>
            <p className="text-lg text-muted-foreground">
              Personalized {itinerary.totalDays}-day adventure in {itinerary.destination}
            </p>
          </div>
          <Link href="/results">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>
          </Link>
        </div>

        {/* Trip Summary */}
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-semibold">{itinerary.destination}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{itinerary.totalDays} days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-semibold capitalize">{itinerary.budget}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Est. Cost</p>
                <p className="font-semibold">${itinerary.totalEstimatedCost}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Days Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {itinerary.days.map((dayPlan) => (
          <DayCard
            key={dayPlan.day}
            dayPlan={dayPlan}
            destination={itinerary.destination}
          />
        ))}
      </div>

      {/* Contact Agency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to Book?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Send your personalized itinerary to our partner agencies and get quotes from real travel experts.
            </p>

            {contactStatus === "success" && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Request sent! Agencies will contact you soon.</span>
              </div>
            )}
            {contactStatus === "error" && (
              <p className="text-destructive font-medium">Failed to send request. Please try again.</p>
            )}

            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={handleContactAgency}
                disabled={isContacting || contactStatus === "success"}
                className="flex-1"
              >
                {isContacting ? "Sending…" : "Check Availability"}
                <Send className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleContactAgency}
                disabled={isContacting || contactStatus === "success"}
                className="flex-1"
              >
                {isContacting ? "Sending…" : "Book Now"}
                <Calendar className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
