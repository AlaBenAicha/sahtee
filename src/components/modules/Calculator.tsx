import {
  BarChart3,
  Calculator as CalcIcon,
  DollarSign,
  Download,
  Leaf,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

export function Calculator() {
  const [activeTab, setActiveTab] = useState("roi");
  const [calculatorInputs, setCalculatorInputs] = useState({
    accidents: "",
    absenteeism: "",
    turnover: "",
    employees: "",
    averageSalary: "",
    trainingCosts: "",
    equipmentCosts: "",
  });

  const [roiResults, setRoiResults] = useState({
    currentCosts: 0,
    preventionCosts: 0,
    savings: 0,
    roi: 0,
    paybackPeriod: 0,
  });

  const calculateROI = () => {
    const accidents = parseInt(calculatorInputs.accidents) || 0;
    const absenteeism = parseFloat(calculatorInputs.absenteeism) || 0;
    const turnover = parseFloat(calculatorInputs.turnover) || 0;
    const employees = parseInt(calculatorInputs.employees) || 0;
    const avgSalary = parseFloat(calculatorInputs.averageSalary) || 0;
    const trainingCosts = parseFloat(calculatorInputs.trainingCosts) || 0;
    const equipmentCosts = parseFloat(calculatorInputs.equipmentCosts) || 0;

    // Calculs simplifiés pour la démonstration
    const accidentCosts = accidents * 15000; // Coût moyen par accident
    const absenteeismCosts = (absenteeism / 100) * employees * avgSalary * 0.2;
    const turnoverCosts = (turnover / 100) * employees * avgSalary * 0.5;
    const currentCosts = accidentCosts + absenteeismCosts + turnoverCosts;

    const preventionCosts = trainingCosts + equipmentCosts;
    const estimatedReduction = 0.4; // 40% de réduction estimée
    const savings = currentCosts * estimatedReduction;
    const netSavings = savings - preventionCosts;
    const roi = preventionCosts > 0 ? (netSavings / preventionCosts) * 100 : 0;
    const paybackPeriod = savings > 0 ? preventionCosts / (savings / 12) : 0;

    setRoiResults({
      currentCosts,
      preventionCosts,
      savings: netSavings,
      roi,
      paybackPeriod,
    });
  };

  const carbonData = {
    transportation: { value: 450, unit: "kg CO₂/mois" },
    energy: { value: 1200, unit: "kg CO₂/mois" },
    waste: { value: 280, unit: "kg CO₂/mois" },
    digitalFootprint: { value: 150, unit: "kg CO₂/mois" },
    total: { value: 2080, unit: "kg CO₂/mois" },
  };

  const benchmarks = [
    {
      category: "Taux de fréquence",
      yourValue: 12.5,
      benchmark: 15.2,
      unit: "/1000h",
      status: "good",
    },
    {
      category: "Taux de gravité",
      yourValue: 0.8,
      benchmark: 1.2,
      unit: "/1000h",
      status: "good",
    },
    {
      category: "Absentéisme",
      yourValue: 6.2,
      benchmark: 4.8,
      unit: "%",
      status: "poor",
    },
    {
      category: "Turnover",
      yourValue: 8.5,
      benchmark: 12.1,
      unit: "%",
      status: "good",
    },
    {
      category: "Coût par employé",
      yourValue: 2400,
      benchmark: 3100,
      unit: "€/an",
      status: "good",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600";
      case "poor":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return "↓";
      case "poor":
        return "↑";
      default:
        return "→";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900">Impact Calculator</h1>
            <p className="text-gray-600">
              ROI sécurité, analyse des coûts et empreinte carbone
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter analyse
            </Button>
            <Button className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau calcul
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("roi")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "roi"
                ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <DollarSign className="w-4 h-4 inline-block mr-2" />
            ROI Sécurité
          </button>
          <button
            onClick={() => setActiveTab("costs")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "costs"
                ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart3 className="w-4 h-4 inline-block mr-2" />
            Analyse des Coûts
          </button>
          <button
            onClick={() => setActiveTab("carbon")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "carbon"
                ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Leaf className="w-4 h-4 inline-block mr-2" />
            Empreinte Carbone
          </button>
          <button
            onClick={() => setActiveTab("benchmarks")}
            className={`py-4 px-2 border-b-2 transition-colors ${
              activeTab === "benchmarks"
                ? "border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <TrendingUp className="w-4 h-4 inline-block mr-2" />
            Benchmarks
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === "roi" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Calculator Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalcIcon className="w-5 h-5 text-[var(--sahtee-blue-primary)]" />
                  Calculateur ROI Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Accidents annuels
                      </label>
                      <input
                        type="number"
                        value={calculatorInputs.accidents}
                        onChange={(e) =>
                          setCalculatorInputs({
                            ...calculatorInputs,
                            accidents: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Taux absentéisme (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={calculatorInputs.absenteeism}
                        onChange={(e) =>
                          setCalculatorInputs({
                            ...calculatorInputs,
                            absenteeism: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="4.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Turnover (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={calculatorInputs.turnover}
                        onChange={(e) =>
                          setCalculatorInputs({
                            ...calculatorInputs,
                            turnover: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="8.2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nombre d'employés
                      </label>
                      <input
                        type="number"
                        value={calculatorInputs.employees}
                        onChange={(e) =>
                          setCalculatorInputs({
                            ...calculatorInputs,
                            employees: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="150"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Salaire moyen annuel (€)
                    </label>
                    <input
                      type="number"
                      value={calculatorInputs.averageSalary}
                      onChange={(e) =>
                        setCalculatorInputs({
                          ...calculatorInputs,
                          averageSalary: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg text-sm"
                      placeholder="45000"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Coûts formation (€)
                      </label>
                      <input
                        type="number"
                        value={calculatorInputs.trainingCosts}
                        onChange={(e) =>
                          setCalculatorInputs({
                            ...calculatorInputs,
                            trainingCosts: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="25000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Coûts équipement (€)
                      </label>
                      <input
                        type="number"
                        value={calculatorInputs.equipmentCosts}
                        onChange={(e) =>
                          setCalculatorInputs({
                            ...calculatorInputs,
                            equipmentCosts: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="15000"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={calculateROI}
                    className="w-full bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
                  >
                    Calculer le ROI
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Résultats du calcul ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {roiResults.currentCosts.toLocaleString("fr-FR")}€
                      </div>
                      <div className="text-sm text-red-700">
                        Coûts actuels annuels
                      </div>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <div className="text-2xl font-bold text-[var(--sahtee-blue-primary)]">
                        {roiResults.preventionCosts.toLocaleString("fr-FR")}€
                      </div>
                      <div className="text-sm text-primary">
                        Investissement prévention
                      </div>
                    </div>
                  </div>

                  <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {roiResults.savings.toLocaleString("fr-FR")}€
                    </div>
                    <div className="text-sm text-green-700 mb-4">
                      Économies nettes annuelles
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-bold text-lg">
                          {roiResults.roi.toFixed(1)}%
                        </div>
                        <div className="text-green-600">ROI</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">
                          {roiResults.paybackPeriod.toFixed(1)} mois
                        </div>
                        <div className="text-green-600">Période de retour</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Analyse détaillée</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Réduction estimée des accidents: 40%</li>
                      <li>• Diminution de l'absentéisme: 25%</li>
                      <li>• Amélioration de la productivité: 15%</li>
                      <li>• Réduction des primes d'assurance: 10%</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "costs" && (
          <div className="space-y-6">
            {/* Cost Breakdown */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Coûts Directs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Accidents du travail</span>
                      <span className="font-medium">180,000€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Maladies professionnelles</span>
                      <span className="font-medium">95,000€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Équipements de protection</span>
                      <span className="font-medium">45,000€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Formations SST</span>
                      <span className="font-medium">25,000€</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-[var(--sahtee-blue-primary)]">
                        345,000€
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Coûts Indirects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Absentéisme</span>
                      <span className="font-medium">125,000€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Perte de productivité</span>
                      <span className="font-medium">89,000€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Turnover</span>
                      <span className="font-medium">156,000€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Image de marque</span>
                      <span className="font-medium">35,000€</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-orange-500">405,000€</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Coût Total SST</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-red-500">
                      750,000€
                    </div>
                    <div className="text-sm text-gray-600">
                      Coût annuel total
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-medium">5,000€</div>
                      <div className="text-sm text-gray-600">
                        Par employé/an
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-medium">2.1%</div>
                      <div className="text-sm text-gray-600">
                        Du chiffre d'affaires
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Evolution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des coûts SST</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">
                        Répartition par catégorie
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Accidents (46%)</span>
                            <span>345,000€</span>
                          </div>
                          <Progress value={46} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Coûts indirects (54%)</span>
                            <span>405,000€</span>
                          </div>
                          <Progress value={54} className="h-2 bg-orange-200" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Tendance mensuelle</h4>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>Janvier 2024</span>
                          <span className="text-red-500">+12%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Décembre 2023</span>
                          <span className="text-red-500">+8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Novembre 2023</span>
                          <span className="text-green-500">-3%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Octobre 2023</span>
                          <span className="text-green-500">-7%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "carbon" && (
          <div className="space-y-6">
            {/* Carbon Footprint Overview */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-500" />
                    Empreinte Carbone SST
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {carbonData.total.value.toLocaleString("fr-FR")}
                      </div>
                      <div className="text-sm text-green-700">
                        {carbonData.total.unit}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Empreinte totale
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Transport employés</span>
                        <span className="font-medium">
                          {carbonData.transportation.value}{" "}
                          {carbonData.transportation.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          Consommation énergétique
                        </span>
                        <span className="font-medium">
                          {carbonData.energy.value} {carbonData.energy.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Gestion des déchets</span>
                        <span className="font-medium">
                          {carbonData.waste.value} {carbonData.waste.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Empreinte numérique</span>
                        <span className="font-medium">
                          {carbonData.digitalFootprint.value}{" "}
                          {carbonData.digitalFootprint.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions de réduction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-medium text-green-900">
                        Télétravail
                      </h4>
                      <p className="text-sm text-green-700">
                        Réduction transport: -180 kg CO₂/mois
                      </p>
                    </div>

                    <div className="p-3 bg-secondary rounded-lg border-l-4 border-primary">
                      <h4 className="font-medium text-primary">
                        Optimisation énergétique
                      </h4>
                      <p className="text-sm text-primary">
                        LED + isolation: -200 kg CO₂/mois
                      </p>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-medium text-purple-900">
                        Déchets valorisés
                      </h4>
                      <p className="text-sm text-purple-700">
                        Recyclage: -50 kg CO₂/mois
                      </p>
                    </div>

                    <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <h4 className="font-medium text-orange-900">
                        Dématérialisation
                      </h4>
                      <p className="text-sm text-orange-700">
                        Paperless: -25 kg CO₂/mois
                      </p>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">
                          -455 kg CO₂/mois
                        </div>
                        <div className="text-sm text-gray-600">
                          Réduction potentielle totale
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Carbon Reduction Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Objectifs de réduction carbone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Objectif 2024: -20% d'émissions</span>
                      <span>Progression: 65%</span>
                    </div>
                    <Progress value={65} className="h-3" />
                    <div className="text-xs text-gray-600 mt-1">
                      Réduction actuelle: 270 kg CO₂/mois sur 415 kg objectif
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold">2,080</div>
                      <div className="text-sm text-gray-600">
                        kg CO₂/mois actuel
                      </div>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <div className="text-xl font-bold text-[var(--sahtee-blue-primary)]">
                        1,665
                      </div>
                      <div className="text-sm text-primary">
                        kg CO₂/mois objectif
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        1,625
                      </div>
                      <div className="text-sm text-green-700">
                        kg CO₂/mois possible
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "benchmarks" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparaison sectorielle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {benchmarks.map((benchmark, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{benchmark.category}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="text-sm">
                            <span className="text-gray-600">
                              Votre résultat:{" "}
                            </span>
                            <span
                              className={`font-medium ${getStatusColor(
                                benchmark.status
                              )}`}
                            >
                              {benchmark.yourValue} {benchmark.unit}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">
                              Moyenne secteur:{" "}
                            </span>
                            <span className="font-medium">
                              {benchmark.benchmark} {benchmark.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            benchmark.status === "good"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {benchmark.status === "good" ? "Bon" : "À améliorer"}
                        </Badge>
                        <span
                          className={`text-2xl ${getStatusColor(
                            benchmark.status
                          )}`}
                        >
                          {getStatusIcon(benchmark.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Industry Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Positionnement sectoriel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Performance globale</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Score SST global</span>
                          <span className="font-medium">72/100</span>
                        </div>
                        <Progress value={72} className="h-2" />
                      </div>
                      <div className="text-sm text-gray-600">
                        Vous êtes dans le <strong>75e percentile</strong> de
                        votre secteur
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">
                      Axes d'amélioration prioritaires
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>1. Réduction absentéisme</span>
                        <Badge className="bg-red-100 text-red-800">
                          Priorité 1
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>2. Formation continue</span>
                        <Badge className="bg-orange-100 text-orange-800">
                          Priorité 2
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>3. Équipements ergonomiques</span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Priorité 3
                        </Badge>
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
