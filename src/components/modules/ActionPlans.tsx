import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Target,
  User,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function ActionPlans() {
  const [view, setView] = useState("kanban");

  const actionPlans = [
    {
      id: 1,
      title: "Amélioration éclairage Atelier B",
      description:
        "Installation de nouveaux éclairages LED pour réduire la fatigue visuelle",
      priority: "Haute",
      status: "todo",
      assignee: "Marc Durand",
      dueDate: "2024-02-15",
      progress: 0,
      category: "Préventif",
      risk: "Ergonomie",
    },
    {
      id: 2,
      title: "Formation port EPI Zone C",
      description: "Session de sensibilisation suite à l'incident du 10/01",
      priority: "Critique",
      status: "inprogress",
      assignee: "Sophie Martin",
      dueDate: "2024-01-30",
      progress: 60,
      category: "Correctif",
      risk: "Accident",
    },
    {
      id: 3,
      title: "Réparation barrière sécurité",
      description: "Remise en état de la barrière endommagée - Zone stockage",
      priority: "Critique",
      status: "inprogress",
      assignee: "Jean Petit",
      dueDate: "2024-01-25",
      progress: 80,
      category: "Correctif",
      risk: "Sécurité",
    },
    {
      id: 4,
      title: "Mise à jour procédure LOTO",
      description: "Révision des procédures de consignation/déconsignation",
      priority: "Moyenne",
      status: "done",
      assignee: "Marie Dubois",
      dueDate: "2024-01-10",
      progress: 100,
      category: "Préventif",
      risk: "Énergie",
    },
  ];

  const statusColumns = [
    {
      id: "todo",
      title: "À faire",
      color: "bg-gray-100",
      count: actionPlans.filter((p) => p.status === "todo").length,
    },
    {
      id: "inprogress",
      title: "En cours",
      color: "bg-secondary",
      count: actionPlans.filter((p) => p.status === "inprogress").length,
    },
    {
      id: "done",
      title: "Terminé",
      color: "bg-green-100",
      count: actionPlans.filter((p) => p.status === "done").length,
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critique":
        return "bg-red-100 text-red-800";
      case "Haute":
        return "bg-orange-100 text-orange-800";
      case "Moyenne":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Correctif":
        return "bg-red-50 text-red-700 border-red-200";
      case "Préventif":
        return "bg-secondary text-primary border-secondary";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const ActionCard = ({ action }: { action: any }) => (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm">{action.title}</h4>
            <Badge className={getPriorityColor(action.priority)} size="sm">
              {action.priority}
            </Badge>
          </div>

          <p className="text-xs text-gray-600 line-clamp-2">
            {action.description}
          </p>

          <div className="flex items-center justify-between text-xs">
            <Badge
              variant="outline"
              className={getCategoryColor(action.category)}
            >
              {action.category}
            </Badge>
            <span className="text-gray-500">{action.risk}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{action.assignee}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{action.dueDate}</span>
            </div>
          </div>

          {action.status === "inprogress" && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progression</span>
                <span>{action.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-[var(--sahtee-blue-primary)] h-1.5 rounded-full"
                  style={{ width: `${action.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900">CAPA Room</h1>
            <p className="text-gray-600">
              Gestion des actions correctives et préventives (Corrective and
              Preventive Actions)
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView("kanban")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  view === "kanban"
                    ? "bg-white text-[var(--sahtee-blue-primary)] shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Vue Kanban
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  view === "list"
                    ? "bg-white text-[var(--sahtee-blue-primary)] shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Vue Liste
              </button>
            </div>

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>

            <Button className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau plan
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="p-6 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total actions</p>
                  <p className="text-2xl font-bold text-[var(--sahtee-blue-primary)]">
                    {actionPlans.length}
                  </p>
                </div>
                <Target className="w-6 h-6 text-[var(--sahtee-blue-primary)]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En retard</p>
                  <p className="text-2xl font-bold text-red-500">2</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-primary">2</p>
                </div>
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terminées</p>
                  <p className="text-2xl font-bold text-green-500">1</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6 pt-0">
        {view === "kanban" ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {statusColumns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80">
                <div className={`${column.color} rounded-lg p-3 mb-4`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{column.title}</h3>
                    <Badge variant="secondary" className="bg-white">
                      {column.count}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {actionPlans
                    .filter((action) => action.status === column.id)
                    .map((action) => (
                      <ActionCard key={action.id} action={action} />
                    ))}
                </div>

                {column.id !== "done" && (
                  <Button
                    variant="ghost"
                    className="w-full mt-3 border-2 border-dashed border-gray-300 hover:border-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-neutral)]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une action
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Liste des actions CAPA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actionPlans.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          action.status === "done"
                            ? "bg-green-500"
                            : action.status === "inprogress"
                            ? "bg-primary"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{action.title}</h4>
                          <Badge
                            className={getPriorityColor(action.priority)}
                            size="sm"
                          >
                            {action.priority}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={getCategoryColor(action.category)}
                          >
                            {action.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {action.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Assigné à: {action.assignee}</span>
                          <span>Échéance: {action.dueDate}</span>
                          <span>Risque: {action.risk}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {action.status === "inprogress" && (
                        <div className="text-right text-xs">
                          <div className="font-medium">{action.progress}%</div>
                        </div>
                      )}
                      <Button size="sm" variant="outline">
                        Modifier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
