/**
 * Equipment Order Form Component
 * 
 * Form for creating equipment orders from recommendations.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createEquipmentOrder } from "@/services/equipmentOrderService";
import type { EquipmentRecommendation } from "@/types/capa";

const orderFormSchema = z.object({
  quantity: z.number().min(1, "La quantité doit être au moins 1"),
  requestReason: z.string().min(10, "Veuillez expliquer la raison de la demande (min 10 caractères)"),
  supplierName: z.string().optional(),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface EquipmentOrderFormProps {
  equipment: EquipmentRecommendation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EquipmentOrderForm({
  equipment,
  open,
  onOpenChange,
  onSuccess,
}: EquipmentOrderFormProps) {
  const { user, userProfile } = useAuth();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      quantity: equipment.quantityRecommended || 1,
      requestReason: "",
      supplierName: "",
      notes: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: OrderFormValues) => {
    if (!user || !userProfile?.organizationId) {
      toast.error("Erreur d'authentification");
      return;
    }

    try {
      await createEquipmentOrder(
        {
          organizationId: userProfile.organizationId,
          equipmentId: equipment.id,
          equipmentName: equipment.name,
          equipmentCategory: equipment.category,
          quantity: values.quantity,
          unitPrice: equipment.estimatedCost,
          totalPrice: equipment.estimatedCost 
            ? equipment.estimatedCost * values.quantity 
            : undefined,
          supplierName: values.supplierName,
          status: "requested",
          requestedBy: user.uid,
          requestedByName: userProfile.displayName || user.email || "Utilisateur",
          requestReason: values.requestReason,
          linkedCapaId: equipment.linkedActionPlanId,
          linkedIncidentId: equipment.linkedIncidentId,
        } as any,
        user.uid
      );

      toast.success("Demande créée", {
        description: `La demande de commande pour "${equipment.name}" a été créée.`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error("Erreur", {
        description: "Impossible de créer la demande de commande.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-600" />
            Commander un équipement
          </DialogTitle>
          <DialogDescription>
            Créez une demande de commande pour cet équipement.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="font-medium text-slate-900">{equipment.name}</p>
          <p className="text-sm text-slate-500">{equipment.category}</p>
          {equipment.estimatedCost && (
            <p className="text-sm text-emerald-600 mt-1">
              Prix estimé: {equipment.estimatedCost.toLocaleString("fr-FR")} €
            </p>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requestReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raison de la demande *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Expliquez pourquoi cet équipement est nécessaire..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Cette information sera utilisée pour la validation de la demande.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplierName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fournisseur suggéré</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nom du fournisseur (optionnel)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Créer la demande
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EquipmentOrderForm;

