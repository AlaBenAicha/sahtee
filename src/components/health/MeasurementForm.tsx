import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useCreateMeasurement } from "@/hooks/useHealth";
import type { OrganizationExposure } from "@/types/health";

const formSchema = z.object({
  value: z.number().min(0, "La valeur doit être positive"),
  measuredBy: z.string().min(1, "Indiquez qui a effectué la mesure"),
  method: z.string().min(1, "Indiquez la méthode de mesure"),
  duration: z.string().min(1, "Indiquez la durée de mesure"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MeasurementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exposure: OrganizationExposure;
  onSuccess?: () => void;
}

export function MeasurementForm({
  open,
  onOpenChange,
  exposure,
  onSuccess,
}: MeasurementFormProps) {
  const [measurementDate, setMeasurementDate] = useState<Date>(new Date());
  const createMeasurement = useCreateMeasurement();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: 0,
      measuredBy: "",
      method: "",
      duration: "8h TWA",
      notes: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const withinLimits = data.value <= exposure.regulatoryLimit;

      await createMeasurement.mutateAsync({
        exposureId: exposure.id,
        date: measurementDate,
        value: data.value,
        unit: exposure.unit,
        measuredBy: data.measuredBy,
        method: data.method,
        duration: data.duration,
        withinLimits,
        notes: data.notes,
      });

      form.reset();
      setMeasurementDate(new Date());
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding measurement:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setMeasurementDate(new Date());
    }
    onOpenChange(newOpen);
  };

  const watchedValue = form.watch("value");
  const isWithinLimits = watchedValue <= exposure.regulatoryLimit;
  const percentOfLimit = exposure.regulatoryLimit > 0 
    ? Math.round((watchedValue / exposure.regulatoryLimit) * 100) 
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle mesure</DialogTitle>
          <DialogDescription>
            Ajouter une mesure pour <strong>{exposure.agent}</strong> ({exposure.area})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Date */}
          <div className="space-y-2">
            <Label>Date de mesure</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !measurementDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {measurementDate
                    ? format(measurementDate, "PPP", { locale: fr })
                    : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={measurementDate}
                  onSelect={(date) => date && setMeasurementDate(date)}
                  locale={fr}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Value with limit indicator */}
          <div className="space-y-2">
            <Label>Valeur mesurée ({exposure.unit})</Label>
            <Input
              type="number"
              step="0.01"
              {...form.register("value", { valueAsNumber: true })}
              placeholder={`Limite: ${exposure.regulatoryLimit} ${exposure.unit}`}
            />
            {watchedValue > 0 && (
              <div className={cn(
                "text-sm flex items-center gap-2",
                isWithinLimits ? "text-green-600" : "text-red-600"
              )}>
                <span className={cn(
                  "inline-block w-2 h-2 rounded-full",
                  isWithinLimits ? "bg-green-500" : "bg-red-500"
                )} />
                {percentOfLimit}% de la limite réglementaire
                {!isWithinLimits && " (dépassement)"}
              </div>
            )}
            {form.formState.errors.value && (
              <p className="text-sm text-red-500">{form.formState.errors.value.message}</p>
            )}
          </div>

          {/* Measured by */}
          <div className="space-y-2">
            <Label>Mesuré par</Label>
            <Input
              {...form.register("measuredBy")}
              placeholder="Nom du responsable de la mesure"
            />
            {form.formState.errors.measuredBy && (
              <p className="text-sm text-red-500">{form.formState.errors.measuredBy.message}</p>
            )}
          </div>

          {/* Method */}
          <div className="space-y-2">
            <Label>Méthode de mesure</Label>
            <Input
              {...form.register("method")}
              placeholder="Ex: Prélèvement atmosphérique, dosimétrie..."
            />
            {form.formState.errors.method && (
              <p className="text-sm text-red-500">{form.formState.errors.method.message}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Durée de mesure</Label>
            <Input
              {...form.register("duration")}
              placeholder="Ex: 8h TWA, 15min STEL..."
            />
            {form.formState.errors.duration && (
              <p className="text-sm text-red-500">{form.formState.errors.duration.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Textarea
              {...form.register("notes")}
              placeholder="Observations, conditions de mesure..."
              rows={3}
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createMeasurement.isPending}
            >
              {createMeasurement.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

