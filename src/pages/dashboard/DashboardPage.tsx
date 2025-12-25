/**
 * Dashboard Page - Main overview for authenticated users
 */

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileWarning,
  GraduationCap,
  Activity,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Users,
  ClipboardList,
} from "lucide-react";

// Mock data - will be replaced with real data from Firestore
const dashboardStats = {
  totalIncidents: 12,
  openActionPlans: 5,
  pendingConformityChecks: 8,
  upcomingTrainings: 3,
  aiRecommendationsCount: 4,
};

const recentIncidents = [
  {
    id: "1",
    title: "Chute dans l'atelier B",
    severity: "moderate",
    status: "investigating",
    date: "2024-12-20",
  },
  {
    id: "2",
    title: "Exposition chimique zone stockage",
    severity: "severe",
    status: "action_plan_created",
    date: "2024-12-19",
  },
  {
    id: "3",
    title: "Défaut équipement manutention",
    severity: "minor",
    status: "resolved",
    date: "2024-12-18",
  },
];

const aiRecommendations = [
  {
    id: "1",
    type: "training",
    title: "Formation manutention recommandée",
    confidence: 0.92,
    reasoning: "Basé sur 3 incidents similaires ce mois",
  },
  {
    id: "2",
    type: "equipment",
    title: "EPI protection respiratoire",
    confidence: 0.87,
    reasoning: "Zone à risque chimique identifiée",
  },
];

export default function DashboardPage() {
  const { userProfile } = useAuth();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "severe":
        return "bg-orange-500";
      case "moderate":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "investigating":
        return { label: "En investigation", color: "bg-yellow-500/20 text-yellow-400" };
      case "action_plan_created":
        return { label: "Plan d'action", color: "bg-blue-500/20 text-blue-400" };
      case "resolved":
        return { label: "Résolu", color: "bg-emerald-500/20 text-emerald-400" };
      default:
        return { label: status, color: "bg-slate-500/20 text-slate-400" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Bonjour, {userProfile?.firstName || "Utilisateur"} 👋
          </h1>
          <p className="text-slate-600 mt-1">
            Voici l'aperçu de la sécurité de votre organisation
          </p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <ClipboardList className="mr-2 h-4 w-4" />
          Déclarer un incident
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Incidents</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardStats.totalIncidents}</p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-red-600 mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3 ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Plans d'action</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardStats.openActionPlans}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FileWarning className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              2 en retard
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Conformité</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardStats.pendingConformityChecks}</p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <CheckCircle2 className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-2 flex items-center">
              Vérifications en attente
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Formations</p>
                <p className="text-2xl font-bold text-slate-900">{dashboardStats.upcomingTrainings}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center">
              À venir ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-md transition-shadow bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700">IA Recommandations</p>
                <p className="text-2xl font-bold text-emerald-900">{dashboardStats.aiRecommendationsCount}</p>
              </div>
              <div className="rounded-full bg-emerald-200 p-3">
                <Sparkles className="h-5 w-5 text-emerald-700" />
              </div>
            </div>
            <p className="text-xs text-emerald-600 mt-2 flex items-center">
              Actions suggérées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Incidents récents</CardTitle>
              <CardDescription>Derniers incidents déclarés</CardDescription>
            </div>
            <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700">
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIncidents.map((incident) => {
                const status = getStatusLabel(incident.status);
                return (
                  <div
                    key={incident.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(incident.severity)}`} />
                      <div>
                        <p className="font-medium text-slate-900">{incident.title}</p>
                        <p className="text-sm text-slate-500">{incident.date}</p>
                      </div>
                    </div>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <CardTitle className="text-lg">Suggestions IA</CardTitle>
            </div>
            <CardDescription>Recommandations basées sur vos données</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {rec.type === "training" ? "Formation" : "Équipement"}
                    </Badge>
                    <span className="text-xs text-emerald-600 font-medium">
                      {Math.round(rec.confidence * 100)}% confiance
                    </span>
                  </div>
                  <p className="font-medium text-slate-900 text-sm">{rec.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{rec.reasoning}</p>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2">
                Voir toutes les suggestions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-blue-100 p-4 mb-4 group-hover:bg-blue-200 transition-colors">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-slate-900">Audits</h3>
              <p className="text-sm text-slate-500 mt-1">Gérer les audits de conformité</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-purple-100 p-4 mb-4 group-hover:bg-purple-200 transition-colors">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-slate-900">Formations</h3>
              <p className="text-sm text-slate-500 mt-1">Planifier des sessions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-amber-100 p-4 mb-4 group-hover:bg-amber-200 transition-colors">
                <FileWarning className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-medium text-slate-900">CAPA</h3>
              <p className="text-sm text-slate-500 mt-1">Actions correctives</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-emerald-100 p-4 mb-4 group-hover:bg-emerald-200 transition-colors">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-medium text-slate-900">Équipe</h3>
              <p className="text-sm text-slate-500 mt-1">Gérer les utilisateurs</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

