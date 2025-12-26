/**
 * Visit Form Component
 * 
 * Form for creating and editing medical visits.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Timestamp } from "firebase/firestore";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCreateMedicalVisit, useUpdateMedicalVisit, useIsPhysician } from "@/hooks/useHealth";
import { useAuth } from "@/contexts/AuthContext";
import type { MedicalVisit, ExaminationType } from "@/types/health";

const formSchema = z.object({
  employeeId: z.string().min(1, "ID employé requis"),
  employeeName: z.string().min(1, "Nom requis"),
  departmentId: z.string().min(1, "Département requis"),
  departmentName: z.string().min(1, "Nom du département requis"),
  type: z.enum(["pre_employment", "periodic", "return_to_work", "special_surveillance", "exit"]),
  scheduledDate: z.date({ message: "Date requise" }),
  scheduledTime: z.string().optional(),
  location: z.string().min(1, "Lieu requis"),
  reason: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const EXAM_TYPE_OPTIONS: { value: ExaminationType; label: string }[] = [
  { value: "pre_employment", label: "Visite d'embauche" },
  { value: "periodic", label: "Visite périodique" },
  { value: "return_to_work", label: "Visite de reprise" },
  { value: "special_surveillance", label: "Surveillance spéciale" },
  { value: "exit", label: "Visite de fin de contrat" },
];

interface VisitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit?: MedicalVisit;
  defaultDate?: Date;
  onSuccess?: () => void;
}

export function VisitForm({
  open,
  onOpenChange,
  visit,
  defaultDate,
  onSuccess,
}: VisitFormProps) {
  const isPhysician = useIsPhysician();
  const { user, userProfile } = useAuth();
  const isEditing = !!visit;
  
  const createVisit = useCreateMedicalVisit();
  const updateVisit = useUpdateMedicalVisit();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: visit?.employeeId || "",
      employeeName: visit?.employeeName || "",
      departmentId: visit?.departmentId || "",
      departmentName: visit?.departmentName || "",
      type: visit?.type || "periodic",
      scheduledDate: visit?.scheduledDate?.toDate() || defaultDate || new Date(),
      scheduledTime: visit?.scheduledTime || "",
      location: visit?.location || "Cabinet médical",
      reason: visit?.reason || "",
    },
  });

  const isSubmitting = createVisit.isPending || updateVisit.isPending;

  const onSubmit = async (data: FormData) => {
    try {
      const visitData = {
        ...data,
        scheduledDate: Timestamp.fromDate(data.scheduledDate),
        status: "scheduled" as const,
        physicianId: user?.uid || "",
        physicianName: userProfile?.displayName || "Médecin",
        documents: visit?.documents || [],
      };

      if (isEditing && visit) {
        await updateVisit.mutateAsync({
          visitId: visit.id,
          data: visitData,
        });
      } else {
        await createVisit.mutateAsync(visitData);
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving visit:", error);
    }
  };

  if (!isPhysician) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la visite" : "Planifier une visite"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les détails de la visite médicale."
              : "Planifiez une nouvelle visite médicale pour un employé."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">ID Employé</Label>
              <Input
                id="employeeId"
                {...form.register("employeeId")}
                placeholder="EMP-001"
              />
              {form.formState.errors.employeeId && (
                <p className="text-sm text-red-500">{form.formState.errors.employeeId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeName">Nom de l'employé</Label>
              <Input
                id="employeeName"
                {...form.register("employeeName")}
                placeholder="Jean Dupont"
              />
              {form.formState.errors.employeeName && (
                <p className="text-sm text-red-500">{form.formState.errors.employeeName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departmentId">ID Département</Label>
              <Input
                id="departmentId"
                {...form.register("departmentId")}
                placeholder="PROD"
              />
              {form.formState.errors.departmentId && (
                <p className="text-sm text-red-500">{form.formState.errors.departmentId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentName">Nom du département</Label>
              <Input
                id="departmentName"
                {...form.register("departmentName")}
                placeholder="Production"
              />
              {form.formState.errors.departmentName && (
                <p className="text-sm text-red-500">{form.formState.errors.departmentName.message}</p>
              )}
            </div>
          </div>

          {/* Visit Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type de visite</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(value) => form.setValue("type", value as ExaminationType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {EXAM_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("scheduledDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("scheduledDate") ? (
                      format(form.watch("scheduledDate"), "PPP", { locale: fr })
                    ) : (
                      "Sélectionner une date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("scheduledDate")}
                    onSelect={(date) => date && form.setValue("scheduledDate", date)}
                    locale={fr}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.scheduledDate && (
                <p className="text-sm text-red-500">{form.formState.errors.scheduledDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Heure (optionnel)</Label>
              <Input
                id="scheduledTime"
                type="time"
                {...form.register("scheduledTime")}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              {...form.register("location")}
              placeholder="Cabinet médical"
            />
            {form.formState.errors.location && (
              <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motif (optionnel)</Label>
            <Textarea
              id="reason"
              {...form.register("reason")}
              placeholder="Motif de la visite..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Mettre à jour" : "Planifier"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default VisitForm;

