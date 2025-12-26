/**
 * CAPA Calendar View Component
 * 
 * Displays CAPAs in a calendar view based on their due dates.
 * Shows upcoming, overdue, and completed actions.
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, isToday, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCAPAs } from "@/hooks/useCAPAs";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import type { ActionPlan, ActionPriority, ActionStatus } from "@/types/capa";

const priorityConfig: Record<ActionPriority, { label: string; color: string; dotColor: string }> = {
  critique: { label: "Critique", color: "text-red-700", dotColor: "bg-red-500" },
  haute: { label: "Haute", color: "text-orange-700", dotColor: "bg-orange-500" },
  moyenne: { label: "Moyenne", color: "text-yellow-700", dotColor: "bg-yellow-500" },
  basse: { label: "Basse", color: "text-green-700", dotColor: "bg-green-500" },
};

const statusConfig: Record<ActionStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: "Brouillon", color: "text-gray-600", bgColor: "bg-gray-100" },
  pending_approval: { label: "En attente", color: "text-amber-600", bgColor: "bg-amber-100" },
  approved: { label: "Approuvé", color: "text-blue-600", bgColor: "bg-blue-100" },
  in_progress: { label: "En cours", color: "text-indigo-600", bgColor: "bg-indigo-100" },
  blocked: { label: "Bloqué", color: "text-red-600", bgColor: "bg-red-100" },
  completed: { label: "Terminé", color: "text-emerald-600", bgColor: "bg-emerald-100" },
  verified: { label: "Vérifié", color: "text-teal-600", bgColor: "bg-teal-100" },
  closed: { label: "Clôturé", color: "text-gray-500", bgColor: "bg-gray-100" },
};

interface CAPACalendarViewProps {
  onCAPAClick?: (capa: ActionPlan) => void;
  onCreateClick?: () => void;
}

export function CAPACalendarView({ onCAPAClick, onCreateClick }: CAPACalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { canCreate } = useFeaturePermissions("capa");
  
  const dateRange = useMemo(() => ({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  }), [currentMonth]);

  const { data: capas, isLoading } = useCAPAs({
    dateRange,
  });

  // Group CAPAs by due date
  const capasByDate = useMemo(() => {
    if (!capas) return new Map<string, ActionPlan[]>();
    
    const grouped = new Map<string, ActionPlan[]>();
    capas.forEach((capa) => {
      const dateKey = format(capa.dueDate.toDate(), "yyyy-MM-dd");
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, capa]);
    });
    return grouped;
  }, [capas]);

  // Get CAPAs for selected date
  const selectedDateCapas = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return capasByDate.get(dateKey) || [];
  }, [selectedDate, capasByDate]);

  // Check if a CAPA is overdue
  const isOverdue = (capa: ActionPlan) => {
    const now = Date.now();
    return capa.dueDate.toMillis() < now && !["completed", "verified", "closed"].includes(capa.status);
  };

  // Custom day renderer
  const renderDay = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const dayCapas = capasByDate.get(dateKey) || [];
    const hasCapas = dayCapas.length > 0;
    
    const hasOverdue = dayCapas.some(c => isOverdue(c));
    const hasCritique = dayCapas.some(c => c.priority === "critique");
    const allCompleted = dayCapas.length > 0 && dayCapas.every(c => 
      ["completed", "verified", "closed"].includes(c.status)
    );

    return (
      <div className="relative">
        <span>{date.getDate()}</span>
        {hasCapas && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                hasOverdue ? "bg-red-500" :
                hasCritique ? "bg-orange-500" :
                allCompleted ? "bg-emerald-500" : "bg-blue-500"
              )}
            />
            {dayCapas.length > 1 && (
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            )}
          </div>
        )}
      </div>
    );
  };

  // Month statistics
  const monthStats = useMemo(() => {
    if (!capas) return { total: 0, overdue: 0, completed: 0, inProgress: 0 };
    
    return {
      total: capas.length,
      overdue: capas.filter(c => isOverdue(c)).length,
      completed: capas.filter(c => ["completed", "verified", "closed"].includes(c.status)).length,
      inProgress: capas.filter(c => c.status === "in_progress").length,
    };
  }, [capas]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
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
              <CalendarIcon className="h-5 w-5 text-primary" />
              Calendrier des actions
            </CardTitle>
            <CardDescription>
              Visualisez vos actions correctives et préventives par date d'échéance
            </CardDescription>
          </div>
          {canCreate && (
            <Button onClick={onCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle action
            </Button>
          )}
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
          <h3 className="text-lg font-semibold capitalize">
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
              className="rounded-lg border p-3 w-full"
              classNames={{
                months: "flex flex-col sm:flex-row gap-2 w-full",
                month: "flex flex-col gap-4 w-full",
                table: "w-full border-collapse",
                head_row: "flex w-full",
                head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] text-center",
                row: "flex w-full mt-2",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1 [&:has([aria-selected])]:bg-accent [&:has([aria-selected])]:rounded-md",
                day: "h-9 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
              }}
              modifiers={{
                hasCapas: (date) => {
                  const dateKey = format(date, "yyyy-MM-dd");
                  return (capasByDate.get(dateKey)?.length || 0) > 0;
                },
              }}
              modifiersClassNames={{
                hasCapas: "font-bold",
              }}
              components={{
                DayContent: ({ date }) => renderDay(date),
              }}
            />
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Planifiée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <span className="text-muted-foreground">Critique</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Terminée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">En retard</span>
              </div>
            </div>
          </div>

          {/* Selected Date Details */}
          <div className="space-y-4">
            <h4 className="font-medium">
              {selectedDate ? (
                <span className="flex items-center gap-2">
                  Actions du {format(selectedDate, "d MMMM", { locale: fr })}
                  {isToday(selectedDate) && (
                    <Badge variant="secondary">Aujourd'hui</Badge>
                  )}
                </span>
              ) : (
                "Sélectionnez une date"
              )}
            </h4>

            {selectedDate && selectedDateCapas.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <CalendarIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">Aucune action prévue</p>
                {canCreate && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={onCreateClick}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Créer une action
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-4">
                  {selectedDateCapas.map((capa) => {
                    const status = statusConfig[capa.status];
                    const priority = priorityConfig[capa.priority];
                    const overdueStatus = isOverdue(capa);

                    return (
                      <div
                        key={capa.id}
                        className={cn(
                          "rounded-lg border p-3 cursor-pointer hover:shadow-md transition-all",
                          overdueStatus && "border-red-300 bg-red-50/50"
                        )}
                        onClick={() => onCAPAClick?.(capa)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{capa.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {capa.reference}
                            </p>
                          </div>
                          <div className={cn("h-2 w-2 rounded-full shrink-0 mt-1.5", priority.dotColor)} />
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <Badge 
                            variant="outline" 
                            className={cn("text-[10px]", status.color, status.bgColor)}
                          >
                            {overdueStatus ? (
                              <span className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                En retard
                              </span>
                            ) : (
                              status.label
                            )}
                          </Badge>
                          
                          <span className="text-xs text-muted-foreground">
                            {capa.progress}%
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="truncate">{capa.assigneeName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            {/* Month Summary */}
            <div className="rounded-lg bg-muted/50 p-4">
              <h5 className="text-sm font-medium mb-3">Résumé du mois</h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-500" />
                  <div>
                    <span className="text-xs text-muted-foreground">Total:</span>
                    <span className="ml-1 font-medium">{monthStats.total}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  <div>
                    <span className="text-xs text-muted-foreground">En cours:</span>
                    <span className="ml-1 font-medium">{monthStats.inProgress}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <div>
                    <span className="text-xs text-muted-foreground">En retard:</span>
                    <span className="ml-1 font-medium text-red-600">{monthStats.overdue}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <div>
                    <span className="text-xs text-muted-foreground">Terminées:</span>
                    <span className="ml-1 font-medium text-emerald-600">{monthStats.completed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CAPACalendarView;

