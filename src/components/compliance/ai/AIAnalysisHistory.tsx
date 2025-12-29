/**
 * AI Analysis History Component
 * 
 * Displays past AI analyses with:
 * - Search by text
 * - Filter by date
 * - List/table view
 * - Detailed view of each analysis
 */

import { useState, useMemo } from "react";
import {
  Brain,
  Search,
  Calendar,
  ChevronRight,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Trash2,
  X,
  Filter,
  List,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useAIAnalyses, useDeleteAIAnalysis } from "@/hooks/useCompliance";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { AIAnalysis, AIAnalysisFilters, AIAnalysisType } from "@/types/conformity";

const TYPE_LABELS: Record<AIAnalysisType, string> = {
  gap_analysis: "Analyse d'écarts",
  audit_planning: "Planification d'audits",
  capa_suggestions: "Suggestions CAPA",
  compliance_report: "Rapport de conformité",
};

const TYPE_COLORS: Record<AIAnalysisType, string> = {
  gap_analysis: "bg-purple-100 text-purple-800",
  audit_planning: "bg-secondary text-primary",
  capa_suggestions: "bg-amber-100 text-amber-800",
  compliance_report: "bg-secondary text-primary",
};

interface AIAnalysisHistoryProps {
  className?: string;
}

export function AIAnalysisHistory({ className }: AIAnalysisHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AIAnalysisType | "all">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysis | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);

  // Build filters based on UI state
  const filters: AIAnalysisFilters = useMemo(() => {
    const result: AIAnalysisFilters = {};
    
    if (typeFilter !== "all") {
      result.type = [typeFilter];
    }
    
    if (searchQuery.trim()) {
      result.searchQuery = searchQuery.trim();
    }
    
    if (dateFilter !== "all") {
      const now = new Date();
      const start = new Date();
      
      switch (dateFilter) {
        case "today":
          start.setHours(0, 0, 0, 0);
          break;
        case "week":
          start.setDate(now.getDate() - 7);
          break;
        case "month":
          start.setMonth(now.getMonth() - 1);
          break;
      }
      
      result.dateRange = { start, end: now };
    }
    
    return result;
  }, [typeFilter, searchQuery, dateFilter]);

  const { data: analyses, isLoading, error } = useAIAnalyses(filters);
  const deleteAnalysis = useDeleteAIAnalysis();

  const handleViewDetails = (analysis: AIAnalysis) => {
    setSelectedAnalysis(analysis);
    setDetailModalOpen(true);
  };

  const handleDeleteClick = (analysisId: string) => {
    setAnalysisToDelete(analysisId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!analysisToDelete) return;
    
    try {
      await deleteAnalysis.mutateAsync(analysisToDelete);
      toast.success("Analyse supprimée");
      setDeleteDialogOpen(false);
      setAnalysisToDelete(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const formatDate = (timestamp: { toDate: () => Date }) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (timestamp: { toDate: () => Date }) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-amber-500" />
          <p>Erreur lors du chargement de l'historique</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historique des analyses
              </CardTitle>
              <CardDescription>
                Consultez vos analyses IA passées
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AIAnalysisType | "all")}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="gap_analysis">Analyse d'écarts</SelectItem>
                <SelectItem value="audit_planning">Planification d'audits</SelectItem>
                <SelectItem value="capa_suggestions">Suggestions CAPA</SelectItem>
                <SelectItem value="compliance_report">Rapport</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as typeof dateFilter)}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">7 derniers jours</SelectItem>
                <SelectItem value="month">30 derniers jours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {!analyses || analyses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Aucune analyse trouvée</p>
              <p className="text-sm mt-1">
                Lancez une analyse depuis l'onglet Vue d'ensemble
              </p>
            </div>
          ) : viewMode === "list" ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(analysis)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={cn("text-xs", TYPE_COLORS[analysis.type])}>
                            {TYPE_LABELS[analysis.type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatShortDate(analysis.createdAt)}
                          </span>
                        </div>
                        <p className="font-medium">{analysis.title}</p>
                        {analysis.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {analysis.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right">
                          <p className="text-lg font-bold">{analysis.overallScore}%</p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {analysis.gaps.length} écarts
                          </Badge>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Écarts</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.map((analysis) => (
                    <TableRow key={analysis.id}>
                      <TableCell className="text-sm">
                        {formatShortDate(analysis.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", TYPE_COLORS[analysis.type])}>
                          {TYPE_LABELS[analysis.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {analysis.title}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "font-bold",
                          analysis.overallScore >= 80 && "text-primary",
                          analysis.overallScore >= 50 && analysis.overallScore < 80 && "text-amber-600",
                          analysis.overallScore < 50 && "text-red-600"
                        )}>
                          {analysis.overallScore}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{analysis.gaps.length}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(analysis)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(analysis.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <DialogTitle>Détails de l'analyse</DialogTitle>
            </div>
            {selectedAnalysis && (
              <DialogDescription className="flex items-center gap-2">
                <Badge className={cn("text-xs", TYPE_COLORS[selectedAnalysis.type])}>
                  {TYPE_LABELS[selectedAnalysis.type]}
                </Badge>
                <span>{formatDate(selectedAnalysis.createdAt)}</span>
                <span>par {selectedAnalysis.analyzedByName}</span>
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedAnalysis && (
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-6 p-1">
                {/* Summary */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{selectedAnalysis.overallScore}%</p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="text-2xl font-bold">{selectedAnalysis.gaps.length}</p>
                          <p className="text-xs text-muted-foreground">Écarts</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-2xl font-bold">{selectedAnalysis.recommendations.length}</p>
                          <p className="text-xs text-muted-foreground">Recommandations</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{selectedAnalysis.auditRecommendations.length}</p>
                          <p className="text-xs text-muted-foreground">Audits suggérés</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Gaps */}
                {selectedAnalysis.gaps.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Écarts identifiés</h3>
                    <div className="space-y-2">
                      {selectedAnalysis.gaps.map((gap, i) => (
                        <div key={i} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{gap.normCode}</Badge>
                            <span className="text-xs text-muted-foreground">Clause {gap.clause}</span>
                            <Badge className={cn(
                              "text-xs",
                              gap.severity === "critical" && "bg-red-100 text-red-800",
                              gap.severity === "major" && "bg-amber-100 text-amber-800",
                              gap.severity === "minor" && "bg-secondary text-primary"
                            )}>
                              {gap.severity === "critical" ? "Critique" : 
                               gap.severity === "major" ? "Majeur" : "Mineur"}
                            </Badge>
                          </div>
                          <p className="text-sm">{gap.description}</p>
                          {gap.suggestedAction && (
                            <p className="text-sm text-muted-foreground mt-1">
                              → {gap.suggestedAction}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedAnalysis.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Recommandations</h3>
                    <div className="space-y-2">
                      {selectedAnalysis.recommendations.map((rec, i) => (
                        <div key={i} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={cn(
                              "text-xs",
                              rec.priority === "high" && "bg-red-100 text-red-800",
                              rec.priority === "medium" && "bg-amber-100 text-amber-800",
                              rec.priority === "low" && "bg-secondary text-primary"
                            )}>
                              {rec.priority === "high" ? "Haute" : 
                               rec.priority === "medium" ? "Moyenne" : "Basse"}
                            </Badge>
                            <span className="font-medium">{rec.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette analyse ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'analyse sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

