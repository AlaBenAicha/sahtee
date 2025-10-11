import { useState } from "react";
import { 
  BarChart3, Shield, Target, GraduationCap, Smartphone, 
  Heart, Bot, Store, Calculator, TrendingUp 
} from "lucide-react";

interface PlatformPreviewProps {
  dashboardImage: string;
}

export function PlatformPreview({ dashboardImage }: PlatformPreviewProps) {
  const [activeModule, setActiveModule] = useState(0);
  
  const modules = [
    {
      icon: BarChart3,
      title: "Tableau de bord général",
      description: "Vue panoramique : cartographie risques (physiques, chimiques, biologiques, psychosociaux, organisationnels, machines). Indicateurs clés (taux fréquence, gravité, absentéisme). Tableaux personnalisables avec filtres par site, secteur, service.",
      features: ["Cartographie des risques", "KPIs en temps réel", "Rapports automatisés", "Alertes intelligentes"]
    },
    {
      icon: Shield,
      title: "Audit Room (conformité)",
      description: "Bibliothèque réglementaire complète, suivi de conformité en temps réel, progression selon les normes ISO, OSHA et réglementations locales.",
      features: ["Base réglementaire", "Suivi conformité", "Normes ISO/OSHA", "Audits automatisés"]
    },
    {
      icon: Target,
      title: "Plans d'action préventifs & correctifs", 
      description: "Gestion hiérarchisée des actions correctives et préventives avec interface type Kanban. Priorisation automatique selon criticité des risques.",
      features: ["Interface Kanban", "Priorisation auto", "Suivi temps réel", "Validation workflow"]
    },
    {
      icon: GraduationCap,
      title: "Formation continue (e-learning)",
      description: "Plateforme LMS intégrée avec vidéos interactives, quiz adaptatifs, certifications numériques et suivi des compétences.",
      features: ["Vidéos interactives", "Quiz adaptatifs", "Certifications", "Suivi compétences"]
    },
    {
      icon: Smartphone,
      title: "Application mobile / QR Code",
      description: "Application mobile pour déclaration d'incidents, notifications push, quiz de sensibilisation et accès aux procédures via QR codes.",
      features: ["App mobile native", "QR codes", "Notifications push", "Mode offline"]
    },
    {
      icon: Heart,
      title: "Suivi maladies professionnelles",
      description: "Surveillance de la santé collective avec courbes épidémiologiques, fiches d'exposition, analyses des causes et prévention ciblée.",
      features: ["Surveillance collective", "Courbes épidémiologiques", "Fiches exposition", "Prévention ciblée"]
    },
    {
      icon: Bot,
      title: "Chatbot chimique",
      description: "Assistant intelligent pour information instantanée sur les substances chimiques, FDS automatisées et aide à l'évaluation des risques.",
      features: ["IA conversationnelle", "Base FDS", "Évaluation risques", "Support 24/7"]
    },
    {
      icon: Store,
      title: "Marketplace SST",
      description: "Recommandations neutres d'équipements de protection individuelle et solutions ergonomiques adaptées aux postes de travail.",
      features: ["Catalogue EPI", "Recommandations", "Comparatifs neutres", "Ergonomie postes"]
    },
    {
      icon: Calculator,
      title: "Moteur de calcul SST",
      description: "Calculs ROI sécurité, évaluation coûts directs/indirects des accidents, empreinte carbone et indicateurs de performance.",
      features: ["ROI sécurité", "Coûts accidents", "Empreinte carbone", "Indicateurs performance"]
    },
    {
      icon: TrendingUp,
      title: "Outils d'analyse avancée",
      description: "Méthodes RULA, REBA, NIOSH, Liberty Mutual, Six Sigma, analyses JSA/JHA pour évaluation ergonomique et prévention ciblée.",
      features: ["Méthodes RULA/REBA", "Analyse NIOSH", "Six Sigma", "JSA/JHA"]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-6 text-gray-900">
            Aperçu de la plateforme
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explorez nos modules interconnectés pour une gestion complète de la SST
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Modules List */}
          <div className="space-y-4">
            {modules.map((module, index) => (
              <div 
                key={index}
                onClick={() => setActiveModule(index)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  activeModule === index 
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-[var(--sahtee-blue-primary)] shadow-md' 
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-2 ${
                    activeModule === index 
                      ? 'bg-gradient-to-br from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)]' 
                      : 'bg-gray-400'
                  }`}>
                    <module.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={`text-lg ${
                    activeModule === index ? 'text-[var(--sahtee-blue-primary)]' : 'text-gray-700'
                  }`}>
                    {module.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          
          {/* Module Detail */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-[var(--sahtee-blue-primary)] to-[var(--sahtee-blue-secondary)] rounded-full p-3">
                {(() => {
                  const IconComponent = modules[activeModule].icon;
                  return <IconComponent className="w-8 h-8 text-white" />;
                })()}
              </div>
              <h3 className="text-2xl text-gray-900">
                {modules[activeModule].title}
              </h3>
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-8">
              {modules[activeModule].description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {modules[activeModule].features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--sahtee-blue-primary)] rounded-full"></div>
                  <span className="text-sm text-gray-600">{feature}</span>
                </div>
              ))}
            </div>
            
            {/* Mock Dashboard */}
            <div className="bg-white rounded-lg p-4 shadow-inner">
              <img 
                src={dashboardImage}
                alt="Dashboard Preview"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}