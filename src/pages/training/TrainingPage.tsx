/**
 * Training Page
 * 
 * Main page for training management with:
 * - Stats tiles
 * - Training catalog
 * - My training progress
 * - Admin management
 */

import { useState } from "react";
import { GraduationCap, Plus, BookOpen, Award, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrainingCatalog,
  TrainingForm,
  TrainingProgress,
  TrainingDetailModal,
} from "@/components/training";
import CRUDGuard from "@/components/auth/CRUDGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useTrainingStats, useTrainingCounts } from "@/hooks/useTrainings";
import type { TrainingPlan } from "@/types/capa";

export default function TrainingPage() {
  const { canPerformAction, userProfile } = useAuth();
  const { counts, isLoading: isLoadingStats } = useTrainingCounts();
  const [activeTab, setActiveTab] = useState<"catalog" | "my-trainings" | "admin">("catalog");
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<TrainingPlan | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const canCreateTraining = canPerformAction("training", "create");
  const canManageTrainings = canPerformAction("training", "update");

  const handleOpenTrainingForm = (training?: TrainingPlan) => {
    setSelectedTraining(training || null);
    setShowTrainingForm(true);
  };

  const handleCloseTrainingForm = () => {
    setShowTrainingForm(false);
    setSelectedTraining(null);
  };

  const handleOpenTrainingDetail = (training: TrainingPlan) => {
    setSelectedTraining(training);
    setIsDetailOpen(true);
  };

  const handleCloseTrainingDetail = () => {
    setIsDetailOpen(false);
    setSelectedTraining(null);
  };

  const handleEditFromDetail = () => {
    setIsDetailOpen(false);
    setShowTrainingForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Formations
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Planifiez et suivez les formations SST
          </p>
        </div>
        {canCreateTraining && (
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => handleOpenTrainingForm()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle formation
          </Button>
        )}
      </div>

      {/* Stats Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total formations</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{counts.totalPlans}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actives</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{counts.activePlans}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obligatoires</CardTitle>
            <Award className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{counts.mandatoryPlans}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de complétion</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {counts.completionRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {counts.completedEnrollments}/{counts.totalEnrollments} terminées
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="catalog">
            <BookOpen className="h-4 w-4 mr-2" />
            Catalogue
          </TabsTrigger>
          <TabsTrigger value="my-trainings">
            <Award className="h-4 w-4 mr-2" />
            Mes formations
          </TabsTrigger>
          {canManageTrainings && (
            <TabsTrigger value="admin">
              <Users className="h-4 w-4 mr-2" />
              Administration
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="catalog" className="mt-4">
          <CRUDGuard feature="training" action="read">
            <TrainingCatalog
              onCreateClick={() => handleOpenTrainingForm()}
              onTrainingClick={handleOpenTrainingDetail}
            />
          </CRUDGuard>
        </TabsContent>

        <TabsContent value="my-trainings" className="mt-4">
          <TrainingProgress />
        </TabsContent>

        {canManageTrainings && (
          <TabsContent value="admin" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Administration des formations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TrainingCatalog
                  onCreateClick={() => handleOpenTrainingForm()}
                  onTrainingClick={handleOpenTrainingDetail}
                  onEnrollClick={(training) => {
                    setSelectedTraining(training);
                    setIsDetailOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Training Form Modal */}
      <TrainingForm
        training={selectedTraining}
        isOpen={showTrainingForm}
        onClose={handleCloseTrainingForm}
      />

      {/* Training Detail Modal */}
      {selectedTraining && isDetailOpen && (
        <TrainingDetailModal
          training={selectedTraining}
          isOpen={isDetailOpen}
          onClose={handleCloseTrainingDetail}
          onEdit={handleEditFromDetail}
        />
      )}
    </div>
  );
}
