"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/auth-context";
import { getAnalyticsData, type AnalyticsData } from "@/lib/analytics";
import { 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Clock,
  BarChart3,
  Plus
} from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "@/components/agency/DashboardCharts";

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // localStorage analytics: topTags, topDestinations, packageStats
        const localData = getAnalyticsData();

        // Real counts from MySQL: totalUsers, totalSessions
        let totalUsers = 0;
        let totalSessions = 0;
        try {
          const res = await fetch("/api/analytics");
          if (res.ok) {
            const analyticsText = await res.text()
            try {
              const counts = JSON.parse(analyticsText)
              totalUsers = counts.totalUsers ?? 0;
              totalSessions = counts.totalSessions ?? 0;
            } catch {
              console.warn("[analytics] Non-JSON response from /api/analytics")
            }
          }
        } catch (fetchErr) {
          console.error("Error fetching analytics counts:", fetchErr);
        }

        setAnalytics({ ...localData, totalUsers, totalSessions });
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="agency">
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Agency Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.full_name || user?.username || user?.email}
              </p>
            </div>
            <Link href="/agency/packages">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Package
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{analytics?.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{analytics?.totalSessions || 0}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Packages</p>
                  <p className="text-2xl font-bold">{analytics?.packageStats.totalPackages || 0}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Package Price</p>
                  <p className="text-2xl font-bold">
                    ${analytics?.packageStats.averagePrice || 0}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Analytics Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Tags */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Top User Preferences
              </h3>
              <div className="space-y-3">
                {analytics?.topTags.slice(0, 5).map((tag, index) => (
                  <div key={tag.tag} className="flex items-center justify-between">
                    <span className="font-medium capitalize">{tag.tag}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${tag.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {tag.count}
                      </span>
                    </div>
                  </div>
                ))}
                {(!analytics?.topTags || analytics.topTags.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">
                    No user preference data available yet
                  </p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Top Destinations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Popular Destinations
              </h3>
              <div className="space-y-3">
                {analytics?.topDestinations.slice(0, 5).map((dest, index) => (
                  <div key={dest.destination} className="flex items-center justify-between">
                    <span className="font-medium">{dest.destination}</span>
                    <span className="text-sm text-muted-foreground">
                      {dest.count} packages
                    </span>
                  </div>
                ))}
                {(!analytics?.topDestinations || analytics.topDestinations.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">
                    No destination data available yet
                  </p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Popular Durations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Popular Durations
              </h3>
              <div className="space-y-3">
                {analytics?.packageStats.popularDurations.map((duration, index) => (
                  <div key={duration.duration} className="flex items-center justify-between">
                    <span className="font-medium">{duration.duration}</span>
                    <span className="text-sm text-muted-foreground">
                      {duration.count} packages
                    </span>
                  </div>
                ))}
                {(!analytics?.packageStats.popularDurations || analytics.packageStats.popularDurations.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">
                    No duration data available yet
                  </p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/agency/packages">
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Package
                  </Button>
                </Link>
                <Link href="/agency/packages/list">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    View All Packages
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Charts — added below existing analytics grid */}
        {analytics && <DashboardCharts analytics={analytics} />}
      </div>
    </ProtectedRoute>
  );
}
