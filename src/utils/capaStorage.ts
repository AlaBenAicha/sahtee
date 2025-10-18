import type {
  ActionPlan,
  AIRecommendation,
  EquipmentRecommendation,
  Incident,
  QRCodeConfig,
  TrainingPlan,
} from "../types/capa";

// Storage keys
export const STORAGE_KEYS = {
  ACTION_PLANS: "sahtee_action_plans",
  TRAINING_PLANS: "sahtee_training_plans",
  EQUIPMENT_RECS: "sahtee_equipment_recommendations",
  INCIDENTS: "sahtee_incidents",
  QR_CODES: "sahtee_qr_codes",
  AI_RECOMMENDATIONS: "sahtee_ai_recommendations",
  CAPA_SETTINGS: "sahtee_capa_settings",
} as const;

// Action Plans CRUD
export const getActionPlans = (): ActionPlan[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ACTION_PLANS);
  return data ? JSON.parse(data) : [];
};

export const saveActionPlan = (plan: ActionPlan): void => {
  const plans = getActionPlans();
  const index = plans.findIndex((p) => p.id === plan.id);
  if (index >= 0) {
    plans[index] = plan;
  } else {
    plans.push(plan);
  }
  localStorage.setItem(STORAGE_KEYS.ACTION_PLANS, JSON.stringify(plans));
};

export const deleteActionPlan = (id: string): void => {
  const plans = getActionPlans().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.ACTION_PLANS, JSON.stringify(plans));
};

// Training Plans CRUD
export const getTrainingPlans = (): TrainingPlan[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRAINING_PLANS);
  return data ? JSON.parse(data) : [];
};

export const saveTrainingPlan = (plan: TrainingPlan): void => {
  const plans = getTrainingPlans();
  const index = plans.findIndex((p) => p.id === plan.id);
  if (index >= 0) {
    plans[index] = plan;
  } else {
    plans.push(plan);
  }
  localStorage.setItem(STORAGE_KEYS.TRAINING_PLANS, JSON.stringify(plans));
};

// Equipment Recommendations CRUD
export const getEquipmentRecommendations = (): EquipmentRecommendation[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT_RECS);
  return data ? JSON.parse(data) : [];
};

export const saveEquipmentRecommendation = (
  rec: EquipmentRecommendation
): void => {
  const recs = getEquipmentRecommendations();
  const index = recs.findIndex((r) => r.id === rec.id);
  if (index >= 0) {
    recs[index] = rec;
  } else {
    recs.push(rec);
  }
  localStorage.setItem(STORAGE_KEYS.EQUIPMENT_RECS, JSON.stringify(recs));
};

// Incidents CRUD
export const getIncidents = (): Incident[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
  return data ? JSON.parse(data) : [];
};

export const saveIncident = (incident: Incident): void => {
  const incidents = getIncidents();
  const index = incidents.findIndex((i) => i.id === incident.id);
  if (index >= 0) {
    incidents[index] = incident;
  } else {
    incidents.push(incident);
  }
  localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
};

// QR Codes CRUD
export const getQRCodes = (): QRCodeConfig[] => {
  const data = localStorage.getItem(STORAGE_KEYS.QR_CODES);
  return data ? JSON.parse(data) : [];
};

export const saveQRCode = (qr: QRCodeConfig): void => {
  const qrs = getQRCodes();
  const index = qrs.findIndex((q) => q.id === qr.id);
  if (index >= 0) {
    qrs[index] = qr;
  } else {
    qrs.push(qr);
  }
  localStorage.setItem(STORAGE_KEYS.QR_CODES, JSON.stringify(qrs));
};

// AI Recommendations CRUD
export const getAIRecommendations = (): AIRecommendation[] => {
  const data = localStorage.getItem(STORAGE_KEYS.AI_RECOMMENDATIONS);
  return data ? JSON.parse(data) : [];
};

export const saveAIRecommendation = (rec: AIRecommendation): void => {
  const recs = getAIRecommendations();
  const index = recs.findIndex((r) => r.id === rec.id);
  if (index >= 0) {
    recs[index] = rec;
  } else {
    recs.push(rec);
  }
  localStorage.setItem(STORAGE_KEYS.AI_RECOMMENDATIONS, JSON.stringify(recs));
};

export const updateAIRecommendationStatus = (
  id: string,
  status: "pending" | "accepted" | "modified" | "rejected"
): void => {
  const recs = getAIRecommendations();
  const rec = recs.find((r) => r.id === id);
  if (rec) {
    rec.status = status;
    localStorage.setItem(STORAGE_KEYS.AI_RECOMMENDATIONS, JSON.stringify(recs));
  }
};
