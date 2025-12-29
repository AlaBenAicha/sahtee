import {
  AlertTriangle,
  Bot,
  Clock,
  FileText,
  Info,
  MessageCircle,
  Search,
  Send,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function ChemicalChatbot() {
  const [activeTab, setActiveTab] = useState("chat");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: "bot",
      message:
        "Bonjour ! Je suis l'assistant SAHTEE pour la sécurité chimique. Comment puis-je vous aider aujourd'hui ?",
      timestamp: "2024-01-20 09:00",
    },
    {
      id: 2,
      type: "user",
      message:
        "Quelles sont les précautions pour manipuler l'acide chlorhydrique ?",
      timestamp: "2024-01-20 09:01",
    },
    {
      id: 3,
      type: "bot",
      message:
        "Pour l'acide chlorhydrique (HCl), voici les précautions essentielles :\n\n🧤 **EPI obligatoires** :\n- Gants en nitrile ou néoprène\n- Lunettes de sécurité étanches\n- Blouse de laboratoire\n- Sorbonne ventilée\n\n⚠️ **Dangers** :\n- Corrosif pour la peau et les yeux\n- Vapeurs irritantes pour les voies respiratoires\n- Réaction violente avec les bases\n\n📋 **Stockage** :\n- Local ventilé, à température ambiante\n- Séparé des bases et métaux\n- Contenant étanche et étiqueté\n\nBesoin de plus d'informations sur un point particulier ?",
      timestamp: "2024-01-20 09:01",
    },
  ]);

  const faqItems = [
    {
      id: 1,
      question: "Comment stocker les produits chimiques incompatibles ?",
      answer:
        "Les produits incompatibles doivent être stockés dans des zones séparées avec des systèmes de ventilation indépendants. Utilisez la matrice de compatibilité pour vérifier les incompatibilités.",
      category: "Stockage",
      views: 245,
    },
    {
      id: 2,
      question: "Que faire en cas de déversement d'acide ?",
      answer:
        "1. Évacuer la zone\n2. Porter les EPI appropriés\n3. Neutraliser avec un absorbant spécialisé\n4. Ventiler la zone\n5. Éliminer selon la procédure des déchets dangereux",
      category: "Urgence",
      views: 189,
    },
    {
      id: 3,
      question: "Quels EPI pour manipuler des solvants ?",
      answer:
        "Pour les solvants organiques : gants en nitrile, lunettes de sécurité, blouse, et travail sous sorbonne. Vérifier la fiche de données de sécurité pour les spécificités.",
      category: "EPI",
      views: 156,
    },
    {
      id: 4,
      question: "Comment interpréter les pictogrammes de danger ?",
      answer:
        "Chaque pictogramme indique un type de danger spécifique. Le rouge indique un danger immédiat, l'orange un danger pour la santé, etc. Consultez la réglementation CLP.",
      category: "Réglementation",
      views: 198,
    },
  ];

  const quickActions = [
    { label: "Fiche de sécurité", icon: FileText, action: "fds" },
    { label: "Matrice compatibilité", icon: AlertTriangle, action: "matrix" },
    { label: "Procédure déversement", icon: Info, action: "spill" },
    { label: "Contact urgence", icon: MessageCircle, action: "emergency" },
  ];

  const recentQueries = [
    { query: "Stockage acétone", time: "Il y a 2h", user: "M. Dubois" },
    { query: "EPI manipulation bases", time: "Il y a 4h", user: "Mme Martin" },
    {
      query: "Procédure lavage oculaire",
      time: "Il y a 6h",
      user: "Dr. Petit",
    },
    { query: "Ventilation laboratoire", time: "Hier", user: "J. Durand" },
  ];

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Stockage":
        return "bg-secondary text-primary";
      case "Urgence":
        return "bg-red-100 text-red-800";
      case "EPI":
        return "bg-green-100 text-green-800";
      case "Réglementation":
        return "bg-purple-100 text-purple-800";
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
            <h1 className="text-2xl text-gray-900">SafetyBot</h1>
            <p className="text-gray-600">
              Assistant IA instantané pour la sécurité chimique et réglementaire
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Assistant en ligne</span>
            </div>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Base de connaissances
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
                  <p className="text-sm text-gray-600">Questions traitées</p>
                  <p className="text-2xl font-bold text-[var(--sahtee-blue-primary)]">
                    1,247
                  </p>
                </div>
                <MessageCircle className="w-6 h-6 text-[var(--sahtee-blue-primary)]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Temps de réponse moyen
                  </p>
                  <p className="text-2xl font-bold text-green-500">2.3s</p>
                </div>
                <Clock className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Satisfaction utilisateurs
                  </p>
                  <p className="text-2xl font-bold text-[var(--sahtee-blue-secondary)]">
                    94%
                  </p>
                </div>
                <Bot className="w-6 h-6 text-[var(--sahtee-blue-secondary)]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Substances référencées
                  </p>
                  <p className="text-2xl font-bold text-purple-500">2,856</p>
                </div>
                <FileText className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("chat")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "chat"
                ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Bot className="w-4 h-4 inline-block mr-2" />
            Chat Assistant
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "faq"
                ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Info className="w-4 h-4 inline-block mr-2" />
            FAQ Chimique
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "analytics"
                ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageCircle className="w-4 h-4 inline-block mr-2" />
            Analytiques
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === "chat" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-[var(--sahtee-blue-primary)]" />
                    Assistant Sécurité Chimique
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden">
                  {/* Chat Messages */}
                  <div className="h-full flex flex-col">
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-auto p-3 flex flex-col gap-1"
                      >
                        <action.icon className="w-4 h-4" />
                        <span className="text-xs">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Queries */}
              <Card>
                <CardHeader>
                  <CardTitle>Requêtes récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentQueries.map((query, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-[var(--sahtee-blue-primary)]">
                          "{query.query}"
                        </div>
                        <div className="text-xs text-gray-500">
                          {query.user} • {query.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "faq" && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans la FAQ..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full"
                />
              </div>
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {faqItems.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-lg flex-1">
                        {item.question}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {item.views} vues
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">
                      {item.answer}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques d'utilisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">
                      Questions par catégorie
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">EPI et protection</span>
                        <span className="font-medium">35%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Stockage</span>
                        <span className="font-medium">28%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Procédures d'urgence</span>
                        <span className="font-medium">20%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Réglementation</span>
                        <span className="font-medium">17%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Satisfaction par mois</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Janvier 2024</span>
                        <span className="font-medium text-green-600">94%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Décembre 2023</span>
                        <span className="font-medium text-green-600">91%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Novembre 2023</span>
                        <span className="font-medium text-green-600">88%</span>
                      </div>
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
