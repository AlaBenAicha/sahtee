/**
 * Equipment Catalog Component
 *
 * Displays a grid of equipment recommendations with filtering,
 * statistics, and quick actions for ordering and management.
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HardHat,
  Settings,
  AlertTriangle,
  Package,
  TrendingUp,
  Euro,
  Clock,
} from "lucide-react";
import { EquipmentCard } from "./EquipmentCard";
import { EquipmentFilters, type EquipmentFiltersType } from "./EquipmentFilters";
import type { EquipmentRecommendation, EquipmentCategory, EquipmentStatus } from "@/types/capa";

interface EquipmentCatalogProps {
  equipment: EquipmentRecommendation[];
  onViewEquipment: (equipment: EquipmentRecommendation) => void;
  onEditEquipment?: (equipment: EquipmentRecommendation) => void;
  onOrderEquipment?: (equipment: EquipmentRecommendation) => void;
}

const categoryConfig: Record<
  EquipmentCategory,
  { icon: React.ReactNode; color: string }
> = {
  epi: { icon: <HardHat className="h-5 w-5" />, color: "bg-primary" },
  ergonomie: { icon: <Settings className="h-5 w-5" />, color: "bg-purple-500" },
  securite: { icon: <AlertTriangle className="h-5 w-5" />, color: "bg-amber-500" },
  signalisation: { icon: <AlertTriangle className="h-5 w-5" />, color: "bg-orange-500" },
  formation: { icon: <Settings className="h-5 w-5" />, color: "bg-cyan-500" },
  autre: { icon: <Package className="h-5 w-5" />, color: "bg-slate-500" },
};

export function EquipmentCatalog({
  equipment,
  onViewEquipment,
  onEditEquipment,
  onOrderEquipment,
}: EquipmentCatalogProps) {
  const [filters, setFilters] = useState<EquipmentFiltersType>({});

  // Compute statistics
  const stats = useMemo(() => {
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalCost = 0;
    let pendingCount = 0;

    equipment.forEach((item) => {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      
      if (item.estimatedCost) {
        totalCost += item.estimatedCost * (item.quantityRecommended || 1);
      }
      
      if (["pending", "approved", "ordered"].includes(item.status)) {
        pendingCount++;
      }
    });

    return {
      total: equipment.length,
      byCategory,
      byStatus,
      totalCost,
      pendingCount,
    };
  }, [equipment]);

  // Filter equipment
  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      // Search filter
      if (filters.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        const matchesSearch =
          item.name.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search) ||
          (item.manufacturer && item.manufacturer.toLowerCase().includes(search)) ||
          (item.model && item.model.toLowerCase().includes(search));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && filters.category.length > 0) {
        if (!filters.category.includes(item.category)) return false;
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(item.status)) return false;
      }

      // Priority filter
      if (filters.priority && filters.priority.length > 0) {
        if (!filters.priority.includes(item.priority)) return false;
      }

      return true;
    });
  }, [equipment, filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total équipements</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-full">
                <Package className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">En attente</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pendingCount}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Coût estimé</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(stats.totalCost)}
                </p>
              </div>
              <div className="p-3 bg-secondary rounded-full">
                <Euro className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Déployés</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.byStatus["deployed"] || 0}
                </p>
              </div>
              <div className="p-3 bg-secondary rounded-full">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byCategory).map(([category, count]) => {
              const config = categoryConfig[category as EquipmentCategory];
              return (
                <Badge
                  key={category}
                  variant="outline"
                  className="px-3 py-1 gap-2"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      category: [category as EquipmentCategory],
                    }))
                  }
                >
                  <span
                    className={`p-1 rounded ${config.color} text-white`}
                  >
                    {config.icon}
                  </span>
                  {category.charAt(0).toUpperCase() + category.slice(1)}: {count}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <EquipmentFilters currentFilters={filters} onFilterChange={setFilters} />

      {/* Equipment Grid */}
      {filteredEquipment.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Aucun équipement trouvé
            </h3>
            <p className="text-slate-500">
              {Object.keys(filters).length > 0
                ? "Essayez de modifier vos filtres pour voir plus de résultats."
                : "Aucune recommandation d'équipement n'a encore été créée."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              onView={onViewEquipment}
              onEdit={onEditEquipment}
              onOrder={onOrderEquipment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

