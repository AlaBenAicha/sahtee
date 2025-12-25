/**
 * Equipment Page
 *
 * Main page for managing equipment recommendations within the CAPA Room.
 * Displays equipment catalog with filtering, ordering, and CRUD operations.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  EquipmentCatalog,
  EquipmentDetailModal,
  EquipmentForm,
} from "@/components/equipment";
import { useEquipmentCatalog } from "@/hooks/useEquipment";
import { useAuth } from "@/contexts/AuthContext";
import type { EquipmentRecommendation } from "@/types/capa";
import CRUDGuard from "@/components/auth/CRUDGuard";
import { toast } from "sonner";

export default function EquipmentPage() {
  const { canPerformAction } = useAuth();

  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentRecommendation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data: equipment, isLoading, error } = useEquipmentCatalog({});

  const handleOpenEquipmentForm = (item?: EquipmentRecommendation) => {
    setSelectedEquipment(item || null);
    setShowEquipmentForm(true);
  };

  const handleCloseEquipmentForm = () => {
    setShowEquipmentForm(false);
    setSelectedEquipment(null);
  };

  const handleViewEquipment = (item: EquipmentRecommendation) => {
    setSelectedEquipment(item);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEquipment(null);
  };

  const handleOrderEquipment = (item: EquipmentRecommendation) => {
    // TODO: Implement order workflow
    toast.info("Fonctionnalité à venir", {
      description: "La commande d'équipement sera bientôt disponible.",
    });
  };

  if (isLoading) {
    return <div>Chargement des équipements...</div>;
  }

  if (error) {
    toast.error("Erreur de chargement", { description: error.message });
    return <div>Erreur: {error.message}</div>;
  }

  const canCreateEquipment = canPerformAction("equipment", "create");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Équipements</h1>
          <p className="text-slate-600 mt-1">
            Gérez les recommandations d'équipement de sécurité
          </p>
        </div>
        {canCreateEquipment && (
          <Button
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => handleOpenEquipmentForm()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvel équipement
          </Button>
        )}
      </div>

      <CRUDGuard feature="equipment" action="read">
        <EquipmentCatalog
          equipment={equipment || []}
          onViewEquipment={handleViewEquipment}
          onEditEquipment={handleOpenEquipmentForm}
          onOrderEquipment={handleOrderEquipment}
        />
      </CRUDGuard>

      {showDetailModal && selectedEquipment && (
        <EquipmentDetailModal
          equipment={selectedEquipment}
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          onEdit={() => {
            handleCloseDetailModal();
            handleOpenEquipmentForm(selectedEquipment);
          }}
          onOrder={() => handleOrderEquipment(selectedEquipment)}
        />
      )}

      {showEquipmentForm && (
        <EquipmentForm
          equipment={selectedEquipment}
          isOpen={showEquipmentForm}
          onClose={handleCloseEquipmentForm}
        />
      )}
    </div>
  );
}

