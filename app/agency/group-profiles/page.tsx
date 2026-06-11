"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/auth-context";
import { leastMisery, normalizePreferences } from "@/lib/leastMisery";
import type { GroupPreferences } from "@/lib/leastMisery";
import type { UserTaste } from "@/hooks/useTaste";
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Target,
  PieChart,
  Activity
} from "lucide-react";
import Link from "next/link";

export default function AgencyGroupProfilesPage() {
  const { user } = useAuth();
  const [groupProfiles, setGroupProfiles] = useState<Array<{
    id: string;
    groupName: string;
    preferences: GroupPreferences;
    memberCount: number;
    createdAt: string;
  }>>([]);
  const [selectedProfile, setSelectedProfile] = useState<typeof groupProfiles[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGroupProfiles();
  }, []);

  const loadGroupProfiles = () => {
    try {
      // Mock group profiles data - in production, this would come from API
      const mockGroupProfiles = [
        {
          id: "1",
          groupName: "Adventure Squad",
          preferences: {
            beach: 40,
            nature: 70,
            adventure: 60,
            mountain: 50,
            relax: 30,
            luxury: 20
          },
          memberCount: 4,
          createdAt: new Date().toISOString()
        },
        {
          id: "2", 
          groupName: "Beach Lovers",
          preferences: {
            beach: 80,
            tropical: 70,
            relax: 60,
            nature: 40,
            luxury: 50,
            urban: 20
          },
          memberCount: 3,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "3",
          groupName: "Culture Explorers",
          preferences: {
            culture: 80,
            urban: 70,
            history: 60,
            food: 50,
            luxury: 40,
            relax: 30
          },
          memberCount: 5,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "4",
          groupName: "Luxury Travelers",
          preferences: {
            luxury: 80,
            urban: 70,
            relax: 60,
            culture: 50,
            food: 40,
            beach: 30
          },
          memberCount: 2,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setGroupProfiles(mockGroupProfiles as unknown as { id: string; groupName: string; preferences: GroupPreferences; memberCount: number; createdAt: string }[]);
    } catch (error) {
      console.error("Error loading group profiles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTopPreferences = (preferences: GroupPreferences): Array<{ tag: string; score: number }> => {
    return Object.entries(preferences)
      .map(([tag, score]) => ({ tag, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  const getInsights = (preferences: GroupPreferences) => {
    const entries = Object.entries(preferences);
    const highScore = Math.max(...Object.values(preferences));
    const lowScore = Math.min(...Object.values(preferences));
    const avgScore = Math.round(Object.values(preferences).reduce((sum, score) => sum + score, 0) / entries.length);

    return {
      highScore,
      lowScore,
      avgScore,
      diversity: entries.length,
      consensus: entries.filter(([_, score]) => score > 50).length
    };
  };

  const getRecommendations = (preferences: GroupPreferences): string[] => {
    const recommendations: string[] = [];
    
    if (preferences.beach > 60) {
      recommendations.push("Focus on tropical beach destinations");
    }
    if (preferences.nature > 60) {
      recommendations.push("Include hiking and outdoor activities");
    }
    if (preferences.luxury > 60) {
      recommendations.push("Offer premium accommodations and experiences");
    }
    if (preferences.culture > 60) {
      recommendations.push("Include historical sites and museums");
    }
    if (preferences.adventure > 60) {
      recommendations.push("Plan exciting activities and sports");
    }

    return recommendations;
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="agency">
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="agency">
      <div className="container mx-auto max-w-7xl px-4 py-8">
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
            <h1 className="text-3xl font-bold">Group Profiles Analysis</h1>
          </div>
          <p className="text-muted-foreground">
            Understand group travel preferences to create targeted package offerings
          </p>
        </motion.div>

        {/* Group Profiles Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {groupProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => setSelectedProfile(profile)}
            >
              <Card className={`p-6 cursor-pointer transition-all duration-300 ${
                selectedProfile?.id === profile.id 
                  ? "border-2 border-primary shadow-lg shadow-primary/50" 
                  : "border-2 border-transparent hover:border-primary/30"
              }`}>
                {/* Profile Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{profile.groupName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {profile.memberCount} members
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </Badge>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-3 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <BarChart3 className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Avg. Score</p>
                    <p className="text-lg font-bold">
                      {getInsights(profile.preferences).avgScore}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Consensus</p>
                    <p className="text-lg font-bold">
                      {getInsights(profile.preferences).consensus}/{getInsights(profile.preferences).diversity}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Diversity</p>
                    <p className="text-lg font-bold">
                      {getInsights(profile.preferences).diversity}
                    </p>
                  </div>
                </div>

                {/* Top Preferences */}
                <div className="mb-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Top Preferences
                  </h4>
                  <div className="space-y-2">
                    {getTopPreferences(profile.preferences).map((pref, prefIndex) => (
                      <div key={pref.tag} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="font-medium capitalize">{pref.tag}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${pref.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{pref.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Analysis */}
        {selectedProfile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {selectedProfile.groupName} - Detailed Analysis
              </h2>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Preferences Chart */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Preference Distribution
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(selectedProfile.preferences)
                      .sort(([, a], [, b]) => b - a)
                      .map(([tag, score]) => (
                        <div key={tag} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium capitalize">{tag}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{score}%</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Package Recommendations
                  </h3>
                  <div className="space-y-3">
                    {getRecommendations(selectedProfile.preferences).map((recommendation, index) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6 pt-6 border-t">
                <Button className="flex-1">
                  Create Custom Package
                </Button>
                <Button variant="outline" className="flex-1">
                  View Similar Groups
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}
