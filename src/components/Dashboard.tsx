import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bell,
  Bot,
  Calculator,
  CheckCircle,
  GraduationCap,
  Heart,
  Home,
  LineChart,
  Menu,
  PieChart,
  Search,
  Settings,
  Shield,
  Smartphone,
  Store,
  Target,
  TrendingUp,
  Upload,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { ActionPlans } from "./modules/ActionPlans";
import { AdvancedAnalytics } from "./modules/AdvancedAnalytics";
import { AuditRoom } from "./modules/AuditRoom";
import { Calculator as CalculatorModule } from "./modules/Calculator";
import { ChemicalChatbot } from "./modules/ChemicalChatbot";
import { Marketplace } from "./modules/Marketplace";
import { MobileApp } from "./modules/MobileApp";
import { OccupationalHealth } from "./modules/OccupationalHealth";
import { Training } from "./modules/Training";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// Import du logo depuis Figma
import sahteeLogoBlue from "figma:asset/2c9287bd076e1cc144dd8b599ad076a48185b78b.png";

export function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [chartType, setChartType] = useState<"bar" | "pie" | "line">("bar");

  const handleGoHome = () => {
    window.location.reload(); // Retour à la page d'accueil
  };

  const modules = [
    {
      id: "dashboard",
      icon: Home,
      title: "360° Board",
      color: "text-[var(--sahtee-blue-primary)]",
    },
    {
      id: "audit",
      icon: Shield,
      title: "Conformity Room",
      color: "text-[var(--sahtee-blue-secondary)]",
    },
    {
      id: "actions",
      icon: Target,
      title: "CAPA Room",
      color: "text-[var(--sahtee-blue-light)]",
    },
    {
      id: "formation",
      icon: GraduationCap,
      title: "Formation",
      color: "text-[var(--sahtee-blue-secondary)]",
    },
    {
      id: "mobile",
      icon: Smartphone,
      title: "Mobile App",
      color: "text-[var(--sahtee-blue-primary)]",
    },
    {
      id: "maladies",
      icon: Heart,
      title: "Health Barometer",
      color: "text-[var(--sahtee-blue-light)]",
    },
    {
      id: "chatbot",
      icon: Bot,
      title: "SafetyBot",
      color: "text-[var(--sahtee-blue-secondary)]",
    },
    {
      id: "marketplace",
      icon: Store,
      title: "Marketplace",
      color: "text-[var(--sahtee-blue-primary)]",
    },
    {
      id: "calcul",
      icon: Calculator,
      title: "Impact Calculator",
      color: "text-[var(--sahtee-blue-light)]",
    },
    {
      id: "analyse",
      icon: TrendingUp,
      title: "Analyses Avancées",
      color: "text-[var(--sahtee-blue-secondary)]",
    },
  ];

  const riskMetrics = [
    { type: "Physiques", value: 23, trend: "+2", color: "bg-red-500" },
    { type: "Chimiques", value: 15, trend: "-1", color: "bg-orange-500" },
    { type: "Biologiques", value: 8, trend: "0", color: "bg-yellow-500" },
    { type: "Psychosociaux", value: 12, trend: "+3", color: "bg-purple-500" },
    { type: "Organisationnels", value: 18, trend: "-2", color: "bg-blue-500" },
    { type: "Machines", value: 31, trend: "+1", color: "bg-green-500" },
  ];

  const kpis = [
    {
      label: "Taux de fréquence",
      value: "2.3",
      unit: "/1000h",
      trend: "down",
      color: "text-green-600",
    },
    {
      label: "Taux de gravité",
      value: "0.45",
      unit: "/1000h",
      trend: "down",
      color: "text-green-600",
    },
    {
      label: "Absentéisme",
      value: "4.2%",
      unit: "",
      trend: "up",
      color: "text-red-600",
    },
    {
      label: "Heures travaillées",
      value: "12,450",
      unit: "h",
      trend: "up",
      color: "text-blue-600",
    },
    {
      label: "Conformité",
      value: "87%",
      unit: "",
      trend: "up",
      color: "text-blue-600",
    },
  ];

  // Fonction pour rendre le contenu du module actif
  const renderModuleContent = () => {
    switch (activeModule) {
      case "audit":
        return <AuditRoom />;
      case "actions":
        return <ActionPlans />;
      case "formation":
        return <Training />;
      case "mobile":
        return <MobileApp />;
      case "maladies":
        return <OccupationalHealth />;
      case "chatbot":
        return <ChemicalChatbot />;
      case "marketplace":
        return <Marketplace />;
      case "calcul":
        return <CalculatorModule />;
      case "analyse":
        return <AdvancedAnalytics />;
      default:
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = () => (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900">360° Board</h1>
            <p className="text-gray-600">
              Vue panoramique et centralisée de la santé et sécurité au travail
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-primary)] hover:text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importer documents
            </Button>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64"
              />
            </div>

            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-xs">
                3
              </Badge>
            </Button>

            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="sm">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="p-6">
        {/* KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
                    <p className="text-2xl">
                      {kpi.value}
                      <span className="text-sm text-gray-500 ml-1">
                        {kpi.unit}
                      </span>
                    </p>
                  </div>
                  <div className={`${kpi.color}`}>
                    {kpi.trend === "up" ? (
                      <TrendingUp className="w-6 h-6" />
                    ) : (
                      <Activity className="w-6 h-6 rotate-180" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Risk Mapping */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[var(--sahtee-blue-primary)]" />
                  Cartographie des Risques
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Type de graphique:
                  </span>
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setChartType("bar")}
                      className={`p-1.5 rounded ${
                        chartType === "bar"
                          ? "bg-white shadow-sm"
                          : "hover:bg-gray-200"
                      }`}
                      title="Graphique en barres"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartType("pie")}
                      className={`p-1.5 rounded ${
                        chartType === "pie"
                          ? "bg-white shadow-sm"
                          : "hover:bg-gray-200"
                      }`}
                      title="Graphique circulaire"
                    >
                      <PieChart className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartType("line")}
                      className={`p-1.5 rounded ${
                        chartType === "line"
                          ? "bg-white shadow-sm"
                          : "hover:bg-gray-200"
                      }`}
                      title="Graphique linéaire"
                    >
                      <LineChart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskMetrics.map((metric, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${metric.color}`}
                      ></div>
                      <span className="text-sm">{metric.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{metric.value}</span>
                      <Badge
                        variant={
                          metric.trend.startsWith("+")
                            ? "destructive"
                            : metric.trend.startsWith("-")
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {metric.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Alertes & Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      Incident critique - Site A
                    </p>
                    <p className="text-xs text-red-700">
                      Action corrective requise immédiatement
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <Activity className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      Formation expire dans 7 jours
                    </p>
                    <p className="text-xs text-yellow-700">
                      15 collaborateurs concernés
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Audit ISO 45001 complété
                    </p>
                    <p className="text-xs text-green-700">Conformité: 94%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--sahtee-blue-secondary)]" />
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-[var(--sahtee-neutral)] rounded-full p-2">
                    <GraduationCap className="w-4 h-4 text-[var(--sahtee-blue-primary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Formation "Manipulation Chimique" terminée
                    </p>
                    <p className="text-xs text-gray-600">
                      par Marie Dubois - Site Production
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">Il y a 2h</span>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 rounded-full p-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Incident déclaré via l'app mobile
                    </p>
                    <p className="text-xs text-gray-600">
                      Glissade - Entrepôt Zone C
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">Il y a 4h</span>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Plan d'action correctif validé
                    </p>
                    <p className="text-xs text-gray-600">
                      Amélioration éclairage - Atelier B
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">Hier</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                className="text-sm border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-primary)] hover:text-white"
              >
                Exporter rapport complet
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } bg-white shadow-lg transition-all duration-300 fixed h-full z-30 border-r border-[var(--sahtee-neutral)]`}
      >
        <div className="p-4 border-b border-[var(--sahtee-neutral)]">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div className="flex items-center gap-2">
                <img src={sahteeLogoBlue} alt="SAHTEE" className="h-8" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoHome}
                  className="text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-neutral)]"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="ml-auto text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-neutral)]"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <nav className="p-2">
          {modules.map((module) => (
            <button
              key={module.id}
              type="button"
              onClick={() => setActiveModule(module.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition-colors ${
                activeModule === module.id
                  ? "bg-[var(--sahtee-neutral)] text-[var(--sahtee-blue-primary)] border-r-4 border-[var(--sahtee-blue-primary)]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <module.icon className={`w-5 h-5 ${module.color}`} />
              {isSidebarOpen && <span className="text-sm">{module.title}</span>}
            </button>
          ))}
        </nav>

        {isSidebarOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-primary)] hover:text-white"
            >
              Demander support SAHTEE
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        } transition-all duration-300`}
      >
        {renderModuleContent()}
      </div>
    </div>
  );
}
