"use client";

import { useState, useEffect } from "react";
import type { Package } from "@/types/package";
import type { UserTaste } from "@/hooks/useTaste";

export const usePackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/packages");
      if (res.ok) {
        const data = await res.json() as Package[];
        setPackages(data);
      }
    } catch (error) {
      console.error("Error loading packages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPackage = async (
    packageData: Omit<Package, "id" | "createdAt" | "agencyId">,
    agencyId: string
  ): Promise<Package> => {
    const res = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...packageData, agencyId }),
    });
    if (!res.ok) throw new Error("Failed to create package");
    const { id } = await res.json() as { id: string };
    const newPackage: Package = {
      ...packageData,
      id,
      agencyId,
      createdAt: new Date().toISOString(),
    };
    setPackages(prev => [newPackage, ...prev]);
    return newPackage;
  };

  const updatePackage = async (id: string, updates: Partial<Package>) => {
    const res = await fetch(`/api/packages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update package");
    setPackages(prev => prev.map(pkg => pkg.id === id ? { ...pkg, ...updates } : pkg));
  };

  const deletePackage = async (id: string) => {
    const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete package");
    setPackages(prev => prev.filter(pkg => pkg.id !== id));
  };

  const getAgencyPackages = (agencyId: string) => {
    return packages.filter(pkg => pkg.agencyId === agencyId);
  };

  return {
    packages,
    isLoading,
    addPackage,
    updatePackage,
    deletePackage,
    getAgencyPackages,
    loadPackages,
  };
};

export const scorePackage = (pkg: Package, userPreferences: UserTaste): number => {
  let score = 0;
  pkg.tags.forEach(tag => {
    if (userPreferences[tag]) {
      score += userPreferences[tag];
    }
  });
  return score;
};

export const getTopMatches = (
  packages: Package[],
  userPreferences: UserTaste,
  limit: number = 3
): Array<Package & { score: number }> => {
  const ranked = packages
    .map(pkg => ({ ...pkg, score: scorePackage(pkg, userPreferences) }))
    .filter(pkg => pkg.score > 0)
    .sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit);
};
