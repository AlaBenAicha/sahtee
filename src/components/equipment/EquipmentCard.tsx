/**
 * Equipment Card Component
 *
 * Displays an equipment recommendation card with status, priority,
 * and action buttons for the equipment catalog.
 */

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HardHat,
  Settings,
  AlertTriangle,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  Edit2,
  Eye,
  ShoppingCart,
} from "lucide-react";
import type { EquipmentRecommendation, EquipmentCategory, EquipmentStatus, EquipmentPriority } from "@/types/capa";

interface EquipmentCardProps {
  equipment: EquipmentRecommendation;
  onView: (equipment: EquipmentRecommendation) => void;
  onEdit?: (equipment: EquipmentRecommendation) => void;
  onOrder?: (equipment: EquipmentRecommendation) => void;
}

const categoryConfig: Record<
  EquipmentCategory,
  { label: string; icon: React.ReactNode; color: string }
> = {
  epi: {
    label: "EPI",
    icon: <HardHat className="h-4 w-4" />,
    color: "bg-secondary text-primary",
  },
  ergonomie: {
    label: "Ergonomie",
    icon: <Settings className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-800",
  },
  securite: {
    label: "Sécurité",
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "bg-amber-100 text-amber-800",
  },
  signalisation: {
    label: "Signalisation",
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "bg-orange-100 text-orange-800",
  },
  formation: {
    label: "Formation",
    icon: <Settings className="h-4 w-4" />,
    color: "bg-cyan-100 text-cyan-800",
  },
  autre: {
    label: "Autre",
    icon: <Package className="h-4 w-4" />,
    color: "bg-slate-100 text-slate-800",
  },
};

const statusConfig: Record<
  EquipmentStatus,
  { label: string; icon: React.ReactNode; color: string }
> = {
  pending: {
    label: "En attente",
    icon: <Package className="h-4 w-4" />,
    color: "bg-yellow-100 text-yellow-800",
  },
  approved: {
    label: "Approuvé",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-green-100 text-green-800",
  },
  ordered: {
    label: "Commandé",
    icon: <ShoppingCart className="h-4 w-4" />,
    color: "bg-secondary text-primary",
  },
  received: {
    label: "Reçu",
    icon: <Truck className="h-4 w-4" />,
    color: "bg-indigo-100 text-indigo-800",
  },
  deployed: {
    label: "Déployé",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-secondary text-primary",
  },
  rejected: {
    label: "Rejeté",
    icon: <XCircle className="h-4 w-4" />,
    color: "bg-red-100 text-red-800",
  },
};

const priorityConfig: Record<EquipmentPriority, { label: string; color: string }> = {
  critique: { label: "Critique", color: "bg-red-500 text-white" },
  haute: { label: "Haute", color: "bg-orange-500 text-white" },
  moyenne: { label: "Moyenne", color: "bg-yellow-500 text-white" },
  basse: { label: "Basse", color: "bg-green-500 text-white" },
};

export function EquipmentCard({ equipment, onView, onEdit, onOrder }: EquipmentCardProps) {
  const category = categoryConfig[equipment.category];
  const status = statusConfig[equipment.status];
  const priority = priorityConfig[equipment.priority];

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return "-";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${category.color}`}>
              {category.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">
                {equipment.name}
              </h3>
              {equipment.manufacturer && (
                <p className="text-sm text-slate-500 truncate">
                  {equipment.manufacturer}
                  {equipment.model && ` - ${equipment.model}`}
                </p>
              )}
            </div>
          </div>
          <Badge className={priority.color}>{priority.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 line-clamp-2">
          {equipment.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={category.color}>
            {category.label}
          </Badge>
          <Badge variant="outline" className={status.color}>
            <span className="flex items-center gap-1">
              {status.icon}
              {status.label}
            </span>
          </Badge>
        </div>

        {equipment.aiReason && (
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-purple-700">
                Recommandation IA
              </span>
              {equipment.aiConfidence && (
                <span className="text-xs text-purple-600">
                  ({equipment.aiConfidence}% confiance)
                </span>
              )}
            </div>
            <p className="text-sm text-purple-800 line-clamp-2">
              {equipment.aiReason}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-xs text-slate-500">Quantité recommandée</p>
            <p className="text-sm font-medium">{equipment.quantityRecommended || 1}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Coût estimé</p>
            <p className="text-sm font-medium">
              {formatCurrency(equipment.estimatedCost)}
            </p>
          </div>
        </div>

        {equipment.certifications && equipment.certifications.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {equipment.certifications.slice(0, 3).map((cert, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {cert}
              </Badge>
            ))}
            {equipment.certifications.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{equipment.certifications.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(equipment)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Voir
          </Button>
          {onEdit && equipment.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(equipment)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {onOrder && ["pending", "approved"].includes(equipment.status) && (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary"
              onClick={() => onOrder(equipment)}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Commander
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

