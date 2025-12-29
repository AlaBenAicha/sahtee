import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bell,
  Bot,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  Heart,
  Home,
  Info,
  LineChart,
  Menu,
  MessageCircle,
  PieChart,
  Search,
  Send,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Upload,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { AuditRoom } from "./modules/AuditRoom";
import { CAPARoom } from "./modules/CAPARoom";
// ========================================
// DISABLED FOR MVP - Re-enable for v2.0
// ========================================
// import { AdvancedAnalytics } from "./modules/AdvancedAnalytics";
// import { Calculator as CalculatorModule } from "./modules/Calculator";
// import { Marketplace } from "./modules/Marketplace";
// import { MobileApp } from "./modules/MobileApp";
// ========================================
import { OccupationalHealth } from "./modules/OccupationalHealth";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// Import du logo
import sahteeLogoBlue from "../assets/2c9287bd076e1cc144dd8b599ad076a48185b78b.png";

export function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [chartType, setChartType] = useState<"bar" | "pie" | "line">("bar");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: "bot",
      message:
        "Bonjour ! Je suis l'assistant SAHTEE pour la sécurité chimique. Comment puis-je vous aider aujourd'hui ?",
      timestamp: "2024-01-20 09:00",
    },
  ]);

  const handleGoHome = () => {
    window.location.reload(); // Retour à la page d'accueil
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatHistory.length + 1,
        type: "user" as const,
        message: chatMessage,
        timestamp: new Date().toLocaleString("fr-FR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatHistory([...chatHistory, newMessage]);
      setChatMessage("");

      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: chatHistory.length + 2,
          type: "bot" as const,
          message:
            "Je traite votre demande concernant la sécurité chimique. Voici les informations pertinentes...",
          timestamp: new Date().toLocaleString("fr-FR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setChatHistory((prev) => [...prev, botResponse]);
      }, 1000);
    }
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
    // ========================================
    // DISABLED FOR MVP - Re-enable for v2.0
    // ========================================
    // {
    //   id: "mobile",
    //   icon: Smartphone,
    //   title: "Mobile App",
    //   color: "text-[var(--sahtee-blue-primary)]",
    // },
    // ========================================
    {
      id: "maladies",
      icon: Heart,
      title: "Health Meter",
      color: "text-[var(--sahtee-blue-light)]",
    },
    // ========================================
    // DISABLED FOR MVP - Re-enable for v2.0
    // ========================================
    // {
    //   id: "marketplace",
    //   icon: Store,
    //   title: "Marketplace",
    //   color: "text-[var(--sahtee-blue-primary)]",
    // },
    // ========================================
    // DISABLED FOR MVP - Re-enable for v2.0
    // ========================================
    // {
    //   id: "calcul",
    //   icon: Calculator,
    //   title: "Impact Calculator",
    //   color: "text-[var(--sahtee-blue-light)]",
    // },
    // {
    //   id: "analyse",
    //   icon: TrendingUp,
    //   title: "Analyses Avancées",
    //   color: "text-[var(--sahtee-blue-secondary)]",
    // },
    // ========================================
  ];

  const riskMetrics = [
    { type: "Physiques", value: 23, trend: "+2", color: "bg-red-500" },
    { type: "Chimiques", value: 15, trend: "-1", color: "bg-orange-500" },
    { type: "Biologiques", value: 8, trend: "0", color: "bg-yellow-500" },
    { type: "Psychosociaux", value: 12, trend: "+3", color: "bg-purple-500" },
    { type: "Organisationnels", value: 18, trend: "-2", color: "bg-primary" },
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
      color: "text-primary",
    },
    {
      label: "Conformité",
      value: "87%",
      unit: "",
      trend: "up",
      color: "text-primary",
    },
  ];

  // Fonction pour rendre le contenu du module actif
  const renderModuleContent = () => {
    switch (activeModule) {
      case "audit":
        return <AuditRoom />;
      case "actions":
        return <CAPARoom />;
      // ========================================
      // DISABLED FOR MVP - Re-enable for v2.0
      // ========================================
      // case "mobile":
      //   return <MobileApp />;
      // ========================================
      case "maladies":
        return <OccupationalHealth />;
      // ========================================
      // DISABLED FOR MVP - Re-enable for v2.0
      // ========================================
      // case "marketplace":
      //   return <Marketplace />;
      // ========================================
      // DISABLED FOR MVP - Re-enable for v2.0
      // ========================================
      // case "calcul":
      //   return <CalculatorModule />;
      // case "analyse":
      //   return <AdvancedAnalytics />;
      // ========================================
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

        {/* SafetyBot Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* SafetyBot Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[500px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[var(--sahtee-blue-primary)]" />
                  SafetyBot - Assistant Sécurité Chimique
                  <div className="ml-auto flex items-center gap-2 text-sm font-normal">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">En ligne</span>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 p-0 overflow-hidden">
                <div className="h-full flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.type === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === "user"
                              ? "bg-[var(--sahtee-blue-primary)] text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">
                            {message.message}
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              message.type === "user"
                                ? "text-secondary"
                                : "text-gray-500"
                            }`}
                          >
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        placeholder="Posez votre question sur la sécurité chimique..."
                        className="flex-1 p-2 border rounded-lg text-sm"
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SafetyBot Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Statistiques SafetyBot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[var(--sahtee-blue-primary)]" />
                    <span className="text-sm text-gray-600">
                      Questions traitées
                    </span>
                  </div>
                  <span className="font-bold text-[var(--sahtee-blue-primary)]">
                    1,247
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">
                      Temps de réponse
                    </span>
                  </div>
                  <span className="font-bold text-green-500">2.3s</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[var(--sahtee-blue-secondary)]" />
                    <span className="text-sm text-gray-600">Satisfaction</span>
                  </div>
                  <span className="font-bold text-[var(--sahtee-blue-secondary)]">
                    94%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">
                      Substances référencées
                    </span>
                  </div>
                  <span className="font-bold text-purple-500">2,856</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 flex flex-col gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">Fiche de sécurité</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 flex flex-col gap-1"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs">Matrice compatibilité</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 flex flex-col gap-1"
                  >
                    <Info className="w-4 h-4" />
                    <span className="text-xs">Procédure déversement</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 flex flex-col gap-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">Contact urgence</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
              title={
                module.id === "actions"
                  ? "Includes Actions, Training & Equipment"
                  : module.title
              }
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
