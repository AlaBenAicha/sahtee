import {
  AlertTriangle,
  Award,
  BookOpen,
  Bot,
  Calendar,
  Camera,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  MapPin,
  Package,
  Play,
  Plus,
  QrCode,
  Search,
  Shield,
  Star,
  Target,
  TrendingUp,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { CAPATabView } from "../../types/capa";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

export function CAPARoom() {
  const [activeTab, setActiveTab] = useState<CAPATabView>("actions");
  const [view, setView] = useState("kanban");
  const [trainingTab, setTrainingTab] = useState("catalog");
  const [equipmentCategory, setEquipmentCategory] = useState<
    "epi" | "ergonomie" | "securite" | "signalisation"
  >("epi");
  const [markedEquipment, setMarkedEquipment] = useState<string[]>([]);

  // Incidents state
  const [incidentsTab, setIncidentsTab] = useState("declarations");
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentFormStep, setIncidentFormStep] = useState(1);
  const [incidentFormData, setIncidentFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().split(" ")[0].substring(0, 5),
    location: "",
    severity: "moderate" as "minor" | "moderate" | "severe" | "critical",
    category: "",
    description: "",
    immediateActions: "",
    witnesses: [] as string[],
    affectedPersons: 0,
    photos: [] as string[],
  });
  const [newWitness, setNewWitness] = useState("");

  // Scheduler state
  const [schedulerView, setSchedulerView] = useState<
    "timeline" | "priority" | "resources" | "suggestions"
  >("timeline");
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week

  // Handle URL parameters for deep linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view") as CAPATabView;
    if (
      viewParam &&
      ["actions", "training", "equipment", "incidents", "scheduler"].includes(
        viewParam
      )
    ) {
      setActiveTab(viewParam);
    }
  }, []);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as CAPATabView);
    const url = new URL(window.location.href);
    url.searchParams.set("view", tab);
    window.history.pushState({}, "", url);
  };

  // Action Plans mock data (from original ActionPlans component)
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

  // Training mock data (from Training.tsx)
  const courses = [
    {
      id: 1,
      title: "Manipulation Manuelle des Charges",
      description: "Techniques de manutention sécurisée et prévention des TMS",
      category: "Ergonomie",
      duration: "2h 30min",
      level: "Débutant",
      rating: 4.8,
      enrolled: 24,
      completed: 18,
      thumbnail:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      modules: 8,
      certifiable: true,
      mandatory: true,
    },
    {
      id: 2,
      title: "Sécurité Chimique en Laboratoire",
      description:
        "Manipulation sécurisée des produits chimiques et équipements de protection",
      category: "Chimique",
      duration: "3h 15min",
      level: "Intermédiaire",
      rating: 4.9,
      enrolled: 12,
      completed: 8,
      thumbnail:
        "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=300&h=200&fit=crop",
      modules: 12,
      certifiable: true,
      mandatory: true,
    },
    {
      id: 3,
      title: "Conduite en Sécurité d'Équipements",
      description:
        "Utilisation sécurisée des machines et équipements industriels",
      category: "Machines",
      duration: "4h 00min",
      level: "Avancé",
      rating: 4.7,
      enrolled: 8,
      completed: 5,
      thumbnail:
        "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=300&h=200&fit=crop",
      modules: 15,
      certifiable: true,
      mandatory: false,
    },
    {
      id: 4,
      title: "Gestion du Stress au Travail",
      description:
        "Techniques de gestion du stress et prévention des risques psychosociaux",
      category: "Psychosocial",
      duration: "1h 45min",
      level: "Débutant",
      rating: 4.6,
      enrolled: 32,
      completed: 28,
      thumbnail:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=200&fit=crop",
      modules: 6,
      certifiable: false,
      mandatory: false,
    },
  ];

  const myTrainings = [
    {
      id: 1,
      courseId: 1,
      progress: 75,
      lastAccessed: "2024-01-20",
      completedModules: 6,
      totalModules: 8,
      status: "En cours",
      certificateEarned: false,
    },
    {
      id: 2,
      courseId: 2,
      progress: 100,
      lastAccessed: "2024-01-15",
      completedModules: 12,
      totalModules: 12,
      status: "Terminé",
      certificateEarned: true,
    },
  ];

  const certificates = [
    {
      id: 1,
      courseName: "Sécurité Chimique en Laboratoire",
      issuedDate: "2024-01-15",
      expiryDate: "2025-01-15",
      certificateNumber: "SCHT-2024-001",
      status: "Valide",
    },
    {
      id: 2,
      courseName: "Manipulation Manuelle des Charges",
      issuedDate: "2023-06-10",
      expiryDate: "2024-06-10",
      certificateNumber: "MMC-2023-024",
      status: "Expire bientôt",
    },
  ];

  // Equipment mock data (adapted from Marketplace without prices)
  const equipmentData = {
    epi: [
      {
        id: "epi1",
        name: "Gants de protection chimique renforcés",
        description:
          "Gants jetables en nitrile, haute résistance aux produits chimiques",
        image:
          "https://images.unsplash.com/photo-1635862532821-88bd99afb5dd?w=300&h=200&fit=crop",
        certifications: ["EN 374", "EN 420"],
        features: [
          "Sans poudre",
          "Résistant chimique",
          "Grippage renforcé",
          "Manchette longue",
        ],
        category: "epi",
        aiRecommended: true,
        aiReason: "Suite aux 3 incidents chimiques de ce mois",
        confidence: 92,
      },
      {
        id: "epi2",
        name: "Masques respiratoires FFP3",
        description: "Protection contre particules fines et aérosols dangereux",
        image:
          "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=300&h=200&fit=crop",
        certifications: ["EN 149", "FFP3"],
        features: [
          "Filtration 99%",
          "Soupape expiratoire",
          "Élastiques confort",
          "Usage unique",
        ],
        category: "epi",
        aiRecommended: true,
        aiReason: "Recommandé pour environnements poussiéreux",
        confidence: 88,
      },
      {
        id: "epi3",
        name: "Chaussures de sécurité S3",
        description:
          "Chaussures hautes avec coque de protection et semelle anti-perforation",
        image:
          "https://images.unsplash.com/photo-1544966503-7cc4ac7b567a?w=300&h=200&fit=crop",
        certifications: ["ISO 20345", "S3"],
        features: [
          "Coque composite",
          "Anti-perforation",
          "Imperméable",
          "Semelle antidérapante",
        ],
        category: "epi",
        aiRecommended: false,
      },
      {
        id: "epi4",
        name: "Lunettes de protection étanches",
        description: "Lunettes panoramiques avec ventilation indirecte",
        image:
          "https://images.unsplash.com/photo-1577985051167-0d49aec6c35c?w=300&h=200&fit=crop",
        certifications: ["EN 166"],
        features: [
          "Anti-buée",
          "Protection UV400",
          "Réglables",
          "Ventilation indirecte",
        ],
        category: "epi",
        aiRecommended: false,
      },
    ],
    ergonomie: [
      {
        id: "ergo1",
        name: "Ceinture lombaire de soutien",
        description: "Support dorsal ergonomique pour travaux physiques",
        image:
          "https://images.unsplash.com/photo-1611117775350-ac3950990985?w=300&h=200&fit=crop",
        certifications: ["ISO 11228"],
        features: [
          "Ajustable",
          "Respirant",
          "Support lombaire",
          "Maintien renforcé",
        ],
        category: "ergonomie",
        aiRecommended: true,
        aiReason: "Augmentation des TMS dans l'atelier",
        confidence: 85,
      },
      {
        id: "ergo2",
        name: "Tapis anti-fatigue",
        description: "Tapis ergonomique pour postes de travail debout",
        image:
          "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=300&h=200&fit=crop",
        certifications: ["EN ISO 24343"],
        features: [
          "Anti-dérapant",
          "Mousse mémoire",
          "Facile entretien",
          "Bordures biseautées",
        ],
        category: "ergonomie",
        aiRecommended: false,
      },
      {
        id: "ergo3",
        name: "Aide à la manutention",
        description: "Système d'assistance pour levage de charges lourdes",
        image:
          "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=300&h=200&fit=crop",
        certifications: ["EN 1005"],
        features: [
          "Capacité 50kg",
          "Portable",
          "Réduction effort 80%",
          "Facile à utiliser",
        ],
        category: "ergonomie",
        aiRecommended: true,
        aiReason: "Prévention des blessures de manutention",
        confidence: 90,
      },
      {
        id: "ergo4",
        name: "Siège ergonomique atelier",
        description: "Siège réglable pour postes de travail industriels",
        image:
          "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=300&h=200&fit=crop",
        certifications: ["EN 1335"],
        features: [
          "Hauteur variable",
          "Support lombaire",
          "Roulettes tout terrain",
          "Rotation 360°",
        ],
        category: "ergonomie",
        aiRecommended: false,
      },
    ],
    securite: [
      {
        id: "sec1",
        name: "Détecteur de gaz portable",
        description: "Détection multi-gaz pour environnements dangereux",
        image:
          "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=200&fit=crop",
        certifications: ["EN 60079", "ATEX"],
        features: [
          "4 gaz simultanés",
          "Alarmes visuelles/sonores",
          "Autonomie 24h",
          "Enregistrement données",
        ],
        category: "securite",
        aiRecommended: true,
        aiReason: "Requis pour Plan d'Action #2",
        confidence: 95,
      },
      {
        id: "sec2",
        name: "Extincteur CO2 5kg",
        description: "Extincteur pour feux électriques et classe B",
        image:
          "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&h=200&fit=crop",
        certifications: ["EN 3", "CE"],
        features: [
          "Classe B et E",
          "Pression permanente",
          "Maintenance incluse",
          "Support mural",
        ],
        category: "securite",
        aiRecommended: false,
      },
      {
        id: "sec3",
        name: "Trousse de premiers secours",
        description: "Kit complet conforme réglementation entreprise",
        image:
          "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300&h=200&fit=crop",
        certifications: ["DIN 13157"],
        features: [
          "20 personnes",
          "Complet",
          "Mallette rigide",
          "Recharge facilitée",
        ],
        category: "securite",
        aiRecommended: false,
      },
      {
        id: "sec4",
        name: "Système d'arrêt d'urgence",
        description: "Bouton d'arrêt d'urgence conforme normes machines",
        image:
          "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=300&h=200&fit=crop",
        certifications: ["EN 418", "ISO 13850"],
        features: [
          "Coup de poing",
          "Verrouillage",
          "IP65",
          "Installation simple",
        ],
        category: "securite",
        aiRecommended: false,
      },
    ],
    signalisation: [
      {
        id: "sign1",
        name: "Panneaux de sécurité",
        description: "Kit de signalisation sécurité complet",
        image:
          "https://images.unsplash.com/photo-1622126807280-9b5b5f2b1d8f?w=300&h=200&fit=crop",
        certifications: ["ISO 7010", "EN ISO 7010"],
        features: [
          "12 panneaux",
          "Aluminium",
          "Résistant UV",
          "Fixations incluses",
        ],
        category: "signalisation",
        aiRecommended: false,
      },
      {
        id: "sign2",
        name: "Balisage de zones dangereuses",
        description: "Rubans et chaînes de délimitation",
        image:
          "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=300&h=200&fit=crop",
        certifications: ["EN 12899"],
        features: [
          "Haute visibilité",
          "Réutilisable",
          "50m de ruban",
          "Support inclus",
        ],
        category: "signalisation",
        aiRecommended: true,
        aiReason: "Améliorer signalisation Zone C",
        confidence: 78,
      },
      {
        id: "sign3",
        name: "Marquage au sol",
        description: "Bandes adhésives pour circulation et zones",
        image:
          "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=200&fit=crop",
        certifications: ["EN 1436"],
        features: [
          "Antidérapant",
          "Haute adhérence",
          "50mm x 33m",
          "Plusieurs couleurs",
        ],
        category: "signalisation",
        aiRecommended: false,
      },
      {
        id: "sign4",
        name: "Signalétique évacuation",
        description: "Panneaux lumineux issue de secours",
        image:
          "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=300&h=200&fit=crop",
        certifications: ["EN 1838", "NF X08-003"],
        features: [
          "LED basse conso",
          "Autonomie 3h",
          "Pictogramme normalisé",
          "Installation murale",
        ],
        category: "signalisation",
        aiRecommended: false,
      },
    ],
  };

  // AI Recommendations (top priority items)
  const aiRecommendations = [
    {
      id: "epi1",
      name: "Gants de protection chimique renforcés",
      reason: "Suite aux 3 incidents chimiques de ce mois",
      confidence: 92,
      category: "epi",
      linkedAction: "Plan d'Action #2",
    },
    {
      id: "sec1",
      name: "Détecteur de gaz portable",
      reason: "Requis pour Plan d'Action #2 - Formation port EPI Zone C",
      confidence: 95,
      category: "securite",
      linkedAction: "Plan d'Action #2",
    },
    {
      id: "ergo3",
      name: "Aide à la manutention",
      reason: "Prévention des blessures de manutention - Analyse de risques",
      confidence: 90,
      category: "ergonomie",
      linkedAction: null,
    },
  ];

  // Incidents mock data
  const incidentsData = [
    {
      id: "INC-001",
      date: "2025-10-15",
      time: "14:30",
      location: "Atelier A - Zone 3",
      severity: "critical" as const,
      category: "Chute",
      description: "Chute d'un employé depuis une échelle",
      reporter: "Marie Dubois",
      status: "action_plan_created" as const,
      linkedActionPlanId: "AP-124",
      affectedPersons: 1,
      witnesses: ["Jean Martin", "Sophie Laurent"],
      aiAnalysis: {
        rootCause: "Échelle non sécurisée, absence de formation",
        recommendedActions: [
          "Formation travail en hauteur",
          "Inspection échelles",
        ],
        similarIncidents: ["INC-045", "INC-067"],
        preventiveMeasures: [
          "Signalétique zones travail en hauteur",
          "EPI obligatoire",
        ],
      },
    },
    {
      id: "INC-002",
      date: "2025-10-16",
      time: "09:15",
      location: "Zone stockage chimique",
      severity: "moderate" as const,
      category: "Exposition chimique",
      description: "Fuite mineure de produit chimique détectée",
      reporter: "Jean Martin",
      status: "investigating" as const,
      affectedPersons: 0,
      witnesses: ["Pierre Durand"],
      aiAnalysis: {
        rootCause: "Conteneur défectueux",
        recommendedActions: [
          "Vérification de tous les conteneurs",
          "Mise à jour des procédures",
        ],
        similarIncidents: ["INC-023"],
        preventiveMeasures: [
          "Inspection régulière",
          "Formation manipulation produits",
        ],
      },
    },
    {
      id: "INC-003",
      date: "2025-10-17",
      time: "16:45",
      location: "Atelier B - Ligne 2",
      severity: "minor" as const,
      category: "Ergonomie",
      description: "Plainte de douleur lombaire suite à manutention répétitive",
      reporter: "Sophie Laurent",
      status: "resolved" as const,
      affectedPersons: 1,
      witnesses: [],
      aiAnalysis: {
        rootCause: "Gestes répétitifs sans équipement adapté",
        recommendedActions: [
          "Formation gestes et postures",
          "Équipement ergonomique",
        ],
        similarIncidents: ["INC-012", "INC-034"],
        preventiveMeasures: ["Rotation des tâches", "Ceinture lombaire"],
      },
    },
  ];

  // QR Codes mock data
  const qrCodesData = [
    {
      id: "QR-001",
      location: "Atelier A - Zone 3",
      code: "SAHTEE-QR-ATELIER-A3",
      deepLink:
        "/dashboard?module=actions&view=incidents&qr=QR-001&action=declare",
      createdDate: "2025-10-01",
      scannedCount: 12,
      lastScanned: "2025-10-15",
      active: true,
    },
    {
      id: "QR-002",
      location: "Zone stockage chimique",
      code: "SAHTEE-QR-STOCKAGE-CHIM",
      deepLink:
        "/dashboard?module=actions&view=incidents&qr=QR-002&action=declare",
      createdDate: "2025-10-01",
      scannedCount: 8,
      lastScanned: "2025-10-16",
      active: true,
    },
    {
      id: "QR-003",
      location: "Atelier B - Ligne 2",
      code: "SAHTEE-QR-ATELIER-B2",
      deepLink:
        "/dashboard?module=actions&view=incidents&qr=QR-003&action=declare",
      createdDate: "2025-10-01",
      scannedCount: 5,
      lastScanned: "2025-10-10",
      active: true,
    },
  ];

  // Scheduler mock data
  const scheduledActions = [
    {
      id: "AP-001",
      title: "Formation sécurité Zone A",
      assignee: "Marie Dubois",
      priority: "high",
      urgency: "high",
      startDate: "2025-10-20",
      endDate: "2025-10-22",
      duration: 3,
      progress: 0,
      dependencies: [],
      resourceLoad: "medium",
    },
    {
      id: "AP-002",
      title: "Audit équipements ergonomiques",
      assignee: "Jean Martin",
      priority: "medium",
      urgency: "low",
      startDate: "2025-10-21",
      endDate: "2025-10-23",
      duration: 3,
      progress: 25,
      dependencies: [],
      resourceLoad: "low",
    },
    {
      id: "AP-003",
      title: "Installation nouveaux EPI",
      assignee: "Sophie Laurent",
      priority: "high",
      urgency: "medium",
      startDate: "2025-10-22",
      endDate: "2025-10-25",
      duration: 4,
      progress: 0,
      dependencies: ["AP-001"],
      resourceLoad: "high",
    },
    {
      id: "AP-004",
      title: "Mise à jour documentation sécurité",
      assignee: "Pierre Moreau",
      priority: "low",
      urgency: "low",
      startDate: "2025-10-23",
      endDate: "2025-10-26",
      duration: 4,
      progress: 10,
      dependencies: [],
      resourceLoad: "low",
    },
  ];

  const teamResources = [
    {
      id: "user1",
      name: "Marie Dubois",
      role: "Responsable SST",
      availability: 80,
      currentLoad: 65,
      assignedActions: 3,
      capacity: "normal",
      skills: ["Formation", "Audit", "Ergonomie"],
    },
    {
      id: "user2",
      name: "Jean Martin",
      role: "Technicien Sécurité",
      availability: 100,
      currentLoad: 45,
      assignedActions: 2,
      capacity: "available",
      skills: ["Audit", "EPI", "Signalisation"],
    },
    {
      id: "user3",
      name: "Sophie Laurent",
      role: "Coordinatrice",
      availability: 75,
      currentLoad: 85,
      assignedActions: 4,
      capacity: "overloaded",
      skills: ["Formation", "Documentation", "Gestion"],
    },
    {
      id: "user4",
      name: "Pierre Moreau",
      role: "Assistant",
      availability: 100,
      currentLoad: 30,
      assignedActions: 1,
      capacity: "available",
      skills: ["Documentation", "Support"],
    },
  ];

  const aiSuggestions = [
    {
      id: "sug1",
      type: "optimization",
      priority: "high",
      title: "Redistribution de charge recommandée",
      description:
        "Sophie Laurent est en surcharge (85%). Recommandation: Réassigner AP-124 à Jean Martin.",
      impact: "+15% efficacité équipe",
      confidence: 92,
    },
    {
      id: "sug2",
      type: "conflict",
      priority: "medium",
      title: "Conflit de ressources détecté",
      description:
        "Marie Dubois a 2 actions planifiées en même temps le 22/10.",
      impact: "Risque de retard",
      confidence: 88,
    },
    {
      id: "sug3",
      type: "efficiency",
      priority: "low",
      title: "Optimisation des dépendances",
      description:
        "AP-003 peut démarrer 1 jour plus tôt si AP-001 est accéléré.",
      impact: "-2 jours délai global",
      confidence: 75,
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

  const getTrainingCategoryColor = (category: string) => {
    switch (category) {
      case "Ergonomie":
        return "bg-secondary text-primary";
      case "Chimique":
        return "bg-orange-100 text-orange-800";
      case "Machines":
        return "bg-green-100 text-green-800";
      case "Psychosocial":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrainingLevelColor = (level: string) => {
    switch (level) {
      case "Débutant":
        return "bg-green-50 text-green-700";
      case "Intermédiaire":
        return "bg-yellow-50 text-yellow-700";
      case "Avancé":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "severe":
        return "bg-orange-100 text-orange-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "minor":
        return "bg-secondary text-primary";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "critical":
        return "Critique";
      case "severe":
        return "Grave";
      case "moderate":
        return "Modérée";
      case "minor":
        return "Mineure";
      default:
        return severity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "action_plan_created":
        return "bg-secondary text-primary";
      case "investigating":
        return "bg-yellow-100 text-yellow-800";
      case "reported":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "resolved":
        return "Résolu";
      case "action_plan_created":
        return "Plan d'action créé";
      case "investigating":
        return "En investigation";
      case "reported":
        return "Signalé";
      default:
        return status;
    }
  };

  // Scheduler helper functions
  const getSchedulerPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-primary";
      default:
        return "bg-gray-500";
    }
  };

  const getCapacityColor = (capacity: string) => {
    switch (capacity) {
      case "available":
        return "bg-green-100 text-green-800";
      case "normal":
        return "bg-secondary text-primary";
      case "overloaded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWeekDates = (weekOffset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return `${startOfWeek.toLocaleDateString(
      "fr-FR"
    )} - ${endOfWeek.toLocaleDateString("fr-FR")}`;
  };

  const isActionOnDay = (action: any, dayIndex: number, weekOffset: number) => {
    // Simplified logic - in real app would check actual dates
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

    const actionStart = new Date(action.startDate);
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);

    const actionEnd = new Date(action.endDate);

    return dayDate >= actionStart && dayDate <= actionEnd;
  };

  const SchedulerActionCard = ({ action }: { action: any }) => (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm">{action.title}</h4>
            <Badge
              className={`${getSchedulerPriorityColor(
                action.priority
              )} text-white`}
              size="sm"
            >
              {action.priority === "high" && "Haute"}
              {action.priority === "medium" && "Moyenne"}
              {action.priority === "low" && "Basse"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <User className="w-3 h-3" />
            <span>{action.assignee}</span>
          </div>
          {action.progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progression</span>
                <span>{action.progress}%</span>
              </div>
              <Progress value={action.progress} className="h-1.5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CAPA Room</h1>
            <p className="text-sm text-gray-600 mt-1">
              Plans hiérarchisés par priorité. Actions cartographiées et suivies
              par cases cochées.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Bot className="w-4 h-4 mr-2" />
              Suggestions IA
            </Button>
            <Button variant="outline" size="sm">
              <QrCode className="w-4 h-4 mr-2" />
              Générer QR
            </Button>
            <Button className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Plan
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="bg-white border-b border-gray-200">
          <TabsList className="w-full justify-start px-6 bg-transparent h-auto p-0">
            <TabsTrigger
              value="actions"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[var(--sahtee-blue-primary)] rounded-none px-6 py-4"
            >
              <Target className="w-4 h-4 mr-2" />
              Plans d'Action
            </TabsTrigger>
            <TabsTrigger
              value="training"
              className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 rounded-none px-6 py-4"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Formation
            </TabsTrigger>
            <TabsTrigger
              value="equipment"
              className="data-[state=active]:border-b-2 data-[state=active]:border-orange-600 rounded-none px-6 py-4"
            >
              <Shield className="w-4 h-4 mr-2" />
              Équipements
            </TabsTrigger>
            <TabsTrigger
              value="incidents"
              className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none px-6 py-4"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Incidents
            </TabsTrigger>
            <TabsTrigger
              value="scheduler"
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-6 py-4"
            >
              <Bot className="w-4 h-4 mr-2" />
              Planification IA
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* Actions Tab - Complete content from ActionPlans.tsx */}
          <TabsContent value="actions">
            {/* Stats Cards */}
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

            {/* View Toggle and Filters */}
            <div className="flex items-center justify-end gap-4 mb-6">
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
            </div>

            {/* Kanban or List View */}
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
                              <div className="font-medium">
                                {action.progress}%
                              </div>
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
          </TabsContent>

          {/* Training Tab - Complete Implementation */}
          <TabsContent value="training">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Formations en cours
                        </p>
                        <p className="text-3xl font-bold text-[var(--sahtee-blue-primary)]">
                          {
                            myTrainings.filter((t) => t.status === "En cours")
                              .length
                          }
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-[var(--sahtee-blue-primary)]" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Formations terminées
                        </p>
                        <p className="text-3xl font-bold text-green-500">
                          {
                            myTrainings.filter((t) => t.status === "Terminé")
                              .length
                          }
                        </p>
                      </div>
                      <Award className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Heures de formation
                        </p>
                        <p className="text-3xl font-bold text-[var(--sahtee-blue-secondary)]">
                          5h 45min
                        </p>
                      </div>
                      <BookOpen className="w-8 h-8 text-[var(--sahtee-blue-secondary)]" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Training Tabs */}
              <Tabs
                value={trainingTab}
                onValueChange={setTrainingTab}
                className="w-full"
              >
                <TabsList>
                  <TabsTrigger value="catalog">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Catalogue
                  </TabsTrigger>
                  <TabsTrigger value="mytraining">
                    <Play className="w-4 h-4 mr-2" />
                    Mes Formations
                  </TabsTrigger>
                  <TabsTrigger value="certificates">
                    <Award className="w-4 h-4 mr-2" />
                    Certifications
                  </TabsTrigger>
                </TabsList>

                {/* Catalog Tab */}
                <TabsContent value="catalog">
                  <div className="space-y-6">
                    {/* Search and Filters */}
                    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher une formation..."
                          className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtres
                      </Button>
                    </div>

                    {/* Courses Grid */}
                    <div className="grid lg:grid-cols-2 gap-6">
                      {courses.map((course) => (
                        <Card
                          key={course.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-lg">
                                    {course.title}
                                  </h3>
                                  {course.mandatory && (
                                    <Badge className="bg-red-100 text-red-800">
                                      Obligatoire
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm">
                                  {course.description}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Badge
                                  className={getTrainingCategoryColor(
                                    course.category
                                  )}
                                >
                                  {course.category}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={getTrainingLevelColor(
                                    course.level
                                  )}
                                >
                                  {course.level}
                                </Badge>
                                {course.certifiable && (
                                  <Badge
                                    variant="outline"
                                    className="border-[var(--sahtee-blue-primary)] text-[var(--sahtee-blue-primary)]"
                                  >
                                    <Award className="w-3 h-3 mr-1" />
                                    Certifiant
                                  </Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-gray-400" />
                                  <span>{course.modules} modules</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-yellow-400" />
                                  <span>{course.rating} / 5</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span>{course.enrolled} inscrits</span>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Aperçu
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1 bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
                                >
                                  S'inscrire
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* My Trainings Tab */}
                <TabsContent value="mytraining">
                  <div className="space-y-4">
                    {myTrainings.map((training) => {
                      const course = courses.find(
                        (c) => c.id === training.courseId
                      );
                      if (!course) return null;

                      return (
                        <Card key={training.id}>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-6">
                              <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={course.thumbnail}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold">
                                      {course.title}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {course.category}
                                    </p>
                                  </div>
                                  <Badge
                                    className={
                                      training.status === "Terminé"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-secondary text-primary"
                                    }
                                  >
                                    {training.status}
                                  </Badge>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Progression</span>
                                    <span>
                                      {training.progress}% (
                                      {training.completedModules}/
                                      {training.totalModules} modules)
                                    </span>
                                  </div>
                                  <Progress
                                    value={training.progress}
                                    className="h-2"
                                  />
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                  <span className="text-sm text-gray-500">
                                    Dernier accès: {training.lastAccessed}
                                  </span>
                                  <div className="flex gap-2">
                                    {training.certificateEarned && (
                                      <Button size="sm" variant="outline">
                                        <Download className="w-4 h-4 mr-2" />
                                        Certificat
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
                                    >
                                      <Play className="w-4 h-4 mr-2" />
                                      {training.status === "Terminé"
                                        ? "Revoir"
                                        : "Continuer"}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* Certificates Tab */}
                <TabsContent value="certificates">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mes certifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {certificates.map((cert) => (
                          <div
                            key={cert.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-[var(--sahtee-neutral)] rounded-full p-3">
                                <Award className="w-6 h-6 text-[var(--sahtee-blue-primary)]" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {cert.courseName}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  N° {cert.certificateNumber}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Délivré le {cert.issuedDate} • Expire le{" "}
                                  {cert.expiryDate}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  cert.status === "Valide"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-orange-100 text-orange-800"
                                }
                              >
                                {cert.status}
                              </Badge>
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {/* Equipment Tab - Complete Implementation */}
          <TabsContent value="equipment">
            <div className="space-y-6">
              {/* AI Recommendations Section */}
              <div className="bg-gradient-to-r from-purple-50 to-secondary border border-purple-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Bot className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Recommandations IA
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Basées sur les incidents récents et les analyses de
                      risques
                    </p>

                    {/* AI Recommendation Cards */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {aiRecommendations.map((rec) => {
                        const equipment = Object.values(equipmentData)
                          .flat()
                          .find((e) => e.id === rec.id);
                        if (!equipment) return null;

                        return (
                          <Card key={rec.id} className="border-purple-300">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <Badge className="bg-purple-600 text-white">
                                    IA: {rec.confidence}% confiance
                                  </Badge>
                                  {rec.linkedAction && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {rec.linkedAction}
                                    </Badge>
                                  )}
                                </div>

                                <div>
                                  <h4 className="font-medium text-sm line-clamp-2">
                                    {equipment.name}
                                  </h4>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {equipment.category === "epi" && "EPI"}
                                    {equipment.category === "ergonomie" &&
                                      "Ergonomie"}
                                    {equipment.category === "securite" &&
                                      "Sécurité"}
                                    {equipment.category === "signalisation" &&
                                      "Signalisation"}
                                  </p>
                                </div>

                                <div className="bg-white p-2 rounded border border-purple-100">
                                  <p className="text-xs text-purple-700 flex items-start gap-1">
                                    <Bot className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>{rec.reason}</span>
                                  </p>
                                </div>

                                <Button
                                  size="sm"
                                  className="w-full bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
                                  onClick={() => {
                                    if (!markedEquipment.includes(rec.id)) {
                                      setMarkedEquipment([
                                        ...markedEquipment,
                                        rec.id,
                                      ]);
                                    }
                                  }}
                                >
                                  {markedEquipment.includes(rec.id) ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Marqué nécessaire
                                    </>
                                  ) : (
                                    "Marquer comme nécessaire"
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Tabs */}
              <Tabs
                value={equipmentCategory}
                onValueChange={(value) => setEquipmentCategory(value as any)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="epi">
                    <Shield className="w-4 h-4 mr-2" />
                    EPI
                  </TabsTrigger>
                  <TabsTrigger value="ergonomie">
                    <Package className="w-4 h-4 mr-2" />
                    Ergonomie
                  </TabsTrigger>
                  <TabsTrigger value="securite">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Sécurité
                  </TabsTrigger>
                  <TabsTrigger value="signalisation">
                    <Target className="w-4 h-4 mr-2" />
                    Signalisation
                  </TabsTrigger>
                </TabsList>

                {/* EPI Equipment */}
                <TabsContent value="epi">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {equipmentData.epi.map((equipment) => (
                      <Card
                        key={equipment.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                          <img
                            src={equipment.image}
                            alt={equipment.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-sm line-clamp-2">
                                  {equipment.name}
                                </h4>
                                {equipment.aiRecommended && (
                                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                                    IA
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {equipment.description}
                              </p>
                            </div>

                            {/* Certifications */}
                            <div className="flex flex-wrap gap-1">
                              {equipment.certifications.map((cert, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {cert}
                                </Badge>
                              ))}
                            </div>

                            {/* Features */}
                            <ul className="text-xs space-y-1">
                              {equipment.features
                                .slice(0, 3)
                                .map((feature, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-1"
                                  >
                                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                            </ul>

                            {/* AI Reason if applicable */}
                            {equipment.aiReason && (
                              <div className="bg-purple-50 p-2 rounded">
                                <p className="text-xs text-purple-700 flex items-start gap-1">
                                  <Bot className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span>{equipment.aiReason}</span>
                                </p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Détails
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1"
                                variant={
                                  markedEquipment.includes(equipment.id)
                                    ? "secondary"
                                    : "default"
                                }
                                onClick={() => {
                                  if (markedEquipment.includes(equipment.id)) {
                                    setMarkedEquipment(
                                      markedEquipment.filter(
                                        (id) => id !== equipment.id
                                      )
                                    );
                                  } else {
                                    setMarkedEquipment([
                                      ...markedEquipment,
                                      equipment.id,
                                    ]);
                                  }
                                }}
                              >
                                {markedEquipment.includes(equipment.id) ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Nécessaire
                                  </>
                                ) : (
                                  "Marquer"
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Ergonomic Equipment */}
                <TabsContent value="ergonomie">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {equipmentData.ergonomie.map((equipment) => (
                      <Card
                        key={equipment.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                          <img
                            src={equipment.image}
                            alt={equipment.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-sm line-clamp-2">
                                  {equipment.name}
                                </h4>
                                {equipment.aiRecommended && (
                                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                                    IA
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {equipment.description}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {equipment.certifications.map((cert, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {cert}
                                </Badge>
                              ))}
                            </div>

                            <ul className="text-xs space-y-1">
                              {equipment.features
                                .slice(0, 3)
                                .map((feature, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-1"
                                  >
                                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                            </ul>

                            {equipment.aiReason && (
                              <div className="bg-purple-50 p-2 rounded">
                                <p className="text-xs text-purple-700 flex items-start gap-1">
                                  <Bot className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span>{equipment.aiReason}</span>
                                </p>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Détails
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1"
                                variant={
                                  markedEquipment.includes(equipment.id)
                                    ? "secondary"
                                    : "default"
                                }
                                onClick={() => {
                                  if (markedEquipment.includes(equipment.id)) {
                                    setMarkedEquipment(
                                      markedEquipment.filter(
                                        (id) => id !== equipment.id
                                      )
                                    );
                                  } else {
                                    setMarkedEquipment([
                                      ...markedEquipment,
                                      equipment.id,
                                    ]);
                                  }
                                }}
                              >
                                {markedEquipment.includes(equipment.id) ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Nécessaire
                                  </>
                                ) : (
                                  "Marquer"
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Safety Equipment */}
                <TabsContent value="securite">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {equipmentData.securite.map((equipment) => (
                      <Card
                        key={equipment.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                          <img
                            src={equipment.image}
                            alt={equipment.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-sm line-clamp-2">
                                  {equipment.name}
                                </h4>
                                {equipment.aiRecommended && (
                                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                                    IA
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {equipment.description}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {equipment.certifications.map((cert, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {cert}
                                </Badge>
                              ))}
                            </div>

                            <ul className="text-xs space-y-1">
                              {equipment.features
                                .slice(0, 3)
                                .map((feature, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-1"
                                  >
                                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                            </ul>

                            {equipment.aiReason && (
                              <div className="bg-purple-50 p-2 rounded">
                                <p className="text-xs text-purple-700 flex items-start gap-1">
                                  <Bot className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span>{equipment.aiReason}</span>
                                </p>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Détails
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1"
                                variant={
                                  markedEquipment.includes(equipment.id)
                                    ? "secondary"
                                    : "default"
                                }
                                onClick={() => {
                                  if (markedEquipment.includes(equipment.id)) {
                                    setMarkedEquipment(
                                      markedEquipment.filter(
                                        (id) => id !== equipment.id
                                      )
                                    );
                                  } else {
                                    setMarkedEquipment([
                                      ...markedEquipment,
                                      equipment.id,
                                    ]);
                                  }
                                }}
                              >
                                {markedEquipment.includes(equipment.id) ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Nécessaire
                                  </>
                                ) : (
                                  "Marquer"
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Signage Equipment */}
                <TabsContent value="signalisation">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {equipmentData.signalisation.map((equipment) => (
                      <Card
                        key={equipment.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                          <img
                            src={equipment.image}
                            alt={equipment.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-sm line-clamp-2">
                                  {equipment.name}
                                </h4>
                                {equipment.aiRecommended && (
                                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                                    IA
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {equipment.description}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {equipment.certifications.map((cert, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {cert}
                                </Badge>
                              ))}
                            </div>

                            <ul className="text-xs space-y-1">
                              {equipment.features
                                .slice(0, 3)
                                .map((feature, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-1"
                                  >
                                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                            </ul>

                            {equipment.aiReason && (
                              <div className="bg-purple-50 p-2 rounded">
                                <p className="text-xs text-purple-700 flex items-start gap-1">
                                  <Bot className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span>{equipment.aiReason}</span>
                                </p>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Détails
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1"
                                variant={
                                  markedEquipment.includes(equipment.id)
                                    ? "secondary"
                                    : "default"
                                }
                                onClick={() => {
                                  if (markedEquipment.includes(equipment.id)) {
                                    setMarkedEquipment(
                                      markedEquipment.filter(
                                        (id) => id !== equipment.id
                                      )
                                    );
                                  } else {
                                    setMarkedEquipment([
                                      ...markedEquipment,
                                      equipment.id,
                                    ]);
                                  }
                                }}
                              >
                                {markedEquipment.includes(equipment.id) ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Nécessaire
                                  </>
                                ) : (
                                  "Marquer"
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {/* Incidents Tab - Complete Implementation */}
          <TabsContent value="incidents">
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total Incidents
                        </p>
                        <p className="text-3xl font-bold text-[var(--sahtee-blue-primary)]">
                          {incidentsData.length}
                        </p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-[var(--sahtee-blue-primary)]" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Critiques</p>
                        <p className="text-3xl font-bold text-red-500">
                          {
                            incidentsData.filter(
                              (i) => i.severity === "critical"
                            ).length
                          }
                        </p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          En Investigation
                        </p>
                        <p className="text-3xl font-bold text-yellow-500">
                          {
                            incidentsData.filter(
                              (i) => i.status === "investigating"
                            ).length
                          }
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Résolus</p>
                        <p className="text-3xl font-bold text-green-500">
                          {
                            incidentsData.filter((i) => i.status === "resolved")
                              .length
                          }
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs
                value={incidentsTab}
                onValueChange={setIncidentsTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="declarations">
                    <FileText className="w-4 h-4 mr-2" />
                    Déclarations
                  </TabsTrigger>
                  <TabsTrigger value="qrcodes">
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Codes
                  </TabsTrigger>
                  <TabsTrigger value="analysis">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analyses
                  </TabsTrigger>
                </TabsList>

                {/* Declarations Tab */}
                <TabsContent value="declarations">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Rechercher..."
                            className="pl-10 w-64"
                          />
                        </div>
                        <Button variant="outline" size="sm">
                          <Filter className="w-4 h-4 mr-2" />
                          Filtres
                        </Button>
                      </div>
                      <Button
                        onClick={() => setShowIncidentModal(true)}
                        className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Déclarer un Incident
                      </Button>
                    </div>

                    {/* Incidents List */}
                    <div className="space-y-3">
                      {incidentsData.map((incident) => (
                        <Card
                          key={incident.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold text-lg">
                                      {incident.id}
                                    </h4>
                                    <Badge
                                      className={getSeverityColor(
                                        incident.severity
                                      )}
                                    >
                                      {getSeverityLabel(incident.severity)}
                                    </Badge>
                                    <Badge
                                      className={getStatusColor(
                                        incident.status
                                      )}
                                    >
                                      {getStatusLabel(incident.status)}
                                    </Badge>
                                    {incident.linkedActionPlanId && (
                                      <Badge
                                        variant="outline"
                                        className="text-primary border-primary"
                                      >
                                        <Target className="w-3 h-3 mr-1" />
                                        {incident.linkedActionPlanId}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-gray-600 mb-2">
                                    {incident.description}
                                  </p>
                                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {incident.date} à {incident.time}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {incident.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <User className="w-4 h-4" />
                                      Déclaré par {incident.reporter}
                                    </div>
                                    {incident.affectedPersons > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {incident.affectedPersons} personne(s)
                                        affectée(s)
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Détails
                                </Button>
                              </div>

                              {/* AI Analysis */}
                              {incident.aiAnalysis && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                  <div className="flex items-start gap-3">
                                    <Bot className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 space-y-2">
                                      <h5 className="font-semibold text-purple-900">
                                        Analyse IA
                                      </h5>
                                      <div className="text-sm space-y-2">
                                        <div>
                                          <span className="font-medium text-purple-800">
                                            Cause probable:
                                          </span>
                                          <p className="text-purple-700">
                                            {incident.aiAnalysis.rootCause}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-purple-800">
                                            Actions recommandées:
                                          </span>
                                          <ul className="list-disc list-inside text-purple-700">
                                            {incident.aiAnalysis.recommendedActions.map(
                                              (action, idx) => (
                                                <li key={idx}>{action}</li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* QR Codes Tab */}
                <TabsContent value="qrcodes">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">
                          QR Codes actifs
                        </h3>
                        <p className="text-sm text-gray-600">
                          Scannez pour déclarer un incident à un emplacement
                          spécifique
                        </p>
                      </div>
                      <Button className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]">
                        <Plus className="w-4 h-4 mr-2" />
                        Générer Nouveau QR Code
                      </Button>
                    </div>

                    {/* QR Codes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {qrCodesData.map((qr) => (
                        <Card
                          key={qr.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              {/* QR Code Visual Placeholder */}
                              <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center aspect-square">
                                <QrCode className="w-32 h-32 text-gray-400" />
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold">
                                    {qr.location}
                                  </h4>
                                  <Badge
                                    variant={
                                      qr.active ? "default" : "secondary"
                                    }
                                  >
                                    {qr.active ? "Actif" : "Inactif"}
                                  </Badge>
                                </div>

                                <div className="text-sm text-gray-600 space-y-1">
                                  <p className="font-mono text-xs bg-gray-50 p-2 rounded">
                                    {qr.code}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span>Créé le:</span>
                                    <span>{qr.createdDate}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>Scans:</span>
                                    <span className="font-semibold text-[var(--sahtee-blue-primary)]">
                                      {qr.scannedCount}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>Dernier scan:</span>
                                    <span>{qr.lastScanned}</span>
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Télécharger
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Stats
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Analysis Tab */}
                <TabsContent value="analysis">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Analyse des Tendances</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* By Category */}
                          <div>
                            <h4 className="font-semibold mb-3">
                              Incidents par Catégorie
                            </h4>
                            <div className="space-y-2">
                              {[
                                "Chute",
                                "Exposition chimique",
                                "Ergonomie",
                              ].map((category) => {
                                const count = incidentsData.filter(
                                  (i) => i.category === category
                                ).length;
                                const percentage = (
                                  (count / incidentsData.length) *
                                  100
                                ).toFixed(0);
                                return (
                                  <div key={category} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>{category}</span>
                                      <span className="font-medium">
                                        {count} ({percentage}%)
                                      </span>
                                    </div>
                                    <Progress value={Number(percentage)} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* By Location */}
                          <div>
                            <h4 className="font-semibold mb-3">
                              Points Chauds par Zone
                            </h4>
                            <div className="space-y-2">
                              {Array.from(
                                new Set(incidentsData.map((i) => i.location))
                              ).map((location) => {
                                const count = incidentsData.filter(
                                  (i) => i.location === location
                                ).length;
                                return (
                                  <div
                                    key={location}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm">
                                        {location}
                                      </span>
                                    </div>
                                    <Badge variant="secondary">{count}</Badge>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* AI Insights */}
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Bot className="w-5 h-5 text-purple-600 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-purple-900 mb-2">
                                  Recommandations IA
                                </h4>
                                <ul className="text-sm text-purple-700 space-y-2 list-disc list-inside">
                                  <li>
                                    Augmentation des incidents de chute -
                                    Renforcer la formation travail en hauteur
                                  </li>
                                  <li>
                                    Zone Atelier A nécessite une inspection
                                    approfondie
                                  </li>
                                  <li>
                                    Tendance à la hausse des TMS - Évaluation
                                    ergonomique recommandée
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Incident Declaration Modal */}
            <Dialog
              open={showIncidentModal}
              onOpenChange={setShowIncidentModal}
            >
              <DialogContent size="xl">
                <DialogHeader>
                  <DialogTitle>
                    Déclaration d'Incident - Formulaire 1
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div key={step} className="flex items-center flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step <= incidentFormStep
                              ? "bg-[var(--sahtee-blue-primary)] text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {step}
                        </div>
                        {step < 5 && (
                          <div
                            className={`h-1 flex-1 mx-2 ${
                              step < incidentFormStep
                                ? "bg-[var(--sahtee-blue-primary)]"
                                : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Step Content */}
                  <div className="min-h-[400px]">
                    {/* Step 1: Basic Information */}
                    {incidentFormStep === 1 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                          Informations de base
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={incidentFormData.date}
                              onChange={(e) =>
                                setIncidentFormData({
                                  ...incidentFormData,
                                  date: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Heure</Label>
                            <Input
                              type="time"
                              value={incidentFormData.time}
                              onChange={(e) =>
                                setIncidentFormData({
                                  ...incidentFormData,
                                  time: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Lieu</Label>
                          <Input
                            value={incidentFormData.location}
                            onChange={(e) =>
                              setIncidentFormData({
                                ...incidentFormData,
                                location: e.target.value,
                              })
                            }
                            placeholder="Ex: Atelier A - Zone 3"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Gravité</Label>
                          <Select
                            value={incidentFormData.severity}
                            onValueChange={(value: any) =>
                              setIncidentFormData({
                                ...incidentFormData,
                                severity: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minor">Mineure</SelectItem>
                              <SelectItem value="moderate">Modérée</SelectItem>
                              <SelectItem value="severe">Grave</SelectItem>
                              <SelectItem value="critical">Critique</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Catégorie</Label>
                          <Select
                            value={incidentFormData.category}
                            onValueChange={(value) =>
                              setIncidentFormData({
                                ...incidentFormData,
                                category: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Chute">Chute</SelectItem>
                              <SelectItem value="Exposition chimique">
                                Exposition chimique
                              </SelectItem>
                              <SelectItem value="Ergonomie">
                                Ergonomie
                              </SelectItem>
                              <SelectItem value="Machine">Machine</SelectItem>
                              <SelectItem value="Autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Details */}
                    {incidentFormStep === 2 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                          Détails de l'incident
                        </h3>
                        <div className="space-y-2">
                          <Label>Description détaillée</Label>
                          <Textarea
                            rows={4}
                            value={incidentFormData.description}
                            onChange={(e) =>
                              setIncidentFormData({
                                ...incidentFormData,
                                description: e.target.value,
                              })
                            }
                            placeholder="Décrivez l'incident en détail..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Personnes affectées</Label>
                          <Input
                            type="number"
                            min="0"
                            value={incidentFormData.affectedPersons}
                            onChange={(e) =>
                              setIncidentFormData({
                                ...incidentFormData,
                                affectedPersons: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Témoins</Label>
                          <div className="space-y-2">
                            {incidentFormData.witnesses.map((witness, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <Input value={witness} disabled />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newWitnesses = [
                                      ...incidentFormData.witnesses,
                                    ];
                                    newWitnesses.splice(idx, 1);
                                    setIncidentFormData({
                                      ...incidentFormData,
                                      witnesses: newWitnesses,
                                    });
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <Input
                                placeholder="Nom du témoin"
                                value={newWitness}
                                onChange={(e) => setNewWitness(e.target.value)}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (newWitness.trim()) {
                                    setIncidentFormData({
                                      ...incidentFormData,
                                      witnesses: [
                                        ...incidentFormData.witnesses,
                                        newWitness,
                                      ],
                                    });
                                    setNewWitness("");
                                  }
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Actions immédiates prises</Label>
                          <Textarea
                            rows={3}
                            value={incidentFormData.immediateActions}
                            onChange={(e) =>
                              setIncidentFormData({
                                ...incidentFormData,
                                immediateActions: e.target.value,
                              })
                            }
                            placeholder="Décrivez les actions prises immédiatement après l'incident..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 3: Evidence */}
                    {incidentFormStep === 3 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Preuves</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-600 mb-2">
                            Glissez-déposez des photos ou cliquez pour
                            sélectionner
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Format: JPG, PNG (Max 5MB par fichier)
                          </p>
                          <Button variant="outline">
                            <Camera className="w-4 h-4 mr-2" />
                            Sélectionner des fichiers
                          </Button>
                        </div>
                        {incidentFormData.photos.length > 0 && (
                          <div className="grid grid-cols-3 gap-4">
                            {incidentFormData.photos.map((photo, idx) => (
                              <div
                                key={idx}
                                className="relative aspect-video bg-gray-100 rounded-lg"
                              >
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => {
                                    const newPhotos = [
                                      ...incidentFormData.photos,
                                    ];
                                    newPhotos.splice(idx, 1);
                                    setIncidentFormData({
                                      ...incidentFormData,
                                      photos: newPhotos,
                                    });
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4: AI Analysis */}
                    {incidentFormStep === 4 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Analyse IA</h3>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Bot className="w-6 h-6 text-purple-600" />
                            <h4 className="font-semibold text-purple-900">
                              Analyse automatique basée sur les informations
                              fournies
                            </h4>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h5 className="font-semibold text-purple-800 mb-1">
                                Cause probable:
                              </h5>
                              <p className="text-sm text-purple-700">
                                Basé sur la catégorie "
                                {incidentFormData.category}" et le lieu "
                                {incidentFormData.location}", l'analyse suggère
                                une inspection des procédures de sécurité.
                              </p>
                            </div>

                            <div>
                              <h5 className="font-semibold text-purple-800 mb-1">
                                Actions recommandées:
                              </h5>
                              <ul className="text-sm text-purple-700 list-disc list-inside space-y-1">
                                <li>
                                  Formation spécifique sur le type d'incident
                                </li>
                                <li>
                                  Inspection des équipements de protection
                                </li>
                                <li>Révision des procédures de sécurité</li>
                              </ul>
                            </div>

                            <div>
                              <h5 className="font-semibold text-purple-800 mb-1">
                                Incidents similaires:
                              </h5>
                              <p className="text-sm text-purple-700">
                                2 incidents similaires identifiés dans les 6
                                derniers mois
                              </p>
                            </div>

                            <div>
                              <h5 className="font-semibold text-purple-800 mb-1">
                                Mesures préventives:
                              </h5>
                              <ul className="text-sm text-purple-700 list-disc list-inside space-y-1">
                                <li>
                                  Installation de signalétique supplémentaire
                                </li>
                                <li>
                                  Équipement de protection individuelle requis
                                </li>
                                <li>Audit de sécurité de la zone</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Review */}
                    {incidentFormStep === 5 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                          Vérification finale
                        </h3>
                        <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                Date:
                              </span>
                              <p className="text-gray-900">
                                {incidentFormData.date}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Heure:
                              </span>
                              <p className="text-gray-900">
                                {incidentFormData.time}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Lieu:
                              </span>
                              <p className="text-gray-900">
                                {incidentFormData.location}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Gravité:
                              </span>
                              <Badge
                                className={getSeverityColor(
                                  incidentFormData.severity
                                )}
                              >
                                {getSeverityLabel(incidentFormData.severity)}
                              </Badge>
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium text-gray-700">
                                Catégorie:
                              </span>
                              <p className="text-gray-900">
                                {incidentFormData.category}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium text-gray-700">
                                Description:
                              </span>
                              <p className="text-gray-900">
                                {incidentFormData.description}
                              </p>
                            </div>
                            {incidentFormData.witnesses.length > 0 && (
                              <div className="col-span-2">
                                <span className="font-medium text-gray-700">
                                  Témoins:
                                </span>
                                <p className="text-gray-900">
                                  {incidentFormData.witnesses.join(", ")}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            Sauvegarder comme brouillon
                          </Button>
                          <Button
                            className="flex-1 bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
                            onClick={() => {
                              setShowIncidentModal(false);
                              setIncidentFormStep(1);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Soumettre la déclaration
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  {incidentFormStep < 5 && (
                    <div className="flex justify-between pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setIncidentFormStep(Math.max(1, incidentFormStep - 1))
                        }
                        disabled={incidentFormStep === 1}
                      >
                        Précédent
                      </Button>
                      <Button
                        onClick={() =>
                          setIncidentFormStep(Math.min(5, incidentFormStep + 1))
                        }
                        className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
                      >
                        Suivant
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Scheduler Tab - AI Planification */}
          <TabsContent value="scheduler">
            <div className="space-y-6">
              {/* AI Scheduling Header */}
              <div className="bg-gradient-to-r from-purple-50 to-secondary border border-purple-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Planification Intelligente IA
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Optimisez automatiquement vos plans d'action avec l'IA
                    </p>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Bot className="w-4 h-4 mr-2" />
                    Générer Planning Automatique
                  </Button>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Actions planifiées
                        </p>
                        <p className="text-3xl font-bold text-[var(--sahtee-blue-primary)]">
                          {scheduledActions.length}
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-[var(--sahtee-blue-primary)]" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">En conflit</p>
                        <p className="text-3xl font-bold text-red-500">1</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Disponibles
                        </p>
                        <p className="text-3xl font-bold text-green-500">2</p>
                      </div>
                      <Users className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Complétées</p>
                        <p className="text-3xl font-bold text-primary">
                          {
                            scheduledActions.filter((a) => a.progress === 100)
                              .length
                          }
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs
                value={schedulerView}
                onValueChange={(value: any) => setSchedulerView(value)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="timeline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="priority">
                    <Target className="w-4 h-4 mr-2" />
                    Matrice de Priorité
                  </TabsTrigger>
                  <TabsTrigger value="resources">
                    <Users className="w-4 h-4 mr-2" />
                    Ressources
                  </TabsTrigger>
                  <TabsTrigger value="suggestions">
                    <Bot className="w-4 h-4 mr-2" />
                    Suggestions IA
                  </TabsTrigger>
                </TabsList>

                {/* Timeline View */}
                <TabsContent value="timeline" className="mt-6">
                  <div className="space-y-4">
                    {/* Week Selector */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedWeek(selectedWeek - 1)}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[200px] text-center">
                          Semaine du {getWeekDates(selectedWeek)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedWeek(selectedWeek + 1)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWeek(0)}
                      >
                        Aujourd'hui
                      </Button>
                    </div>

                    {/* Timeline Grid */}
                    <div className="border rounded-lg overflow-hidden bg-white">
                      {/* Header: Days of week */}
                      <div className="grid grid-cols-8 bg-gray-50 border-b">
                        <div className="p-3 font-medium text-sm">Action</div>
                        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                          (day) => (
                            <div
                              key={day}
                              className="p-3 text-center font-medium text-sm border-l"
                            >
                              {day}
                            </div>
                          )
                        )}
                      </div>

                      {/* Action Rows */}
                      {scheduledActions.map((action) => (
                        <div
                          key={action.id}
                          className="grid grid-cols-8 border-b hover:bg-gray-50"
                        >
                          <div className="p-3 border-r">
                            <div className="text-sm font-medium">
                              {action.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {action.assignee}
                            </div>
                          </div>
                          {/* Timeline bars showing duration */}
                          {Array.from({ length: 7 }).map((_, dayIndex) => (
                            <div
                              key={dayIndex}
                              className="p-1 border-l relative"
                            >
                              {isActionOnDay(
                                action,
                                dayIndex,
                                selectedWeek
                              ) && (
                                <div
                                  className={`h-8 rounded ${getSchedulerPriorityColor(
                                    action.priority
                                  )}
                                    flex items-center justify-center text-xs font-medium text-white`}
                                >
                                  {action.progress}%
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Priority Matrix View */}
                <TabsContent value="priority" className="mt-6">
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      Matrice d'Eisenhower: Organisez vos actions par urgence et
                      importance
                    </div>

                    {/* 2x2 Matrix */}
                    <div className="grid grid-cols-2 gap-4 h-[600px]">
                      {/* Quadrant 1: Urgent & Important (Critical) */}
                      <Card className="bg-red-50 border-red-200">
                        <CardHeader>
                          <CardTitle className="text-red-700">
                            Urgent et Important
                          </CardTitle>
                          <p className="text-sm text-red-600">
                            À faire immédiatement
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                          {scheduledActions
                            .filter(
                              (a) =>
                                a.priority === "high" && a.urgency === "high"
                            )
                            .map((action) => (
                              <SchedulerActionCard
                                key={action.id}
                                action={action}
                              />
                            ))}
                        </CardContent>
                      </Card>

                      {/* Quadrant 2: Not Urgent but Important */}
                      <Card className="bg-secondary border-secondary">
                        <CardHeader>
                          <CardTitle className="text-primary">
                            Important mais non urgent
                          </CardTitle>
                          <p className="text-sm text-primary">À planifier</p>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                          {scheduledActions
                            .filter(
                              (a) =>
                                a.priority === "high" && a.urgency !== "high"
                            )
                            .map((action) => (
                              <SchedulerActionCard
                                key={action.id}
                                action={action}
                              />
                            ))}
                        </CardContent>
                      </Card>

                      {/* Quadrant 3: Urgent but Not Important */}
                      <Card className="bg-yellow-50 border-yellow-200">
                        <CardHeader>
                          <CardTitle className="text-yellow-700">
                            Urgent mais moins important
                          </CardTitle>
                          <p className="text-sm text-yellow-600">
                            À déléguer si possible
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                          {scheduledActions
                            .filter(
                              (a) =>
                                a.priority !== "high" && a.urgency === "high"
                            )
                            .map((action) => (
                              <SchedulerActionCard
                                key={action.id}
                                action={action}
                              />
                            ))}
                        </CardContent>
                      </Card>

                      {/* Quadrant 4: Neither Urgent nor Important */}
                      <Card className="bg-gray-50 border-gray-200">
                        <CardHeader>
                          <CardTitle className="text-gray-700">
                            Ni urgent ni important
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            À faire plus tard
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                          {scheduledActions
                            .filter(
                              (a) =>
                                a.priority !== "high" && a.urgency !== "high"
                            )
                            .map((action) => (
                              <SchedulerActionCard
                                key={action.id}
                                action={action}
                              />
                            ))}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Resources View */}
                <TabsContent value="resources" className="mt-6">
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      Vue d'ensemble de la charge de travail et disponibilité de
                      l'équipe
                    </div>

                    {/* Resource Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {teamResources.map((resource) => (
                        <Card key={resource.id}>
                          <CardHeader>
                            <CardTitle className="text-base">
                              {resource.name}
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                              {resource.role}
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Charge actuelle</span>
                                  <span className="font-medium">
                                    {resource.currentLoad}%
                                  </span>
                                </div>
                                <Progress
                                  value={resource.currentLoad}
                                  className="h-2"
                                />
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <span>Actions assignées:</span>
                                <Badge>{resource.assignedActions}</Badge>
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <span>Capacité:</span>
                                <Badge
                                  className={getCapacityColor(
                                    resource.capacity
                                  )}
                                >
                                  {resource.capacity === "available" &&
                                    "Disponible"}
                                  {resource.capacity === "normal" && "Normal"}
                                  {resource.capacity === "overloaded" &&
                                    "Surchargé"}
                                </Badge>
                              </div>

                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Compétences:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {resource.skills.map((skill) => (
                                    <Badge
                                      key={skill}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* AI Suggestions View */}
                <TabsContent value="suggestions" className="mt-6">
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      Recommandations intelligentes pour optimiser votre
                      planification
                    </div>

                    {aiSuggestions.map((suggestion) => (
                      <Card key={suggestion.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  suggestion.priority === "high"
                                    ? "bg-red-100"
                                    : suggestion.priority === "medium"
                                    ? "bg-yellow-100"
                                    : "bg-secondary"
                                }`}
                              >
                                <Bot
                                  className={`w-5 h-5 ${
                                    suggestion.priority === "high"
                                      ? "text-red-600"
                                      : suggestion.priority === "medium"
                                      ? "text-yellow-600"
                                      : "text-primary"
                                  }`}
                                />
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  {suggestion.title}
                                </CardTitle>
                                <p className="text-sm text-gray-600 mt-1">
                                  {suggestion.description}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={
                                suggestion.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : suggestion.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-secondary text-primary"
                              }
                            >
                              {suggestion.priority === "high" &&
                                "Priorité haute"}
                              {suggestion.priority === "medium" &&
                                "Priorité moyenne"}
                              {suggestion.priority === "low" &&
                                "Priorité basse"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                Impact estimé:
                              </span>
                              <span className="font-medium text-green-600">
                                {suggestion.impact}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                Confiance IA:
                              </span>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={suggestion.confidence}
                                  className="w-24 h-2"
                                />
                                <span className="font-medium">
                                  {suggestion.confidence}%
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)]"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Appliquer la suggestion
                              </Button>
                              <Button size="sm" variant="outline">
                                Ignorer
                              </Button>
                              <Button size="sm" variant="outline">
                                Modifier
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
