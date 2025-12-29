/**
 * Equipment Form Component
 *
 * Form for creating or editing equipment recommendations
 * with validation and category-specific fields.
 */

import React from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useCreateEquipmentRecommendation,
  useUpdateEquipmentRecommendation,
} from "@/hooks/useEquipment";
import { useAuth } from "@/contexts/AuthContext";
import type { EquipmentRecommendation, EquipmentCategory, EquipmentPriority } from "@/types/capa";

interface EquipmentFormProps {
  equipment?: EquipmentRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
  linkedCapaId?: string;
  linkedIncidentId?: string;
}

interface EquipmentFormData {
  name: string;
  description: string;
  category: EquipmentCategory;
  priority: EquipmentPriority;
  manufacturer?: string;
  model?: string;
  quantityRecommended: number;
  estimatedCost?: number;
  certifications?: string;
  features?: string;
}

const categories: { value: EquipmentCategory; label: string }[] = [
  { value: "epi", label: "EPI (Équipement de Protection Individuelle)" },
  { value: "ergonomie", label: "Ergonomie" },
  { value: "securite", label: "Sécurité" },
  { value: "signalisation", label: "Signalisation" },
  { value: "formation", label: "Formation" },
  { value: "autre", label: "Autre" },
];

const priorities: { value: EquipmentPriority; label: string }[] = [
  { value: "critique", label: "Critique" },
  { value: "haute", label: "Haute" },
  { value: "moyenne", label: "Moyenne" },
  { value: "basse", label: "Basse" },
];

export function EquipmentForm({
  equipment,
  isOpen,
  onClose,
  linkedCapaId,
  linkedIncidentId,
}: EquipmentFormProps) {
  const { userProfile } = useAuth();
  const createMutation = useCreateEquipmentRecommendation();
  const updateMutation = useUpdateEquipmentRecommendation();
  const isEditing = !!equipment;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EquipmentFormData>({
    defaultValues: equipment
      ? {
          name: equipment.name,
          description: equipment.description,
          category: equipment.category,
          priority: equipment.priority,
          manufacturer: equipment.manufacturer,
          model: equipment.model,
          quantityRecommended: equipment.quantityRecommended || 1,
          estimatedCost: equipment.estimatedCost,
          certifications: equipment.certifications?.join(", "),
          features: equipment.features?.join(", "),
        }
      : {
          category: "epi",
          priority: "moyenne",
          quantityRecommended: 1,
        },
  });

  const selectedCategory = watch("category");
  const selectedPriority = watch("priority");

  const onSubmit = async (data: EquipmentFormData) => {
    if (!userProfile?.organizationId) {
      toast.error("Erreur", { description: "Organisation non trouvée" });
      return;
    }

    try {
      const equipmentData = {
        organizationId: userProfile.organizationId,
        name: data.name,
        description: data.description,
        category: data.category,
        priority: data.priority,
        manufacturer: data.manufacturer,
        model: data.model,
        quantityRecommended: data.quantityRecommended,
        estimatedCost: data.estimatedCost,
        certifications: data.certifications
          ? data.certifications.split(",").map((c) => c.trim())
          : [],
        features: data.features
          ? data.features.split(",").map((f) => f.trim())
          : [],
        linkedActionPlanId: linkedCapaId,
        linkedIncidentId: linkedIncidentId,
        status: "pending" as const,
        images: [],
      };

      if (isEditing && equipment) {
        await updateMutation.mutateAsync({
          equipmentId: equipment.id,
          data: equipmentData,
        });
        toast.success("Équipement modifié", {
          description: "La recommandation a été mise à jour avec succès.",
        });
      } else {
        await createMutation.mutateAsync(equipmentData);
        toast.success("Équipement créé", {
          description: "La recommandation a été créée avec succès.",
        });
      }

      reset();
      onClose();
    } catch (error) {
      console.error("Error saving equipment:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'enregistrement.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'équipement" : "Nouvelle recommandation d'équipement"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nom de l'équipement <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name", { required: "Le nom est requis" })}
                placeholder="Ex: Casque de sécurité industriel"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                {...register("description", { required: "La description est requise" })}
                placeholder="Décrivez l'équipement et son utilisation..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Catégorie <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) =>
                    setValue("category", value as EquipmentCategory)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Priorité <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedPriority}
                  onValueChange={(value) =>
                    setValue("priority", value as EquipmentPriority)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-slate-700">
              Informations produit
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Fabricant</Label>
                <Input
                  id="manufacturer"
                  {...register("manufacturer")}
                  placeholder="Ex: 3M, Honeywell..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modèle</Label>
                <Input
                  id="model"
                  {...register("model")}
                  placeholder="Référence produit"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantityRecommended">
                  Quantité recommandée <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantityRecommended"
                  type="number"
                  min="1"
                  {...register("quantityRecommended", {
                    required: "La quantité est requise",
                    min: { value: 1, message: "Minimum 1" },
                  })}
                />
                {errors.quantityRecommended && (
                  <p className="text-sm text-red-500">
                    {errors.quantityRecommended.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Coût unitaire estimé (€)</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("estimatedCost", { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Certifications & Features */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-slate-700">
              Certifications & Caractéristiques
            </h4>

            <div className="space-y-2">
              <Label htmlFor="certifications">
                Certifications (séparées par des virgules)
              </Label>
              <Input
                id="certifications"
                {...register("certifications")}
                placeholder="Ex: EN 397, EN 50365"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">
                Caractéristiques (séparées par des virgules)
              </Label>
              <Textarea
                id="features"
                {...register("features")}
                placeholder="Ex: Ventilé, Réglable, Protection électrique"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {isSubmitting || createMutation.isPending || updateMutation.isPending
                ? "Enregistrement..."
                : isEditing
                ? "Mettre à jour"
                : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

