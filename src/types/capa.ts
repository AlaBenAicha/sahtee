// Action Plan Types
export interface ActionPlan {
  // Existing fields
  id: string;
  title: string;
  description: string;
  priority: "Critique" | "Haute" | "Moyenne" | "Basse";
  status: "todo" | "inprogress" | "done" | "blocked";
  assignee: string;
  dueDate: string;
  progress: number;
  category: "Correctif" | "Préventif";
  risk: string;

  // NEW fields for integration
  linkedTrainingIds: string[];
  linkedEquipmentIds: string[];
  sourceIncidentId?: string;
  aiGenerated: boolean;
  aiConfidence: number;
  checklistItems: ChecklistItem[];
  completionProof?: CompletionProof;
}

export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  completedBy?: string;
  completedDate?: string;
}

export interface CompletionProof {
  photos: string[];
  documents: string[];
  verifiedBy: string;
  verifiedDate: string;
}

// Training Types
export interface TrainingPlan {
  id: string;
  courseId: string;
  courseName: string;
  assignedEmployees: string[];
  dueDate: string;
  priority: "Obligatoire" | "Recommandée" | "Optionnelle";
  linkedActionPlanId?: string;
  source: "manual" | "ai_recommendation" | "incident_derived";
  completionStatus: TrainingCompletionStatus;
}

export interface TrainingCompletionStatus {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
}

// Equipment Types
export interface EquipmentRecommendation {
  id: string;
  name: string;
  category: "EPI" | "Ergonomie" | "Sécurité" | "Signalisation";
  description: string;
  certifications: string[];
  features: string[];
  aiReason: string;
  linkedActionPlanId?: string;
  linkedIncidentId?: string;
  priority: "Urgent" | "Important" | "Suggéré";
  status: "pending" | "ordered" | "received" | "deployed";
  image: string;
}

// Incident Types
export interface Incident {
  id: string;
  reportedDate: Date;
  reportedBy: string;
  location: string;
  qrCodeId?: string;
  severity: "minor" | "moderate" | "severe" | "critical";
  category: string;
  description: string;
  immediateActions: string;
  witnesses: string[];
  affectedPersons: number;
  photos: string[];
  status: "reported" | "investigating" | "action_plan_created" | "resolved";
  linkedActionPlanId?: string;
  aiAnalysis?: AIAnalysis;
}

export interface AIAnalysis {
  rootCause: string;
  recommendedActions: string[];
  similarIncidents: string[];
  preventiveMeasures: string[];
}

// QR Code Types
export interface QRCodeConfig {
  id: string;
  code: string;
  location: string;
  equipmentId?: string;
  deepLink: string;
  createdDate: Date;
  scannedCount: number;
  lastScanned?: Date;
  active: boolean;
}

// AI Recommendation Types
export interface AIRecommendation {
  id: string;
  type: "action" | "training" | "equipment";
  confidence: number;
  reasoning: string;
  suggestedItem: ActionPlan | TrainingPlan | EquipmentRecommendation;
  basedOn: RecommendationBasis;
  status: "pending" | "accepted" | "modified" | "rejected";
  createdDate: Date;
}

export interface RecommendationBasis {
  incidents: string[];
  riskAssessments: string[];
  historicalData: boolean;
}

// CAPA Room State Types
export type CAPATabView =
  | "actions"
  | "training"
  | "equipment"
  | "incidents"
  | "scheduler";

export interface CAPARoomState {
  activeTab: CAPATabView;
  viewMode: "kanban" | "list";
  showIncidentModal: boolean;
  selectedActionId: string | null;
  aiRecommendations: AIRecommendation[];
}
