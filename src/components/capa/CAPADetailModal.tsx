/**
 * CAPA Detail Modal Component
 * 
 * Modal dialog for viewing and editing CAPA details.
 * Includes checklist, comments, linked items, and AI suggestions.
 */

import { useState } from "react";
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Link as LinkIcon,
  GraduationCap,
  Shield,
  Plus,
  Send,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/common";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useCAPA,
  useToggleChecklistItem,
  useAddChecklistItem,
  useAddCAPAComment,
} from "@/hooks/useCAPAs";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import type { ActionPriority, ActionStatus } from "@/types/capa";

interface CAPADetailModalProps {
  capaId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditClick?: () => void;
}

const priorityConfig: Record<ActionPriority, { label: string; color: string; bgColor: string }> = {
  critique: { label: "Critique", color: "text-red-700", bgColor: "bg-red-100 dark:bg-red-900/40" },
  haute: { label: "Haute", color: "text-orange-700", bgColor: "bg-orange-100 dark:bg-orange-900/40" },
  moyenne: { label: "Moyenne", color: "text-yellow-700", bgColor: "bg-yellow-100 dark:bg-yellow-900/40" },
  basse: { label: "Basse", color: "text-green-700", bgColor: "bg-green-100 dark:bg-green-900/40" },
};

const statusConfig: Record<ActionStatus, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "text-gray-500" },
  pending_approval: { label: "En attente", color: "text-amber-500" },
  approved: { label: "Approuvé", color: "text-primary" },
  in_progress: { label: "En cours", color: "text-indigo-500" },
  blocked: { label: "Bloqué", color: "text-red-500" },
  completed: { label: "Terminé", color: "text-primary" },
  verified: { label: "Vérifié", color: "text-teal-500" },
  closed: { label: "Clôturé", color: "text-gray-400" },
};

