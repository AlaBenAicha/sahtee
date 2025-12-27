/**
 * AIHistoryPanel - Display history of AI analyses and suggestions
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  History,
  Sparkles,
  Target,
  TrendingUp,
  Network,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BarChart3,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getCAPAAIHistory,
  deleteCAPAAIHistory,
  getCAPAAIHistoryStats,
  type CAPAAIHistoryEntry,
  type CAPAAIHistoryType,
  type CAPAAIHistoryStatus,
} from "@/services/ai/capaAIHistoryService";
import type { SuggestedCapa } from "@/services/ai/types";

interface AIHistoryPanelProps {
  onApplySuggestion?: (suggestion: SuggestedCapa) => void;
  onViewDetails?: (entry: CAPAAIHistoryEntry) => void;
}

const typeIcons: Record<CAPAAIHistoryType, React.ElementType> = {
  suggestions: Sparkles,
  analysis: Target,
  predictions: TrendingUp,
  patterns: Network,
  investigation: Search,
};

const typeLabels: Record<CAPAAIHistoryType, string> = {
  suggestions: "Suggestions",
  analysis: "Analyses",
  predictions: "Prédictions",
  patterns: "Patterns",
  investigation: "Investigations",
};

const statusConfig: Record<CAPAAIHistoryStatus, { icon: React.ElementType; color: string; label: string }> = {
  completed: { icon: CheckCircle2, color: "text-green-500", label: "Terminé" },
  in_progress: { icon: Clock, color: "text-yellow-500", label: "En cours" },
  failed: { icon: XCircle, color: "text-red-500", label: "Échec" },
  applied: { icon: FileCheck, color: "text-blue-500", label: "Appliqué" },
};

export function AIHistoryPanel({ onApplySuggestion, onViewDetails }: AIHistoryPanelProps) {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<CAPAAIHistoryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<CAPAAIHistoryEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<CAPAAIHistoryType | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [detailsEntry, setDetailsEntry] = useState<CAPAAIHistoryEntry | null>(null);
  const [stats, setStats] = useState<{
    totalEntries: number;
    byType: Record<CAPAAIHistoryType, number>;
    appliedSuggestions: number;
    createdCapas: number;
    averageConfidence: number;
  } | null>(null);

  // Fetch history
  useEffect(() => {
    if (!session?.organizationId) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const [historyData, statsData] = await Promise.all([
          getCAPAAIHistory(session.organizationId, { limit: 100 }),
          getCAPAAIHistoryStats(session.organizationId),
        ]);
        setEntries(historyData);
        setFilteredEntries(historyData);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch AI history:", error);
        toast.error("Impossible de charger l'historique IA");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [session?.organizationId]);

  // Apply filter
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredEntries(entries);
    } else {
      setFilteredEntries(entries.filter(e => e.type === activeFilter));
    }
  }, [activeFilter, entries]);

  // Handle delete
  const handleDelete = async (entryId: string) => {
    try {
      await deleteCAPAAIHistory(entryId);
      setEntries(prev => prev.filter(e => e.id !== entryId));
      toast.success("Entrée supprimée");
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Failed to delete history entry:", error);
      toast.error("Impossible de supprimer l'entrée");
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (!session?.organizationId) return;
    
    setIsLoading(true);
    try {
      const historyData = await getCAPAAIHistory(session.organizationId, { limit: 100 });
      setEntries(historyData);
      toast.success("Historique actualisé");
    } catch (error) {
      toast.error("Impossible d'actualiser l'historique");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (timestamp: { toDate: () => Date } | Date) => {
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
    
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Chargement de l'historique...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && stats.totalEntries > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20 border-violet-200 dark:border-violet-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.totalEntries}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-muted-foreground">Suggestions</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.byType.suggestions || 0}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-muted-foreground">Appliquées</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.appliedSuggestions}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-muted-foreground">Confiance moy.</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {stats.averageConfidence > 0 ? `${Math.round(stats.averageConfidence * 100)}%` : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main History Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-violet-500" />
                Historique IA
              </CardTitle>
              <CardDescription>
                Toutes les analyses et suggestions générées par CAPA-AI
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Actualiser
            </Button>
          </div>

          {/* Filter Tabs */}
          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as CAPAAIHistoryType | "all")} className="mt-4">
            <TabsList className="flex w-full">
              <TabsTrigger value="all" className="flex-1 text-xs">
                Tout ({entries.length})
              </TabsTrigger>
              {Object.entries(typeLabels).map(([type, label]) => {
                const Icon = typeIcons[type as CAPAAIHistoryType];
                const count = entries.filter(e => e.type === type).length;
                return (
                  <TabsTrigger key={type} value={type} className="flex-1 text-xs gap-1" disabled={count === 0}>
                    <Icon className="h-3 w-3" />
                    {label} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Aucun historique</p>
              <p className="text-sm mt-1">
                {activeFilter === "all"
                  ? "Les analyses et suggestions IA apparaîtront ici"
                  : `Aucune entrée de type "${typeLabels[activeFilter as CAPAAIHistoryType]}" trouvée`}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {filteredEntries.map((entry) => {
                  const TypeIcon = typeIcons[entry.type];
                  const statusInfo = statusConfig[entry.status];
                  const StatusIcon = statusInfo.icon;
                  const isExpanded = expandedId === entry.id;

                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        "border rounded-lg transition-all",
                        isExpanded && "ring-2 ring-violet-500/20"
                      )}
                    >
                      {/* Header */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            entry.type === "suggestions" && "bg-violet-100 dark:bg-violet-900/50",
                            entry.type === "analysis" && "bg-blue-100 dark:bg-blue-900/50",
                            entry.type === "predictions" && "bg-green-100 dark:bg-green-900/50",
                            entry.type === "patterns" && "bg-amber-100 dark:bg-amber-900/50",
                            entry.type === "investigation" && "bg-rose-100 dark:bg-rose-900/50",
                          )}>
                            <TypeIcon className={cn(
                              "h-4 w-4",
                              entry.type === "suggestions" && "text-violet-600 dark:text-violet-400",
                              entry.type === "analysis" && "text-blue-600 dark:text-blue-400",
                              entry.type === "predictions" && "text-green-600 dark:text-green-400",
                              entry.type === "patterns" && "text-amber-600 dark:text-amber-400",
                              entry.type === "investigation" && "text-rose-600 dark:text-rose-400",
                            )} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{entry.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(entry.createdAt)} • par {entry.createdByName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-xs", statusInfo.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          {entry.confidence && (
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(entry.confidence * 100)}%
                            </Badge>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t pt-4 space-y-4">
                          {entry.description && (
                            <p className="text-sm text-muted-foreground">{entry.description}</p>
                          )}

                          {/* Suggestions list */}
                          {entry.type === "suggestions" && entry.suggestions && entry.suggestions.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase">
                                Suggestions ({entry.suggestions.length})
                              </p>
                              <div className="space-y-2">
                                {entry.suggestions.map((suggestion, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
                                  >
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{suggestion.title}</p>
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {suggestion.description}
                                      </p>
                                      <div className="flex gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs">
                                          {suggestion.priority}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {suggestion.category}
                                        </Badge>
                                        {suggestion.confidence && (
                                          <Badge variant="secondary" className="text-xs">
                                            {Math.round(suggestion.confidence * 100)}% confiance
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    {onApplySuggestion && entry.status !== "applied" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onApplySuggestion(suggestion);
                                        }}
                                      >
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        Appliquer
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {entry.incidentsAnalyzed && (
                              <span>{entry.incidentsAnalyzed} incident(s) analysé(s)</span>
                            )}
                            {entry.capasAnalyzed && (
                              <span>{entry.capasAnalyzed} CAPA(s) analysé(s)</span>
                            )}
                            {entry.createdCapaIds && entry.createdCapaIds.length > 0 && (
                              <span className="text-green-600">
                                {entry.createdCapaIds.length} CAPA(s) créé(s)
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailsEntry(entry);
                                onViewDetails?.(entry);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Détails
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(entry.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette entrée ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'entrée sera définitivement supprimée de l'historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Details Modal */}
      <Dialog open={!!detailsEntry} onOpenChange={(open) => !open && setDetailsEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {detailsEntry && (
                <div className={cn(
                  "p-2 rounded-lg",
                  detailsEntry.type === "suggestions" && "bg-violet-100 dark:bg-violet-900/50",
                  detailsEntry.type === "analysis" && "bg-blue-100 dark:bg-blue-900/50",
                  detailsEntry.type === "predictions" && "bg-green-100 dark:bg-green-900/50",
                  detailsEntry.type === "patterns" && "bg-amber-100 dark:bg-amber-900/50",
                  detailsEntry.type === "investigation" && "bg-rose-100 dark:bg-rose-900/50",
                )}>
                  {detailsEntry && (() => {
                    const TypeIcon = typeIcons[detailsEntry.type];
                    return (
                      <TypeIcon className={cn(
                        "h-5 w-5",
                        detailsEntry.type === "suggestions" && "text-violet-600 dark:text-violet-400",
                        detailsEntry.type === "analysis" && "text-blue-600 dark:text-blue-400",
                        detailsEntry.type === "predictions" && "text-green-600 dark:text-green-400",
                        detailsEntry.type === "patterns" && "text-amber-600 dark:text-amber-400",
                        detailsEntry.type === "investigation" && "text-rose-600 dark:text-rose-400",
                      )} />
                    );
                  })()}
                </div>
              )}
              <div>
                <DialogTitle>{detailsEntry?.title}</DialogTitle>
                <DialogDescription>
                  {detailsEntry && formatDate(detailsEntry.createdAt)} • par {detailsEntry?.createdByName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            {detailsEntry && (
              <div className="space-y-6 py-4">
                {/* Status and confidence */}
                <div className="flex items-center gap-3">
                  {(() => {
                    const statusInfo = statusConfig[detailsEntry.status];
                    const StatusIcon = statusInfo.icon;
                    return (
                      <Badge variant="outline" className={cn("text-sm", statusInfo.color)}>
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    );
                  })()}
                  {detailsEntry.confidence && (
                    <Badge variant="secondary" className="text-sm">
                      {Math.round(detailsEntry.confidence * 100)}% confiance
                    </Badge>
                  )}
                </div>

                {/* Description */}
                {detailsEntry.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{detailsEntry.description}</p>
                  </div>
                )}

                <Separator />

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  {detailsEntry.incidentsAnalyzed !== undefined && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Incidents analysés</p>
                      <p className="text-lg font-semibold">{detailsEntry.incidentsAnalyzed}</p>
                    </div>
                  )}
                  {detailsEntry.capasAnalyzed !== undefined && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">CAPAs analysées</p>
                      <p className="text-lg font-semibold">{detailsEntry.capasAnalyzed}</p>
                    </div>
                  )}
                  {detailsEntry.createdCapaIds && detailsEntry.createdCapaIds.length > 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">CAPAs créées</p>
                      <p className="text-lg font-semibold text-green-600">{detailsEntry.createdCapaIds.length}</p>
                    </div>
                  )}
                  {detailsEntry.appliedSuggestions && detailsEntry.appliedSuggestions.length > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">Suggestions appliquées</p>
                      <p className="text-lg font-semibold text-blue-600">{detailsEntry.appliedSuggestions.length}</p>
                    </div>
                  )}
                </div>

                {/* Type-specific content */}
                {detailsEntry.type === "suggestions" && detailsEntry.suggestions && detailsEntry.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-500" />
                      Suggestions générées ({detailsEntry.suggestions.length})
                    </h4>
                    <div className="space-y-3">
                      {detailsEntry.suggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium">{suggestion.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {suggestion.description}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <Badge variant="outline" className={cn(
                                  "text-xs",
                                  suggestion.priority === "critique" && "border-red-500 text-red-500",
                                  suggestion.priority === "haute" && "border-orange-500 text-orange-500",
                                  suggestion.priority === "moyenne" && "border-amber-500 text-amber-500",
                                  suggestion.priority === "basse" && "border-gray-500 text-gray-500",
                                )}>
                                  {suggestion.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.category}
                                </Badge>
                                {suggestion.confidence && (
                                  <Badge variant="secondary" className="text-xs">
                                    {Math.round(suggestion.confidence * 100)}% confiance
                                  </Badge>
                                )}
                              </div>
                              {suggestion.reasoning && (
                                <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                                  <strong>Raisonnement :</strong> {suggestion.reasoning}
                                </div>
                              )}
                            </div>
                            {onApplySuggestion && detailsEntry.status !== "applied" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                                onClick={() => {
                                  onApplySuggestion(suggestion);
                                  setDetailsEntry(null);
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Appliquer
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailsEntry.type === "analysis" && detailsEntry.rootCauseAnalysis && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Analyse des causes racines
                    </h4>
                    <div className="space-y-4">
                      {detailsEntry.rootCauseAnalysis.rootCauses && detailsEntry.rootCauseAnalysis.rootCauses.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Causes identifiées</p>
                          <div className="space-y-2">
                            {detailsEntry.rootCauseAnalysis.rootCauses.map((cause, idx) => (
                              <div key={idx} className="p-3 border rounded-lg bg-card">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                  <span className="font-medium">{cause.cause}</span>
                                  {cause.probability && (
                                    <Badge variant="secondary" className="ml-auto text-xs">
                                      {Math.round(cause.probability * 100)}%
                                    </Badge>
                                  )}
                                </div>
                                {cause.category && (
                                  <Badge variant="outline" className="mt-2 text-xs">
                                    {cause.category}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {detailsEntry.rootCauseAnalysis.recommendedActions && detailsEntry.rootCauseAnalysis.recommendedActions.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Actions recommandées</p>
                          <ul className="space-y-2">
                            {detailsEntry.rootCauseAnalysis.recommendedActions.map((action, idx) => (
                              <li key={idx} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span className="text-sm">{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {detailsEntry.type === "predictions" && detailsEntry.predictions && detailsEntry.predictions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Prédictions ({detailsEntry.predictions.length})
                    </h4>
                    <div className="space-y-3">
                      {detailsEntry.predictions.map((prediction, idx) => (
                        <div key={idx} className="p-4 border rounded-lg bg-card">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{prediction.title || prediction.type}</p>
                              {prediction.description && (
                                <p className="text-sm text-muted-foreground mt-1">{prediction.description}</p>
                              )}
                            </div>
                            {prediction.probability && (
                              <Badge variant="secondary">
                                {Math.round(prediction.probability * 100)}%
                              </Badge>
                            )}
                          </div>
                          {prediction.riskLevel && (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "mt-2",
                                prediction.riskLevel === "critical" && "border-red-500 text-red-500",
                                prediction.riskLevel === "high" && "border-orange-500 text-orange-500",
                                prediction.riskLevel === "medium" && "border-amber-500 text-amber-500",
                                prediction.riskLevel === "low" && "border-green-500 text-green-500",
                              )}
                            >
                              Risque {prediction.riskLevel}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailsEntry.type === "patterns" && detailsEntry.patterns && detailsEntry.patterns.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Network className="h-4 w-4 text-amber-500" />
                      Patterns détectés ({detailsEntry.patterns.length})
                    </h4>
                    <div className="space-y-3">
                      {detailsEntry.patterns.map((pattern, idx) => (
                        <div key={idx} className="p-4 border rounded-lg bg-card">
                          <p className="font-medium">{pattern.name || `Pattern ${idx + 1}`}</p>
                          {pattern.description && (
                            <p className="text-sm text-muted-foreground mt-1">{pattern.description}</p>
                          )}
                          {pattern.incidentCount && (
                            <Badge variant="secondary" className="mt-2">
                              {pattern.incidentCount} incident(s)
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state for content types */}
                {detailsEntry.type === "suggestions" && (!detailsEntry.suggestions || detailsEntry.suggestions.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune suggestion disponible dans cette entrée</p>
                  </div>
                )}

                {detailsEntry.type === "analysis" && !detailsEntry.rootCauseAnalysis && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune donnée d'analyse disponible</p>
                  </div>
                )}

                {detailsEntry.type === "predictions" && (!detailsEntry.predictions || detailsEntry.predictions.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune prédiction disponible dans cette entrée</p>
                  </div>
                )}

                {detailsEntry.type === "patterns" && (!detailsEntry.patterns || detailsEntry.patterns.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun pattern détecté dans cette entrée</p>
                  </div>
                )}

                {detailsEntry.type === "investigation" && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Session d'investigation</p>
                    <p className="text-sm">Les détails de la session sont enregistrés.</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

