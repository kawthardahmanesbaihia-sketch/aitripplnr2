"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/auth-context";
import { usePackages } from "@/hooks/usePackages";
import { PackageCard } from "@/components/PackageCard";
import { ArrowLeft, Search, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export default function PackageListPage() {
  const { user } = useAuth();
  const { packages, getAgencyPackages, deletePackage } = usePackages();
  const [searchTerm, setSearchTerm] = useState("");
  const [agencyPackages, setAgencyPackages] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const packages = getAgencyPackages(user.uid);
      setAgencyPackages(packages);
    }
  }, [user, getAgencyPackages]);

  const filteredPackages = agencyPackages.filter(pkg =>
    pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeletePackage = async (packageId: string) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        await deletePackage(packageId);
        setAgencyPackages(prev => prev.filter(pkg => pkg.id !== packageId));
      } catch (error) {
        console.error("Error deleting package:", error);
      }
    }
  };

  return (
    <ProtectedRoute requiredRole="agency">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/agency/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Your Packages</h1>
            </div>
            <Link href="/agency/packages">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Package
              </Button>
            </Link>
          </div>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Package Grid */}
        {filteredPackages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? "No packages found" : "No packages yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? "Try adjusting your search terms"
                  : "Create your first travel package to start attracting customers"
                }
              </p>
              {!searchTerm && (
                <Link href="/agency/packages">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Package
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="relative">
                  <PackageCard package={pkg} />
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Link href={`/agency/packages/edit/${pkg.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/90 backdrop-blur-sm hover:bg-white"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:border-red-200"
                      onClick={() => handleDeletePackage(pkg.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        {filteredPackages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Showing {filteredPackages.length} of {agencyPackages.length} packages
                </span>
                <span className="text-muted-foreground">
                  Total value: ${filteredPackages.reduce((sum, pkg) => sum + pkg.price, 0).toLocaleString()}
                </span>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}
