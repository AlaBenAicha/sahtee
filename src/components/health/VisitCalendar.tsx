/**
 * Visit Calendar Component
 * 
 * Displays a calendar view of scheduled medical visits.
 * Shows upcoming, completed, and overdue visits.
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, isToday, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useMedicalVisits } from "@/hooks/useHealth";
import type { MedicalVisit, MedicalVisitStatus, ExaminationType } from "@/types/health";

const VISIT_STATUS_CONFIG: Record<MedicalVisitStatus, { label: string; color: string; icon: React.ElementType }> = {
  scheduled: { label: "Planifiée", color: "bg-blue-100 text-blue-700", icon: CalendarIcon },
  completed: { label: "Effectuée", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  cancelled: { label: "Annulée", color: "bg-slate-100 text-slate-700", icon: XCircle },
  no_show: { label: "Absent", color: "bg-red-100 text-red-700", icon: AlertCircle },
  overdue: { label: "En retard", color: "bg-red-100 text-red-700", icon: Clock },
};

const EXAM_TYPE_LABELS: Record<ExaminationType, string> = {
  pre_employment: "Embauche",
  periodic: "Périodique",
  return_to_work: "Reprise",
  special_surveillance: "Surveillance",
  exit: "Sortie",
};

interface VisitCalendarProps {
  onSelectVisit?: (visit: MedicalVisit) => void;
  onCreateVisit?: (date?: Date) => void;
}

export function VisitCalendar({ onSelectVisit, onCreateVisit }: VisitCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const dateRange = useMemo(() => ({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  }), [currentMonth]);

  const { data: visits, isLoading } = useMedicalVisits({
    dateRange,
  });

  // Group visits by date
  const visitsByDate = useMemo(() => {
    if (!visits) return new Map<string, MedicalVisit[]>();
    
    const grouped = new Map<string, MedicalVisit[]>();
    visits.forEach((visit) => {
      const dateKey = format(visit.scheduledDate.toDate(), "yyyy-MM-dd");
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, visit]);
    });
    return grouped;
  }, [visits]);

  // Get visits for selected date
  const selectedDateVisits = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return visitsByDate.get(dateKey) || [];
  }, [selectedDate, visitsByDate]);

  // Custom day renderer
  const renderDay = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const dayVisits = visitsByDate.get(dateKey) || [];
    const hasVisits = dayVisits.length > 0;
    
    const hasOverdue = dayVisits.some(v => v.status === "overdue");
    const hasScheduled = dayVisits.some(v => v.status === "scheduled");
    const allCompleted = dayVisits.length > 0 && dayVisits.every(v => v.status === "completed");

    return (
      <div className="relative">
        <span>{date.getDate()}</span>
        {hasVisits && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                hasOverdue ? "bg-red-500" :
                hasScheduled ? "bg-blue-500" :
                allCompleted ? "bg-emerald-500" : "bg-slate-400"
              )}
            />
            {dayVisits.length > 1 && (
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-indigo-500" />
              Calendrier des visites
            </CardTitle>
            <CardDescription>
              Planification et suivi des visites médicales
            </CardDescription>
          </div>
          <Button onClick={() => onCreateVisit?.()}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle visite
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-slate-800">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </h3>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={fr}
              hideNavigation
              className="rounded-lg border p-3"
              modifiers={{
                hasVisits: (date) => {
                  const dateKey = format(date, "yyyy-MM-dd");
                  return (visitsByDate.get(dateKey)?.length || 0) > 0;
                },
              }}
              modifiersClassNames={{
                hasVisits: "font-bold",
              }}
            />
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-slate-600">Planifiée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Effectuée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-slate-600">En retard</span>
              </div>
            </div>
          </div>

          {/* Selected Date Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-700">
              {selectedDate ? (
                <>
                  Visites du {format(selectedDate, "d MMMM", { locale: fr })}
                  {isToday(selectedDate) && (
                    <Badge variant="secondary" className="ml-2">Aujourd'hui</Badge>
                  )}
                </>
              ) : (
                "Sélectionnez une date"
              )}
            </h4>

            {selectedDate && selectedDateVisits.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-center">
                <CalendarIcon className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">Aucune visite planifiée</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => onCreateVisit?.(selectedDate)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Planifier
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateVisits.map((visit) => {
                  const statusConfig = VISIT_STATUS_CONFIG[visit.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={visit.id}
                      className="rounded-lg border p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => onSelectVisit?.(visit)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-800">{visit.employeeName}</p>
                          <p className="text-sm text-slate-500">{visit.departmentName}</p>
                        </div>
                        <Badge className={cn("flex items-center gap-1", statusConfig.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <span>{EXAM_TYPE_LABELS[visit.type]}</span>
                        {visit.scheduledTime && <span>{visit.scheduledTime}</span>}
                        <span>{visit.location}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Month Summary */}
            <div className="rounded-lg bg-slate-50 p-4">
              <h5 className="text-sm font-medium text-slate-700 mb-2">Résumé du mois</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-500">Planifiées:</span>
                  <span className="ml-1 font-medium text-blue-600">
                    {visits?.filter(v => v.status === "scheduled").length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Effectuées:</span>
                  <span className="ml-1 font-medium text-emerald-600">
                    {visits?.filter(v => v.status === "completed").length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">En retard:</span>
                  <span className="ml-1 font-medium text-red-600">
                    {visits?.filter(v => v.status === "overdue").length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Annulées:</span>
                  <span className="ml-1 font-medium text-slate-600">
                    {visits?.filter(v => v.status === "cancelled" || v.status === "no_show").length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VisitCalendar;

