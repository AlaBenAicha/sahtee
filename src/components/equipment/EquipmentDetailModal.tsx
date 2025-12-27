/**
 * Equipment Detail Modal Component
 *
 * Displays comprehensive details about an equipment recommendation
 * including specifications, certifications, costs, and status tracking.
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HardHat,
  Settings,
  AlertTriangle,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  ShoppingCart,
  Edit2,
  Calendar,
  User,
  Link2,
  Award,
  Sparkles,
  Euro,
} from "lucide-react";
import type { EquipmentRecommendation, EquipmentCategory, EquipmentStatus, EquipmentPriority } from "@/types/capa";

interface EquipmentDetailModalProps {
  equipment: EquipmentRecommendation;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onOrder?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

const categoryConfig: Record<
  EquipmentCategory,
  { label: string; icon: React.ReactNode; color: string }
> = {
  epi: {
    label: "EPI",
    icon: <HardHat className="h-5 w-5" />,
    color: "bg-blue-500 text-white",
  },
  ergonomie: {
    label: "Ergonomie",
    icon: <Settings className="h-5 w-5" />,
    color: "bg-purple-500 text-white",
  },
  securite: {
    label: "Sécurité",
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "bg-amber-500 text-white",
  },
  signalisation: {
    label: "Signalisation",
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "bg-orange-500 text-white",
  },
  formation: {
    label: "Formation",
    icon: <Settings className="h-5 w-5" />,
    color: "bg-cyan-500 text-white",
  },
  autre: {
    label: "Autre",
    icon: <Package className="h-5 w-5" />,
    color: "bg-slate-500 text-white",
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
    color: "bg-blue-100 text-blue-800",
  },
  received: {
    label: "Reçu",
    icon: <Truck className="h-4 w-4" />,
    color: "bg-indigo-100 text-indigo-800",
  },
  deployed: {
    label: "Déployé",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-emerald-100 text-emerald-800",
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

export function EquipmentDetailModal({
  equipment,
  isOpen,
  onClose,
  onEdit,
  onOrder,
  onApprove,
  onReject,
}: EquipmentDetailModalProps) {
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

  const formatDate = (timestamp: { toDate: () => Date } | undefined) => {
    if (!timestamp) return "-";
    return timestamp.toDate().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="xl">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${category.color}`}>
              {category.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{equipment.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={priority.color}>{priority.label}</Badge>
                <Badge className={status.color}>
                  <span className="flex items-center gap-1">
                    {status.icon}
                    {status.label}
                  </span>
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-slate-500 mb-2">Description</h4>
            <p className="text-slate-700">{equipment.description}</p>
          </div>

          {/* AI Recommendation */}
          {equipment.aiReason && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-700">
                  Recommandation IA
                </span>
                {equipment.aiConfidence && (
                  <Badge variant="outline" className="text-purple-600">
                    {equipment.aiConfidence}% confiance
                  </Badge>
                )}
              </div>
              <p className="text-purple-800">{equipment.aiReason}</p>
            </div>
          )}

          <Separator />

          {/* Specifications */}
          <div className="grid grid-cols-2 gap-4">
            {equipment.manufacturer && (
              <div>
                <h4 className="text-sm font-medium text-slate-500">Fabricant</h4>
                <p className="text-slate-900">{equipment.manufacturer}</p>
              </div>
            )}
            {equipment.model && (
              <div>
                <h4 className="text-sm font-medium text-slate-500">Modèle</h4>
                <p className="text-slate-900">{equipment.model}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium text-slate-500">Catégorie</h4>
              <p className="text-slate-900">{category.label}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-500">
                Quantité recommandée
              </h4>
              <p className="text-slate-900">{equipment.quantityRecommended || 1}</p>
            </div>
          </div>

          {/* Certifications */}
          {equipment.certifications && equipment.certifications.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Certifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {equipment.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {equipment.features && equipment.features.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2">
                Caractéristiques
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {equipment.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* Cost Information */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Informations de coût
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Coût unitaire estimé</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(equipment.estimatedCost)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Coût total estimé</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(
                    (equipment.estimatedCost || 0) *
                      (equipment.quantityRecommended || 1)
                  )}
                </p>
              </div>
              {equipment.actualCost !== undefined && (
                <>
                  <div>
                    <p className="text-xs text-slate-500">Coût réel</p>
                    <p className="text-lg font-semibold text-emerald-600">
                      {formatCurrency(equipment.actualCost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Écart</p>
                    <p
                      className={`text-lg font-semibold ${
                        (equipment.actualCost || 0) >
                        (equipment.estimatedCost || 0) *
                          (equipment.quantityRecommended || 1)
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(
                        (equipment.actualCost || 0) -
                          (equipment.estimatedCost || 0) *
                            (equipment.quantityRecommended || 1)
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order/Deployment Status */}
          {(equipment.quantityOrdered || equipment.quantityReceived) && (
            <div className="grid grid-cols-2 gap-4">
              {equipment.quantityOrdered && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Qté commandée</h4>
                  <p className="text-slate-900">{equipment.quantityOrdered}</p>
                </div>
              )}
              {equipment.quantityReceived && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Qté reçue</h4>
                  <p className="text-slate-900">{equipment.quantityReceived}</p>
                </div>
              )}
            </div>
          )}

          {/* Linked Items */}
          {(equipment.linkedActionPlanId || equipment.linkedIncidentId) && (
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Liens
              </h4>
              <div className="space-y-2">
                {equipment.linkedActionPlanId && (
                  <Badge variant="outline" className="gap-1">
                    CAPA: {equipment.linkedActionPlanId}
                  </Badge>
                )}
                {equipment.linkedIncidentId && (
                  <Badge variant="outline" className="gap-1">
                    Incident: {equipment.linkedIncidentId}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Audit Info */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Créé le {formatDate(equipment.audit?.createdAt)}
              </span>
              {equipment.audit?.createdBy && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {equipment.audit.createdBy}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            {equipment.status === "pending" && (
              <>
                {onApprove && (
                  <Button
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={onApprove}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                )}
                {onReject && (
                  <Button variant="destructive" onClick={onReject}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                )}
              </>
            )}
            {["pending", "approved"].includes(equipment.status) && onOrder && (
              <Button
                className="bg-blue-500 hover:bg-blue-600"
                onClick={onOrder}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Commander
              </Button>
            )}
            {onEdit && equipment.status === "pending" && (
              <Button variant="outline" onClick={onEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

