import {
  AlertCircle,
  Calendar,
  Download,
  FileText,
  Filter,
  Heart,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

export function OccupationalHealth() {
  const [activeTab, setActiveTab] = useState("overview");

  const healthMetrics = [
    { category: "TMS", cases: 15, trend: "+12%", color: "bg-red-500" },
    {
      category: "Troubles respiratoires",
      cases: 8,
      trend: "-5%",
      color: "bg-orange-500",
    },
    {
      category: "Allergies professionnelles",
      cases: 6,
      trend: "+8%",
      color: "bg-yellow-500",
    },
    {
      category: "Fatigue chronique",
      cases: 12,
      trend: "+15%",
      color: "bg-purple-500",
    },
    {
      category: "Troubles auditifs",
      cases: 4,
      trend: "0%",
      color: "bg-blue-500",
    },
    {
      category: "Stress professionnel",
      cases: 18,
      trend: "+22%",
      color: "bg-indigo-500",
    },
  ];

  const medicalFiles = [
    {
      id: 1,
      employeeId: "EMP001",
      employeeName: "Marie Dubois",
      department: "Production",
      conditions: ["TMS - Épaule droite", "Allergie latex"],
      lastVisit: "2024-01-15",
      nextVisit: "2024-07-15",
      restrictions: ["Port charges &gt; 10kg", "Éviter contact latex"],
      status: "Suivi actif",
    },
    {
      id: 2,
      employeeId: "EMP002",
      employeeName: "Jean Martin",
      department: "Laboratoire",
      conditions: ["Trouble respiratoire", "Dermatite contact"],
      lastVisit: "2024-01-10",
      nextVisit: "2024-04-10",
      restrictions: ["Poste ventilé obligatoire", "Gants nitrile"],
      status: "Amélioration",
    },
    {
      id: 3,
      employeeId: "EMP003",
      employeeName: "Sophie Durand",
      department: "Administration",
      conditions: ["Stress professionnel", "Fatigue chronique"],
      lastVisit: "2024-01-08",
      nextVisit: "2024-03-08",
      restrictions: ["Pauses fréquentes", "Télétravail 2j/sem"],
      status: "Surveillance",
    },
  ];

  const exposureData = [
    {
      substance: "Poussières de silice",
      exposedWorkers: 23,
      limit: "0.05 mg/m³",
      currentLevel: "0.03 mg/m³",
      riskLevel: "Faible",
      lastMeasurement: "2024-01-10",
    },
    {
      substance: "Bruit",
      exposedWorkers: 67,
      limit: "85 dB(A)",
      currentLevel: "78 dB(A)",
      riskLevel: "Acceptable",
      lastMeasurement: "2024-01-15",
    },
    {
      substance: "Vapeurs de solvants",
      exposedWorkers: 12,
      limit: "50 ppm",
      currentLevel: "45 ppm",
      riskLevel: "Modéré",
      lastMeasurement: "2024-01-12",
    },
    {
      substance: "Vibrations main-bras",
      exposedWorkers: 34,
      limit: "2.5 m/s²",
      currentLevel: "1.8 m/s²",
      riskLevel: "Faible",
      lastMeasurement: "2024-01-18",
    },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Faible":
        return "bg-green-100 text-green-800";
      case "Acceptable":
        return "bg-blue-100 text-blue-800";
      case "Modéré":
        return "bg-orange-100 text-orange-800";
      case "Élevé":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Suivi actif":
        return "bg-orange-100 text-orange-800";
      case "Amélioration":
        return "bg-green-100 text-green-800";
      case "Surveillance":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900">Health Barometer</h1>
            <p className="text-gray-600">
              Surveillance de la santé collective et suivi des maladies
              professionnelles
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Rapport santé
            </Button>
            <Button className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
              <FileText className="w-4 h-4 mr-2" />
              Nouvelle déclaration
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="p-6 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cas actifs</p>
                  <p className="text-2xl font-bold text-[var(--sahtee-blue-primary)]">
                    63
                  </p>
                </div>
                <Heart className="w-6 h-6 text-[var(--sahtee-blue-primary)]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Employés sous surveillance
                  </p>
                  <p className="text-2xl font-bold text-orange-500">89</p>
                </div>
                <Users className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Évolution mensuelle</p>
                  <p className="text-2xl font-bold text-red-500">+12%</p>
                </div>
                <TrendingUp className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Alertes expositions</p>
                  <p className="text-2xl font-bold text-yellow-500">3</p>
                </div>
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <TrendingUp className="w-4 h-4 inline-block mr-2" />
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "files"
                ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4 inline-block mr-2" />
            Fiches médicales
          </button>
          <button
            onClick={() => setActiveTab("exposure")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "exposure"
                ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <AlertCircle className="w-4 h-4 inline-block mr-2" />
            Expositions
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Health Metrics Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition des maladies professionnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-6">
                  {healthMetrics.map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full ${metric.color}`}
                        ></div>
                        <span className="font-medium">{metric.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">
                          {metric.cases}
                        </span>
                        <Badge
                          className={
                            metric.trend.startsWith("+")
                              ? "bg-red-100 text-red-800"
                              : metric.trend.startsWith("-")
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {metric.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution de la santé collective</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid lg:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        +15%
                      </div>
                      <div className="text-sm text-red-700">
                        TMS ce trimestre
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        8.2%
                      </div>
                      <div className="text-sm text-orange-700">
                        Taux absentéisme santé
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        72h
                      </div>
                      <div className="text-sm text-blue-700">
                        Durée moyenne arrêt
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Actions prioritaires</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Révision postes de travail (TMS)</span>
                        <Badge className="bg-red-100 text-red-800">
                          Urgent
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Formation gestes et postures</span>
                        <Badge className="bg-orange-100 text-orange-800">
                          Important
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Amélioration ventilation zones chimiques</span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Planifié
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "files" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un employé..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </div>

            {/* Medical Files */}
            <div className="space-y-4">
              {medicalFiles.map((file) => (
                <Card
                  key={file.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{file.employeeName}</h4>
                          <span className="text-sm text-gray-500">
                            ({file.employeeId})
                          </span>
                          <Badge className={getStatusColor(file.status)}>
                            {file.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {file.department}
                        </p>

                        <div className="grid lg:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm mb-2">
                              Conditions médicales
                            </h5>
                            <div className="space-y-1">
                              {file.conditions.map((condition, index) => (
                                <div
                                  key={index}
                                  className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded"
                                >
                                  {condition}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium text-sm mb-2">
                              Restrictions de poste
                            </h5>
                            <div className="space-y-1">
                              {file.restrictions.map((restriction, index) => (
                                <div
                                  key={index}
                                  className="text-sm text-orange-700 bg-orange-50 px-2 py-1 rounded"
                                >
                                  {restriction}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Dernière visite: {file.lastVisit}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Prochaine visite: {file.nextVisit}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Voir dossier
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
                        >
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "exposure" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Suivi des expositions professionnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exposureData.map((exposure, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{exposure.substance}</h4>
                          <p className="text-sm text-gray-600">
                            {exposure.exposedWorkers} travailleurs exposés
                          </p>
                        </div>
                        <Badge className={getRiskColor(exposure.riskLevel)}>
                          {exposure.riskLevel}
                        </Badge>
                      </div>

                      <div className="grid lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">
                            Limite réglementaire
                          </span>
                          <div className="font-medium">{exposure.limit}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Niveau actuel</span>
                          <div className="font-medium">
                            {exposure.currentLevel}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Dernière mesure</span>
                          <div className="font-medium">
                            {exposure.lastMeasurement}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button size="sm" variant="outline">
                            Voir historique
                          </Button>
                        </div>
                      </div>

                      {/* Progress bar showing exposure level */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Niveau d'exposition</span>
                          <span>
                            {Math.round(
                              (parseFloat(exposure.currentLevel) /
                                parseFloat(exposure.limit)) *
                                100
                            )}
                            % de la limite
                          </span>
                        </div>
                        <Progress
                          value={
                            (parseFloat(exposure.currentLevel) /
                              parseFloat(exposure.limit)) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Exposure Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Alertes et recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">
                        Vapeurs de solvants - Niveau modéré
                      </p>
                      <p className="text-xs text-orange-700">
                        Révision du système de ventilation recommandée
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <AlertCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Bruit - Niveau acceptable
                      </p>
                      <p className="text-xs text-green-700">
                        Maintenir les mesures de protection actuelles
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