export function CAPADetailModal({
  capaId,
  open,
  onOpenChange,
  onEditClick,
}: CAPADetailModalProps) {
  const { data: capa, isLoading, error } = useCAPA(capaId || undefined);
  const { mutate: toggleChecklist } = useToggleChecklistItem();
  const { mutate: addChecklistItem } = useAddChecklistItem();
  const { mutate: addComment } = useAddCAPAComment();
  const { canUpdate } = useFeaturePermissions("capa");

  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleChecklistToggle = (itemId: string, completed: boolean) => {
    if (!capaId || !canUpdate) return;
    toggleChecklist({ capaId, itemId, completed });
  };

  const handleAddChecklistItem = () => {
    if (!capaId || !newChecklistItem.trim() || !canUpdate) return;
    addChecklistItem({ capaId, description: newChecklistItem.trim() });
    setNewChecklistItem("");
  };

  const handleAddComment = async () => {
    if (!capaId || !newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      addComment({ capaId, content: newComment.trim() });
      setNewComment("");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (!capaId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error || !capa ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Erreur lors du chargement
          </div>
        ) : (
          <>
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-start justify-between pr-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-muted-foreground">
                      {capa.reference}
                    </span>
                    {capa.aiGenerated && (
                      <Badge variant="outline" className="gap-1">
                        <Sparkles className="h-3 w-3 text-violet-500" />
                        IA ({capa.aiConfidence}%)
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="text-xl">{capa.title}</DialogTitle>
                </div>
              </div>

              {/* Status and priority badges */}
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    priorityConfig[capa.priority].color,
                    priorityConfig[capa.priority].bgColor
                  )}
                >
                  {priorityConfig[capa.priority].label}
                </Badge>
                <Badge
                  variant="outline"
                  className={statusConfig[capa.status].color}
                >
                  {statusConfig[capa.status].label}
                </Badge>
                <Badge variant="outline">
                  {capa.category === "correctif" ? "Correctif" : "Préventif"}
                </Badge>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1">
              <div className="space-y-6 pr-4">
                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {capa.description}
                  </p>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <UserAvatar
                      user={{ photoURL: null, email: null }}
                      userProfile={{ firstName: capa.assigneeName, lastName: "" }}
                      className="h-5 w-5"
                      fallbackClassName="text-[10px]"
                    />
                    <span className="text-muted-foreground">Assigné à:</span>
                    <span className="font-medium">{capa.assigneeName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Échéance:</span>
                    <span className="font-medium">
                      {capa.dueDate.toDate().toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Progression</h4>
                    <span className="text-sm font-medium">{capa.progress}%</span>
                  </div>
                  <Progress value={capa.progress} className="h-2" />
                </div>

                <Separator />

                {/* Tabs for different sections */}
                <Tabs defaultValue="checklist" className="w-full">
                  <TabsList className="w-full flex">
                    <TabsTrigger value="checklist" className="flex-1 gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Tâches</span>
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="flex-1 gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      <span>Commentaires</span>
                    </TabsTrigger>
                    <TabsTrigger value="links" className="flex-1 gap-1.5">
                      <LinkIcon className="h-4 w-4" />
                      <span>Liens</span>
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="flex-1 gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      <span>IA</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Checklist tab */}
                  <TabsContent value="checklist" className="space-y-3 mt-4">
                    {capa.checklistItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucune tâche définie
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {capa.checklistItems.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              "flex items-start gap-3 p-2 rounded-lg",
                              item.completed && "bg-muted/50"
                            )}
                          >
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={(checked) =>
                                handleChecklistToggle(item.id, !!checked)
                              }
                              disabled={!canUpdate}
                            />
                            <span
                              className={cn(
                                "text-sm flex-1",
                                item.completed && "line-through text-muted-foreground"
                              )}
                            >
                              {item.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {canUpdate && (
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Ajouter une tâche..."
                          value={newChecklistItem}
                          onChange={(e) => setNewChecklistItem(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <Button
                          size="icon"
                          onClick={handleAddChecklistItem}
                          disabled={!newChecklistItem.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* Comments tab */}
                  <TabsContent value="comments" className="space-y-3 mt-4">
                    {capa.comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucun commentaire
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {capa.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <UserAvatar
                              user={{ photoURL: null, email: null }}
                              userProfile={{ firstName: comment.userName, lastName: "" }}
                              className="h-8 w-8"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {comment.userName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {comment.createdAt.toDate().toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Ajouter un commentaire..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <Button
                        size="icon"
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isSubmittingComment}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Links tab */}
                  <TabsContent value="links" className="space-y-4 mt-4">
                    {/* Source */}
                    {capa.sourceIncidentId && (
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Incident source
                        </h5>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                          {capa.sourceIncidentId}
                        </Badge>
                      </div>
                    )}

                    {/* Linked trainings */}
                    {capa.linkedTrainingIds.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Formations liées
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {capa.linkedTrainingIds.map((id) => (
                            <Badge key={id} variant="outline">
                              {id}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Linked equipment */}
                    {capa.linkedEquipmentIds.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Équipements liés
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {capa.linkedEquipmentIds.map((id) => (
                            <Badge key={id} variant="outline">
                              {id}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Linked documents */}
                    {capa.linkedDocumentIds.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Documents liés
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {capa.linkedDocumentIds.map((id) => (
                            <Badge key={id} variant="outline">
                              {id}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {capa.linkedTrainingIds.length === 0 &&
                      capa.linkedEquipmentIds.length === 0 &&
                      capa.linkedDocumentIds.length === 0 &&
                      !capa.sourceIncidentId && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Aucun élément lié
                        </p>
                      )}
                  </TabsContent>

                  {/* AI tab */}
                  <TabsContent value="ai" className="space-y-4 mt-4">
                    {capa.aiGenerated ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-50 dark:bg-violet-950/30">
                          <Sparkles className="h-5 w-5 text-violet-500" />
                          <div>
                            <p className="text-sm font-medium">
                              Généré par CAPA-AI
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Confiance: {capa.aiConfidence}%
                            </p>
                          </div>
                        </div>

                        {capa.aiSuggestions && capa.aiSuggestions.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-2">
                              Suggestions IA
                            </h5>
                            <ul className="space-y-2">
                              {capa.aiSuggestions.map((suggestion, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <span className="text-violet-500">•</span>
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Cette action n'a pas été générée par IA
                        </p>
                        <Button variant="outline" size="sm" className="mt-3">
                          Demander une analyse IA
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>

            {/* Footer actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
              {canUpdate && (
                <Button onClick={onEditClick}>Modifier</Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

