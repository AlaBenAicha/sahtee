import {
  AlertTriangle,
  Book,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Filter,
  Plus,
  Search,
  Target,
  Upload,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";

export function AuditRoom() {
  const [activeTab, setActiveTab] = useState("library");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showNewAuditDialog, setShowNewAuditDialog] = useState(false);

  const regulations = [
    {
      id: 1,
      name: "ISO 45001:2018",
      category: "Management SST",
      status: "Conforme",
      progress: 94,
      lastUpdate: "2024-01-15",
      nextAudit: "2024-06-15",
    },
    {
      id: 2,
      name: "Directive Machines 2006/42/CE",
      category: "Sécurité machines",
      status: "En cours",
      progress: 78,
      lastUpdate: "2024-01-10",
      nextAudit: "2024-03-10",
    },
    {
      id: 3,
      name: "OSHA Standards",
      category: "Sécurité US",
      status: "À réviser",
      progress: 65,
      lastUpdate: "2023-12-20",
      nextAudit: "2024-02-20",
    },
    {
      id: 4,
      name: "Code du Travail - Livre IV",
      category: "Réglementation FR",
      status: "Conforme",
      progress: 88,
      lastUpdate: "2024-01-05",
      nextAudit: "2024-07-05",
    },
  ];

  const audits = [
    {
      id: 1,
      title: "Audit Semestriel ISO 45001",
      site: "Site Principal",
      auditor: "Bureau Veritas",
      date: "2024-01-15",
      status: "Terminé",
      score: 94,
      findings: 3,
    },
    {
      id: 2,
      title: "Audit Sécurité Machines",
      site: "Atelier Production",
      auditor: "TÜV SÜD",
      date: "2024-02-01",
      status: "En cours",
      score: 0,
      findings: 0,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Conforme":
        return "bg-green-100 text-green-800";
      case "En cours":
        return "bg-blue-100 text-blue-800";
      case "À réviser":
        return "bg-orange-100 text-orange-800";
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
            <h1 className="text-2xl text-gray-900">Conformity Room</h1>
            <p className="text-gray-600">
              Bibliothèque réglementaire : normes ISO, OSHA, COR, IAP -
              Traçabilité complète et alertes automatiques
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImportDialog(true)}
              className="border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-primary)] hover:text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importer données juridiques
            </Button>
            <Button
              type="button"
              onClick={() => setShowNewAuditDialog(true)}
              className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel audit
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="flex space-x-8 px-6">
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "library"
                ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Book className="w-4 h-4 inline-block mr-2" />
            Bibliothèque Réglementaire
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("status")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "status"
                ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Target className="w-4 h-4 inline-block mr-2" />
            Statut des Normes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("compliance")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "compliance"
                ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <CheckCircle className="w-4 h-4 inline-block mr-2" />
            Suivi Conformité
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audits")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "audits"
                ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4 inline-block mr-2" />
            Audits
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === "library" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une réglementation..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>

            {/* Regulations Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {regulations.map((regulation) => (
                <Card
                  key={regulation.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {regulation.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {regulation.category}
                        </p>
                      </div>
                      <Badge className={getStatusColor(regulation.status)}>
                        {regulation.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progression conformité</span>
                          <span className="font-medium">
                            {regulation.progress}%
                          </span>
                        </div>
                        <Progress value={regulation.progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Dernière mise à jour</p>
                          <p className="font-medium">{regulation.lastUpdate}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Prochain audit</p>
                          <p className="font-medium">{regulation.nextAudit}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Voir détails
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
                        >
                          Planifier audit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "status" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="border-l-4 border-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Normes Validées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-green-600 mb-2">12</p>
                  <p className="text-sm text-gray-600">
                    Conformité totale atteinte
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>ISO 45001:2018</span>
                      <Badge className="bg-green-100 text-green-800">94%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Code du Travail</span>
                      <Badge className="bg-green-100 text-green-800">88%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <XCircle className="w-5 h-5" />
                    Normes Manquantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-red-600 mb-2">5</p>
                  <p className="text-sm text-gray-600">Actions requises</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>OSHA Standards</span>
                      <Badge className="bg-red-100 text-red-800">65%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Directive Machines</span>
                      <Badge className="bg-orange-100 text-orange-800">
                        78%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Target className="w-5 h-5" />
                    Objectifs de Conformité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-blue-600 mb-2">8</p>
                  <p className="text-sm text-gray-600">
                    En cours de réalisation
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progression globale</span>
                      <span className="font-medium">82%</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Integration CAPA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Intégration CAPA - Actions Correctives</span>
                  <Button
                    size="sm"
                    className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer action CAPA
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium">
                          OSHA Standards - Non-conformité détectée
                        </p>
                        <p className="text-sm text-gray-600">
                          Action corrective requise pour atteindre 85%
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Planifier CAPA
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">
                          Directive Machines - Amélioration continue
                        </p>
                        <p className="text-sm text-gray-600">
                          3 actions CAPA en cours
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Voir actions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Conformité Globale
                      </p>
                      <p className="text-3xl font-bold text-[var(--sahtee-blue-primary)]">
                        87%
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Audits en cours
                      </p>
                      <p className="text-3xl font-bold text-[var(--sahtee-blue-secondary)]">
                        3
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Actions correctives
                      </p>
                      <p className="text-3xl font-bold text-orange-500">12</p>
                    </div>
                    <FileText className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Vue d'ensemble de la conformité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regulations.map((regulation) => (
                    <div
                      key={regulation.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-[var(--sahtee-blue-primary)]"></div>
                        <div>
                          <h4 className="font-medium">{regulation.name}</h4>
                          <p className="text-sm text-gray-600">
                            {regulation.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">
                            {regulation.progress}%
                          </div>
                          <div className="text-sm text-gray-500">
                            Conformité
                          </div>
                        </div>
                        <Badge className={getStatusColor(regulation.status)}>
                          {regulation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "audits" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audits récents et programmés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {audits.map((audit) => (
                    <div
                      key={audit.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            audit.status === "Terminé"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                        <div>
                          <h4 className="font-medium">{audit.title}</h4>
                          <p className="text-sm text-gray-600">
                            {audit.site} • {audit.auditor}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{audit.date}</div>
                          <div className="text-sm text-gray-500">
                            {audit.status === "Terminé"
                              ? `Score: ${audit.score}%`
                              : audit.status}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          {audit.status === "Terminé"
                            ? "Voir rapport"
                            : "Modifier"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setShowImportDialog(false)}
          />
          <div className="relative z-50 w-full max-w-md bg-white rounded-xl shadow-2xl p-6 m-4 border border-gray-200">
            <div className="flex flex-col gap-2 mb-4">
              <h2 className="text-lg font-semibold">
                Importer données juridiques
              </h2>
              <p className="text-sm text-gray-600">
                Importez vos données de conformité juridique depuis un fichier
                Excel, CSV ou PDF.
              </p>
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file-upload">Fichier à importer</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf"
                  className="cursor-pointer"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="iso">ISO</option>
                  <option value="osha">OSHA</option>
                  <option value="cor">COR</option>
                  <option value="iap">IAP</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImportDialog(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
                onClick={() => {
                  alert("Importation en cours...");
                  setShowImportDialog(false);
                }}
              >
                Importer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Audit Dialog */}
      {showNewAuditDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setShowNewAuditDialog(false)}
          />
          <div className="relative z-50 w-full max-w-md bg-white rounded-xl shadow-2xl p-6 m-4 border border-gray-200">
            <div className="flex flex-col gap-2 mb-4">
              <h2 className="text-lg font-semibold">Créer un nouvel audit</h2>
              <p className="text-sm text-gray-600">
                Planifiez un nouvel audit de conformité pour votre organisation.
              </p>
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="audit-title">Titre de l'audit</Label>
                <Input
                  id="audit-title"
                  placeholder="Ex: Audit ISO 45001 - Site Principal"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="audit-site">Site</Label>
                <Input
                  id="audit-site"
                  placeholder="Ex: Site Principal, Atelier Production"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="audit-auditor">Auditeur</Label>
                <Input
                  id="audit-auditor"
                  placeholder="Ex: Bureau Veritas, TÜV SÜD"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="audit-date">Date prévue</Label>
                <Input id="audit-date" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="audit-norm">Norme concernée</Label>
                <select
                  id="audit-norm"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sélectionner une norme</option>
                  <option value="iso45001">ISO 45001:2018</option>
                  <option value="machines">
                    Directive Machines 2006/42/CE
                  </option>
                  <option value="osha">OSHA Standards</option>
                  <option value="travail">Code du Travail - Livre IV</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewAuditDialog(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
                onClick={() => {
                  alert("Audit créé avec succès!");
                  setShowNewAuditDialog(false);
                }}
              >
                Créer l'audit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
