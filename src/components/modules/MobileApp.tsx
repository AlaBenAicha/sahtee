import { useState } from "react";
import { Smartphone, QrCode, Bell, Camera, MapPin, AlertTriangle, CheckCircle, Users, Download } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export function MobileApp() {
  const [activeTab, setActiveTab] = useState('incidents');

  const incidents = [
    {
      id: 1,
      title: "Glissade dans l'entrepôt",
      location: "Zone C - Entrepôt",
      reporter: "Jean Dupont",
      reportedAt: "2024-01-20 14:30",
      severity: "Moyen",
      status: "En traitement",
      description: "Sol glissant près de la zone de livraison",
      photos: 2,
      qrCodeUsed: true
    },
    {
      id: 2,
      title: "Fuite produit chimique",
      location: "Laboratoire A",
      reporter: "Marie Martin",
      reportedAt: "2024-01-20 09:15",
      severity: "Élevé",
      status: "Résolu",
      description: "Fuite mineure d'acide chlorhydrique",
      photos: 3,
      qrCodeUsed: false
    },
    {
      id: 3,
      title: "Équipement défaillant",
      location: "Atelier B - Poste 3",
      reporter: "Paul Dubois",
      reportedAt: "2024-01-19 16:45",
      severity: "Faible",
      status: "En attente",
      description: "Protection manquante sur machine",
      photos: 1,
      qrCodeUsed: true
    }
  ];

  const notifications = [
    {
      id: 1,
      title: "Rappel formation obligatoire",
      message: "Votre formation 'Manipulation Chimique' expire dans 7 jours",
      type: "warning",
      sentAt: "2024-01-20 08:00",
      sent: 156,
      opened: 142
    },
    {
      id: 2,
      title: "Nouvel incident déclaré",
      message: "Un incident a été signalé en Zone C - Entrepôt",
      type: "alert",
      sentAt: "2024-01-20 14:35",
      sent: 23,
      opened: 18
    },
    {
      id: 3,
      title: "Quiz sécurité mensuel",
      message: "Le quiz de janvier est maintenant disponible",
      type: "info",
      sentAt: "2024-01-15 09:00",
      sent: 245,
      opened: 198
    }
  ];

  const quizzes = [
    {
      id: 1,
      title: "Sécurité en laboratoire",
      questions: 10,
      duration: "5 min",
      completed: 23,
      total: 45,
      averageScore: 87,
      active: true
    },
    {
      id: 2,
      title: "Gestes et postures",
      questions: 8,
      duration: "3 min",
      completed: 45,
      total: 45,
      averageScore: 92,
      active: false
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Élevé': return 'bg-red-100 text-red-800';
      case 'Moyen': return 'bg-orange-100 text-orange-800';
      case 'Faible': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Résolu': return 'bg-green-100 text-green-800';
      case 'En traitement': return 'bg-blue-100 text-blue-800';
      case 'En attente': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'alert': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900">Application Mobile & QR Code</h1>
            <p className="text-gray-600">Déclaration d'incidents, notifications et quiz interactifs</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Rapport mobile
            </Button>
            <Button className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
              <QrCode className="w-4 h-4 mr-2" />
              Générer QR Code
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
                  <p className="text-sm text-gray-600">Incidents déclarés</p>
                  <p className="text-2xl font-bold text-[var(--sahtee-blue-primary)]">{incidents.length}</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-[var(--sahtee-blue-primary)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold text-green-500">156</p>
                </div>
                <Users className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">QR Codes scannés</p>
                  <p className="text-2xl font-bold text-[var(--sahtee-blue-secondary)]">89</p>
                </div>
                <QrCode className="w-6 h-6 text-[var(--sahtee-blue-secondary)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taux d'ouverture notif.</p>
                  <p className="text-2xl font-bold text-purple-500">84%</p>
                </div>
                <Bell className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === 'incidents' 
                ? 'border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline-block mr-2" />
            Incidents déclarés
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === 'notifications' 
                ? 'border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bell className="w-4 h-4 inline-block mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === 'quizzes' 
                ? 'border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckCircle className="w-4 h-4 inline-block mr-2" />
            Quiz
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'incidents' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Incidents déclarés via l'application mobile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{incident.title}</h4>
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status}
                            </Badge>
                            {incident.qrCodeUsed && (
                              <Badge variant="outline" className="border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]">
                                <QrCode className="w-3 h-3 mr-1" />
                                QR Code
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{incident.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>Signalé par {incident.reporter}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Camera className="w-3 h-3" />
                              <span>{incident.photos} photo(s)</span>
                            </div>
                            <span>{incident.reportedAt}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* QR Code Management */}
            <Card>
              <CardHeader>
                <CardTitle>Gestion des QR Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">QR Codes actifs par zone</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Entrepôt - Zone A</span>
                        <span className="font-medium">12 QR Codes</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Laboratoire</span>
                        <span className="font-medium">8 QR Codes</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Atelier Production</span>
                        <span className="font-medium">15 QR Codes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Utilisation cette semaine</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>QR Codes scannés</span>
                        <span className="font-medium">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Incidents déclarés via QR</span>
                        <span className="font-medium">2</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quiz commencés via QR</span>
                        <span className="font-medium">34</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications push envoyées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`border rounded-lg p-4 ${getNotificationColor(notification.type)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Envoyé le {notification.sentAt}</span>
                            <span>{notification.sent} destinataires</span>
                            <span>{notification.opened} ouvertures ({Math.round((notification.opened / notification.sent) * 100)}%)</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Statistiques
                          </Button>
                          <Button size="sm" variant="outline">
                            Renvoyer
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Push Notification Creator */}
            <Card>
              <CardHeader>
                <CardTitle>Envoyer une nouvelle notification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Titre</label>
                      <input 
                        type="text" 
                        placeholder="Titre de la notification"
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Type</label>
                      <select className="w-full p-2 border rounded-lg text-sm">
                        <option value="info">Information</option>
                        <option value="warning">Avertissement</option>
                        <option value="alert">Alerte</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea 
                      placeholder="Contenu de la notification"
                      className="w-full p-2 border rounded-lg text-sm h-24"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Programmer</Button>
                    <Button className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
                      Envoyer maintenant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quiz de sécurité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{quiz.title}</h4>
                            <Badge className={quiz.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {quiz.active ? 'Actif' : 'Terminé'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{quiz.questions} questions</span>
                            <span>Durée: {quiz.duration}</span>
                            <span>Complété: {quiz.completed}/{quiz.total}</span>
                            <span>Score moyen: {quiz.averageScore}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Voir résultats
                          </Button>
                          {quiz.active && (
                            <Button size="sm" className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
                              Modifier
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quiz Creator */}
            <Card>
              <CardHeader>
                <CardTitle>Créer un nouveau quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Titre du quiz</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Sécurité incendie"
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Catégorie</label>
                      <select className="w-full p-2 border rounded-lg text-sm">
                        <option value="security">Sécurité</option>
                        <option value="ergonomics">Ergonomie</option>
                        <option value="chemical">Chimique</option>
                        <option value="general">Général</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Enregistrer brouillon</Button>
                    <Button className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
                      Créer & Publier
                    </Button>
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