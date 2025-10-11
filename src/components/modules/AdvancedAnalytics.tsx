import { useState } from "react";
import { TrendingUp, Target, Calculator, Users, AlertTriangle, CheckCircle, BarChart3, Download } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

export function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState('rula-reba');
  const [selectedTool, setSelectedTool] = useState('rula');

  const rulaAssessment = {
    employee: "Marie Dubois - Poste Assemblage",
    date: "2024-01-20",
    scores: {
      arm: 3,
      neck: 2,
      trunk: 4,
      legs: 2,
      muscle: 1,
      force: 2,
      finalScore: 5
    },
    interpretation: {
      level: "Moyen",
      action: "Investigation et changements requis",
      priority: "Moyenne"
    },
    recommendations: [
      "Ajuster la hauteur du plan de travail",
      "Installer un support pour les avant-bras",
      "Réduire la fréquence des mouvements répétitifs",
      "Former l'opérateur aux bonnes postures"
    ]
  };

  const nioshAssessment = {
    task: "Levage de caisses - Zone stockage",
    parameters: {
      weight: 15, // kg
      horizontalDistance: 45, // cm
      verticalHeight: 75, // cm
      verticalTravel: 30, // cm
      asymmetryAngle: 30, // degrés
      frequency: 2, // levées/min
      duration: 4 // heures
    },
    results: {
      rwl: 12.5, // kg
      li: 1.2,
      interpretation: "Risque modéré - Amélioration recommandée"
    }
  };

  const libertyMutualData = {
    materialHandling: {
      score: 3.2,
      category: "Manipulation manuelle",
      risk: "Modéré",
      cost: "€2,400/incident"
    },
    workEnvironment: {
      score: 2.8,
      category: "Environnement travail",
      risk: "Faible",
      cost: "€1,800/incident"
    },
    safety: {
      score: 3.8,
      category: "Programmes sécurité",
      risk: "Élevé",
      cost: "€4,200/incident"
    }
  };

  const sixSigmaProjects = [
    {
      id: 1,
      title: "Réduction TMS Atelier A",
      phase: "Mesure",
      defectRate: "12.5%",
      target: "&lt; 5%",
      savings: "€85,000",
      timeline: "6 mois",
      status: "En cours"
    },
    {
      id: 2,
      title: "Optimisation Temps Formation",
      phase: "Amélioration",
      defectRate: "8.2%",
      target: "&lt; 3%",
      savings: "€45,000",
      timeline: "4 mois",
      status: "En cours"
    },
    {
      id: 3,
      title: "Standardisation EPI",
      phase: "Contrôle",
      defectRate: "2.1%",
      target: "&lt; 2%",
      savings: "€32,000",
      timeline: "Terminé",
      status: "Complété"
    }
  ];

  const jsaAnalysis = {
    task: "Maintenance équipement haute tension",
    steps: [
      {
        step: 1,
        description: "Préparation outils et EPI",
        hazards: ["Outils défaillants", "EPI inadéquat"],
        controls: ["Vérification systématique", "Check-list EPI"],
        risk: "Faible"
      },
      {
        step: 2,
        description: "Consignation électrique",
        hazards: ["Électrocution", "Arc électrique"],
        controls: ["Procédure LOTO", "Vérificateur d'absence tension"],
        risk: "Critique"
      },
      {
        step: 3,
        description: "Intervention mécanique",
        hazards: ["Chute d'outil", "Coupure"],
        controls: ["Sécurisation outils", "Gants anti-coupure"],
        risk: "Moyen"
      },
      {
        step: 4,
        description: "Remise en service",
        hazards: ["Mauvaise reconnexion", "Test inadéquat"],
        controls: ["Double vérification", "Procédure test"],
        risk: "Moyen"
      }
    ],
    overallRisk: "Élevé",
    recommendations: [
      "Formation spécialisée obligatoire",
      "Supervision systématique",
      "Équipement de mesure étalonné",
      "Procédure d'urgence définie"
    ]
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critique':
      case 'élevé':
        return 'bg-red-100 text-red-800';
      case 'moyen':
      case 'modéré':
        return 'bg-orange-100 text-orange-800';
      case 'faible':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 5) return 'text-red-600';
    if (score >= 3) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900">Outils d'Analyse Avancée</h1>
            <p className="text-gray-600">RULA, REBA, NIOSH, Liberty Mutual, Six Sigma, JSA/JHA</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter analyses
            </Button>
            <Button className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
              <Target className="w-4 h-4 mr-2" />
              Nouvelle analyse
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
                  <p className="text-sm text-gray-600">Analyses RULA/REBA</p>
                  <p className="text-2xl font-bold text-[var(--sahtee-blue-primary)]">47</p>
                </div>
                <Users className="w-6 h-6 text-[var(--sahtee-blue-primary)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Projets Six Sigma</p>
                  <p className="text-2xl font-bold text-green-500">3</p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">JSA/JHA complétées</p>
                  <p className="text-2xl font-bold text-[var(--sahtee-blue-secondary)]">156</p>
                </div>
                <CheckCircle className="w-6 h-6 text-[var(--sahtee-blue-secondary)]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Économies identifiées</p>
                  <p className="text-2xl font-bold text-purple-500">€162k</p>
                </div>
                <BarChart3 className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('rula-reba')}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === 'rula-reba' 
                ? 'border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            RULA / REBA
          </button>
          <button
            onClick={() => setActiveTab('niosh')}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === 'niosh' 
                ? 'border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calculator className="w-4 h-4 inline-block mr-2" />
            NIOSH
          </button>
          <button
            onClick={() => setActiveTab('liberty')}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === 'liberty' 
                ? 'border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline-block mr-2" />
            Liberty Mutual
          </button>
          <button
            onClick={() => setActiveTab('sixsigma')}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === 'sixsigma' 
                ? 'border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline-block mr-2" />
            Six Sigma
          </button>
          <button
            onClick={() => setActiveTab('jsa')}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === 'jsa' 
                ? 'border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline-block mr-2" />
            JSA / JHA
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'rula-reba' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Tool Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Évaluation Ergonomique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={selectedTool === 'rula' ? 'default' : 'outline'}
                      onClick={() => setSelectedTool('rula')}
                      className={selectedTool === 'rula' ? 'bg-[var(--sahtee-blue-primary)]' : ''}
                    >
                      RULA
                    </Button>
                    <Button
                      variant={selectedTool === 'reba' ? 'default' : 'outline'}
                      onClick={() => setSelectedTool('reba')}
                      className={selectedTool === 'reba' ? 'bg-[var(--sahtee-blue-primary)]' : ''}
                    >
                      REBA
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Analyse RULA - {rulaAssessment.employee}</h4>
                      <p className="text-sm text-gray-600">Évaluation du {rulaAssessment.date}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Bras/Poignet</span>
                          <span className={getScoreColor(rulaAssessment.scores.arm)}>{rulaAssessment.scores.arm}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Cou</span>
                          <span className={getScoreColor(rulaAssessment.scores.neck)}>{rulaAssessment.scores.neck}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tronc</span>
                          <span className={getScoreColor(rulaAssessment.scores.trunk)}>{rulaAssessment.scores.trunk}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Jambes</span>
                          <span className={getScoreColor(rulaAssessment.scores.legs)}>{rulaAssessment.scores.legs}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Muscle</span>
                          <span className={getScoreColor(rulaAssessment.scores.muscle)}>{rulaAssessment.scores.muscle}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Force</span>
                          <span className={getScoreColor(rulaAssessment.scores.force)}>{rulaAssessment.scores.force}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-orange-900">Score Final RULA</h5>
                          <p className="text-sm text-orange-700">{rulaAssessment.interpretation.action}</p>
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {rulaAssessment.scores.finalScore}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskColor(rulaAssessment.interpretation.level)}>
                      Risque {rulaAssessment.interpretation.level}
                    </Badge>
                    <Badge variant="outline">
                      Priorité {rulaAssessment.interpretation.priority}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Actions correctives</h4>
                    <div className="space-y-2">
                      {rulaAssessment.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Planning d'intervention</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Ajustements immédiats</span>
                        <span className="text-orange-600">1 semaine</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Formation ergonomie</span>
                        <span className="text-blue-600">2 semaines</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Réévaluation complète</span>
                        <span className="text-green-600">1 mois</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'niosh' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyse NIOSH - Équation de levage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">{nioshAssessment.task}</h4>
                    <p className="text-sm text-gray-600">Évaluation ergonomique du poste</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Poids de l'objet</span>
                        <span className="font-medium">{nioshAssessment.parameters.weight} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Distance horizontale</span>
                        <span className="font-medium">{nioshAssessment.parameters.horizontalDistance} cm</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Hauteur de levage</span>
                        <span className="font-medium">{nioshAssessment.parameters.verticalHeight} cm</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Déplacement vertical</span>
                        <span className="font-medium">{nioshAssessment.parameters.verticalTravel} cm</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Angle d'asymétrie</span>
                        <span className="font-medium">{nioshAssessment.parameters.asymmetryAngle}°</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Fréquence</span>
                        <span className="font-medium">{nioshAssessment.parameters.frequency}/min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Durée</span>
                        <span className="font-medium">{nioshAssessment.parameters.duration}h</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Limite de Poids Recommandée (RWL)</span>
                      <span className="text-lg font-bold text-[var(--sahtee-blue-primary)]">
                        {nioshAssessment.results.rwl} kg
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Indice de Levage (LI)</span>
                      <span className={`text-lg font-bold ${
                        nioshAssessment.results.li > 1 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {nioshAssessment.results.li}
                      </span>
                    </div>
                    
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-orange-900">
                        {nioshAssessment.results.interpretation}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interprétation et Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Signification de l'Indice de Levage</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>LI ≤ 1.0 : Risque minimal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>1.0 &lt; LI ≤ 3.0 : Risque modéré - Amélioration recommandée</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>LI &gt; 3.0 : Risque élevé - Action immédiate</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Actions recommandées</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                        <span>Réduire le poids des charges (max 12 kg)</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                        <span>Rapprocher les objets du corps (distance &lt; 40 cm)</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                        <span>Installer une aide mécanique au levage</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                        <span>Former aux techniques de manutention</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Simulation d'amélioration</h5>
                    <div className="text-sm text-blue-700">
                      <p>Avec les modifications proposées :</p>
                      <p>• Nouveau RWL estimé : 15.8 kg</p>
                      <p>• Nouvel LI estimé : 0.95</p>
                      <p className="font-medium">→ Risque ramené au niveau acceptable</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'liberty' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyse Liberty Mutual - Tables de risques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Manipulation Manuelle</h4>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {libertyMutualData.materialHandling.score}
                        </div>
                        <div className="text-sm text-gray-600">Score de risque</div>
                      </div>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Niveau de risque</span>
                          <Badge className={getRiskColor(libertyMutualData.materialHandling.risk)}>
                            {libertyMutualData.materialHandling.risk}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Coût moyen</span>
                          <span className="font-medium">{libertyMutualData.materialHandling.cost}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Environnement</h4>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {libertyMutualData.workEnvironment.score}
                        </div>
                        <div className="text-sm text-gray-600">Score de risque</div>
                      </div>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Niveau de risque</span>
                          <Badge className={getRiskColor(libertyMutualData.workEnvironment.risk)}>
                            {libertyMutualData.workEnvironment.risk}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Coût moyen</span>
                          <span className="font-medium">{libertyMutualData.workEnvironment.cost}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Programmes Sécurité</h4>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {libertyMutualData.safety.score}
                        </div>
                        <div className="text-sm text-gray-600">Score de risque</div>
                      </div>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Niveau de risque</span>
                          <Badge className={getRiskColor(libertyMutualData.safety.risk)}>
                            {libertyMutualData.safety.risk}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Coût moyen</span>
                          <span className="font-medium">{libertyMutualData.safety.cost}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan d'action Liberty Mutual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <h4 className="font-medium text-red-900">Priorité 1 : Programmes Sécurité</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Score de 3.8 indique des lacunes importantes dans les programmes de sécurité.
                      Amélioration potentielle : réduction de 40% des incidents.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-medium text-orange-900">Priorité 2 : Manipulation Manuelle</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Score de 3.2 nécessite des améliorations ergonomiques.
                      Formation et équipements d'aide recommandés.
                    </p>
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h5 className="font-medium mb-2">Actions immédiates</h5>
                      <ul className="text-sm space-y-1">
                        <li>• Révision procédures sécurité</li>
                        <li>• Formation superviseurs</li>
                        <li>• Audit des pratiques actuelles</li>
                        <li>• Mise en place d'indicateurs</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Actions moyen terme</h5>
                      <ul className="text-sm space-y-1">
                        <li>• Investissement en équipements</li>
                        <li>• Programme d'ergonomie</li>
                        <li>• Système de récompenses</li>
                        <li>• Évaluation régulière</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'sixsigma' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projets Six Sigma SST</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sixSigmaProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{project.title}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>Phase: {project.phase}</span>
                            <span>Timeline: {project.timeline}</span>
                            <Badge className={project.status === 'Complété' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{project.savings}</div>
                          <div className="text-xs text-gray-500">Économies estimées</div>
                        </div>
                      </div>
                      
                      <div className="grid lg:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Taux de défaut actuel</span>
                          <div className="font-medium text-red-600">{project.defectRate}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Objectif</span>
                          <div className="font-medium text-green-600">{project.target}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Progression</span>
                          <Progress value={project.status === 'Complété' ? 100 : 65} className="h-2 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Méthodologie DMAIC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="font-bold text-[var(--sahtee-blue-primary)]">D</div>
                    <div className="text-sm mt-1">Définir</div>
                    <div className="text-xs text-gray-600">Problème identifié</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-bold text-green-600">M</div>
                    <div className="text-sm mt-1">Mesurer</div>
                    <div className="text-xs text-gray-600">Données collectées</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="font-bold text-orange-600">A</div>
                    <div className="text-sm mt-1">Analyser</div>
                    <div className="text-xs text-gray-600">Causes identifiées</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="font-bold text-purple-600">I</div>
                    <div className="text-sm mt-1">Améliorer</div>
                    <div className="text-xs text-gray-600">Solutions mises en place</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-600">C</div>
                    <div className="text-sm mt-1">Contrôler</div>
                    <div className="text-xs text-gray-600">Surveillance continue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'jsa' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyse Sécurité du Travail (JSA)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{jsaAnalysis.task}</h4>
                      <p className="text-sm text-gray-600">Analyse des risques par étape</p>
                    </div>
                    <Badge className={getRiskColor(jsaAnalysis.overallRisk)}>
                      Risque Global: {jsaAnalysis.overallRisk}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {jsaAnalysis.steps.map((step) => (
                      <div key={step.step} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-medium">Étape {step.step}: {step.description}</h5>
                          </div>
                          <Badge className={getRiskColor(step.risk)}>
                            {step.risk}
                          </Badge>
                        </div>
                        
                        <div className="grid lg:grid-cols-2 gap-4">
                          <div>
                            <h6 className="text-sm font-medium text-red-700 mb-2">Dangers identifiés</h6>
                            <ul className="text-sm space-y-1">
                              {step.hazards.map((hazard, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span>{hazard}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h6 className="text-sm font-medium text-green-700 mb-2">Mesures de contrôle</h6>
                            <ul className="text-sm space-y-1">
                              {step.controls.map((control, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{control}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommandations Générales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Plan d'action prioritaire</h4>
                    <div className="space-y-2">
                      {jsaAnalysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                          <div className="bg-[var(--sahtee-blue-primary)] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h5 className="font-medium mb-2">Ressources nécessaires</h5>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Formateur certifié électricité</li>
                        <li>• Équipements de mesure étalonnés</li>
                        <li>• Supervision expérimentée</li>
                        <li>• Procédures d'urgence actualisées</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Timeline d'implémentation</h5>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Formation: 2 semaines</li>
                        <li>• Mise à jour procédures: 1 semaine</li>
                        <li>• Test équipements: 3 jours</li>
                        <li>• Validation finale: 1 semaine</li>
                      </ul>
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