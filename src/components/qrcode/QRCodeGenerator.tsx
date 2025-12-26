/**
 * QR Code Generator Component
 * 
 * Form for creating new QR codes for locations.
 * Generates unique short codes and configures the QR code settings.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  QrCode,
  MapPin,
  Building2,
  Loader2,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGenerateQRCode } from "@/hooks/useQRCodes";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (qrCodeId: string) => void;
}

const qrCodeFormSchema = z.object({
  siteId: z.string().min(1, "Veuillez sélectionner un site"),
  departmentId: z.string().optional(),
  locationName: z.string().min(2, "Le nom du lieu est requis"),
  locationDescription: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

type QRCodeFormValues = z.infer<typeof qrCodeFormSchema>;

export function QRCodeGenerator({ isOpen, onClose, onSuccess }: QRCodeGeneratorProps) {
  const { mutate: generateQRCode, isPending } = useGenerateQRCode();

  const form = useForm<QRCodeFormValues>({
    resolver: zodResolver(qrCodeFormSchema),
    defaultValues: {
      siteId: "",
      departmentId: "",
      locationName: "",
      locationDescription: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  const handleSubmit = async (values: QRCodeFormValues) => {
    const coordinates =
      values.latitude && values.longitude
        ? { latitude: values.latitude, longitude: values.longitude }
        : undefined;

    generateQRCode(
      {
        siteId: values.siteId,
        departmentId: values.departmentId || undefined,
        locationName: values.locationName,
        locationDescription: values.locationDescription,
        coordinates,
      },
      {
        onSuccess: (qrCode) => {
          toast.success("QR code créé avec succès", {
            description: `Code: ${qrCode.shortCode}`,
          });
          form.reset();
          onSuccess?.(qrCode.id);
          onClose();
        },
        onError: (error) => {
          toast.error("Erreur lors de la création", { description: error.message });
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Générer un QR Code
          </DialogTitle>
          <DialogDescription>
            Créez un QR code pour permettre le signalement d'incidents dans un lieu spécifique
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="siteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un site" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="site-principal">Site principal</SelectItem>
                      <SelectItem value="site-secondaire">Site secondaire</SelectItem>
                      <SelectItem value="entrepot">Entrepôt</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Département (optionnel)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un département" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="logistique">Logistique</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="qualite">Qualité</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du lieu *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="Ex: Zone de stockage B, Atelier peinture"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description du lieu *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Décrivez le lieu et son utilisation..."
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Cette description sera affichée lors du scan du QR code
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="any"
                        placeholder="48.8566"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="any"
                        placeholder="2.3522"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Générer le QR Code
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

