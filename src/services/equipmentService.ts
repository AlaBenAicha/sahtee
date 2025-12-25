/**
 * Equipment Firestore Service
 * 
 * Handles all equipment-related database operations including:
 * - Equipment catalog management
 * - Equipment recommendations
 * - CAPA integration
 * - Status tracking
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
  EquipmentRecommendation,
  EquipmentCategory,
  EquipmentPriority,
  EquipmentStatus,
} from "@/types/capa";
import type { AuditInfo, FileMetadata } from "@/types/common";

const EQUIPMENT_COLLECTION = "equipmentRecommendations";

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create audit info for a new document
 */
function createAuditInfo(userId: string): AuditInfo {
  const now = Timestamp.now();
  return {
    createdBy: userId,
    createdAt: now,
    updatedBy: userId,
    updatedAt: now,
  };
}

// =============================================================================
// Equipment CRUD Operations
// =============================================================================

/**
 * Create a new equipment recommendation
 */
export async function createEquipmentRecommendation(
  data: Omit<EquipmentRecommendation, "id" | "createdAt" | "updatedAt" | "audit">,
  userId: string
): Promise<EquipmentRecommendation> {
  const docRef = doc(collection(db, EQUIPMENT_COLLECTION));
  const now = Timestamp.now();
  
  const equipment: Omit<EquipmentRecommendation, "id"> = {
    ...data,
    createdAt: now,
    updatedAt: now,
    audit: createAuditInfo(userId),
  };
  
  await setDoc(docRef, equipment);
  
  return { id: docRef.id, ...equipment };
}

/**
 * Get a single equipment recommendation by ID
 */
export async function getEquipmentRecommendation(
  equipmentId: string
): Promise<EquipmentRecommendation | null> {
  const docRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as EquipmentRecommendation;
}

/**
 * Update an existing equipment recommendation
 */
export async function updateEquipmentRecommendation(
  equipmentId: string,
  data: Partial<Omit<EquipmentRecommendation, "id" | "createdAt" | "audit" | "organizationId">>,
  userId: string
): Promise<void> {
  const docRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Delete an equipment recommendation
 */
export async function deleteEquipmentRecommendation(equipmentId: string): Promise<void> {
  const docRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
  await deleteDoc(docRef);
}

/**
 * Get equipment catalog for an organization
 */
export async function getEquipmentCatalog(
  organizationId: string,
  filters: {
    category?: EquipmentCategory[];
    priority?: EquipmentPriority[];
    status?: EquipmentStatus[];
    searchQuery?: string;
  } = {},
  limit = 100
): Promise<EquipmentRecommendation[]> {
  const q = query(
    collection(db, EQUIPMENT_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc"),
    firestoreLimit(limit)
  );
  
  const snapshot = await getDocs(q);
  let equipment = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as EquipmentRecommendation[];
  
  // Client-side filtering
  if (filters.category && filters.category.length > 0) {
    equipment = equipment.filter(e => filters.category!.includes(e.category));
  }
  if (filters.priority && filters.priority.length > 0) {
    equipment = equipment.filter(e => filters.priority!.includes(e.priority));
  }
  if (filters.status && filters.status.length > 0) {
    equipment = equipment.filter(e => filters.status!.includes(e.status));
  }
  if (filters.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    equipment = equipment.filter(
      e =>
        e.name.toLowerCase().includes(searchLower) ||
        e.description.toLowerCase().includes(searchLower) ||
        (e.manufacturer && e.manufacturer.toLowerCase().includes(searchLower)) ||
        (e.model && e.model.toLowerCase().includes(searchLower))
    );
  }
  
  return equipment;
}

/**
 * Subscribe to real-time equipment updates for an organization
 */
export function subscribeToEquipmentCatalog(
  organizationId: string,
  callback: (equipment: EquipmentRecommendation[]) => void
): Unsubscribe {
  const q = query(
    collection(db, EQUIPMENT_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const equipment = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as EquipmentRecommendation[];
      
      callback(equipment);
    },
    (error) => {
      console.error("Equipment subscription error:", error);
      callback([]);
    }
  );
}

// =============================================================================
// Status Operations
// =============================================================================

/**
 * Update equipment status
 */
export async function updateEquipmentStatus(
  equipmentId: string,
  status: EquipmentStatus,
  userId: string
): Promise<void> {
  const docRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
  
  await updateDoc(docRef, {
    status,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Mark equipment as ordered
 */
export async function markEquipmentOrdered(
  equipmentId: string,
  quantityOrdered: number,
  userId: string
): Promise<void> {
  const docRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
  
  await updateDoc(docRef, {
    status: "ordered",
    quantityOrdered,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Mark equipment as received
 */
export async function markEquipmentReceived(
  equipmentId: string,
  quantityReceived: number,
  userId: string
): Promise<void> {
  const docRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
  
  await updateDoc(docRef, {
    status: "received",
    quantityReceived,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Mark equipment as deployed
 */
export async function markEquipmentDeployed(
  equipmentId: string,
  actualCost: number | undefined,
  userId: string
): Promise<void> {
  const docRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
  
  const updates: Record<string, unknown> = {
    status: "deployed",
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  };
  
  if (actualCost !== undefined) {
    updates.actualCost = actualCost;
  }
  
  await updateDoc(docRef, updates);
}

/**
 * Reject equipment recommendation
 */
export async function rejectEquipmentRecommendation(
  equipmentId: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
  
  await updateDoc(docRef, {
    status: "rejected",
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

// =============================================================================
// CAPA Integration
// =============================================================================

/**
 * Get equipment recommendations linked to a CAPA
 */
export async function getEquipmentForCAPA(
  capaId: string
): Promise<EquipmentRecommendation[]> {
  const q = query(
    collection(db, EQUIPMENT_COLLECTION),
    where("linkedActionPlanId", "==", capaId)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as EquipmentRecommendation[];
}

/**
 * Link equipment to a CAPA
 */
export async function linkEquipmentToCAPA(
  equipmentId: string,
  capaId: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
  
  await updateDoc(docRef, {
    linkedActionPlanId: capaId,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Get equipment recommendations linked to an incident
 */
export async function getEquipmentForIncident(
  incidentId: string
): Promise<EquipmentRecommendation[]> {
  const q = query(
    collection(db, EQUIPMENT_COLLECTION),
    where("linkedIncidentId", "==", incidentId)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as EquipmentRecommendation[];
}

// =============================================================================
// Image Management
// =============================================================================

/**
 * Add images to equipment
 */
export async function addEquipmentImages(
  equipmentId: string,
  images: FileMetadata[],
  userId: string
): Promise<void> {
  const equipment = await getEquipmentRecommendation(equipmentId);
  if (!equipment) throw new Error("Equipment not found");
  
  const updatedImages = [...equipment.images, ...images];
  
  const docRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
  await updateDoc(docRef, {
    images: updatedImages,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Remove image from equipment
 */
export async function removeEquipmentImage(
  equipmentId: string,
  imageId: string,
  userId: string
): Promise<void> {
  const equipment = await getEquipmentRecommendation(equipmentId);
  if (!equipment) throw new Error("Equipment not found");
  
  const updatedImages = equipment.images.filter(img => img.id !== imageId);
  
  const docRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
  await updateDoc(docRef, {
    images: updatedImages,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

// =============================================================================
// Statistics
// =============================================================================

/**
 * Get equipment statistics for an organization
 */
export async function getEquipmentStats(organizationId: string): Promise<{
  total: number;
  byCategory: Record<EquipmentCategory, number>;
  byStatus: Record<EquipmentStatus, number>;
  byPriority: Record<EquipmentPriority, number>;
  pendingDeployment: number;
  totalEstimatedCost: number;
  totalActualCost: number;
}> {
  const equipment = await getEquipmentCatalog(organizationId);
  
  const stats = {
    total: equipment.length,
    byCategory: {} as Record<EquipmentCategory, number>,
    byStatus: {} as Record<EquipmentStatus, number>,
    byPriority: {} as Record<EquipmentPriority, number>,
    pendingDeployment: 0,
    totalEstimatedCost: 0,
    totalActualCost: 0,
  };
  
  for (const item of equipment) {
    // Count by category
    stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
    
    // Count by status
    stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
    
    // Count by priority
    stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
    
    // Count pending deployment
    if (["pending", "ordered", "received"].includes(item.status)) {
      stats.pendingDeployment++;
    }
    
    // Sum costs
    if (item.estimatedCost) {
      stats.totalEstimatedCost += item.estimatedCost * (item.quantityRecommended || 1);
    }
    if (item.actualCost) {
      stats.totalActualCost += item.actualCost;
    }
  }
  
  return stats;
}

// =============================================================================
// Catalog Items (Pre-defined Equipment Templates)
// =============================================================================

/**
 * Equipment catalog item type (for pre-defined catalog)
 */
export interface EquipmentCatalogItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  description: string;
  manufacturer?: string;
  model?: string;
  certifications: string[];
  features: string[];
  imageUrl?: string;
  estimatedCost?: number;
}

/**
 * Get pre-defined equipment catalog items
 * These are template items that can be used to create recommendations
 */
export function getEquipmentCatalogTemplates(): EquipmentCatalogItem[] {
  return [
    // EPI - Head Protection
    {
      id: "helmet-industrial",
      name: "Casque de sécurité industriel",
      category: "epi",
      description: "Casque de protection industriel conforme EN 397",
      certifications: ["EN 397", "EN 50365"],
      features: ["Ventilé", "Réglable", "Protection électrique"],
      estimatedCost: 25,
    },
    {
      id: "helmet-bump",
      name: "Casquette anti-heurt",
      category: "epi",
      description: "Protection légère contre les chocs",
      certifications: ["EN 812"],
      features: ["Légère", "Aérée", "Design moderne"],
      estimatedCost: 15,
    },
    // EPI - Eye Protection
    {
      id: "glasses-safety",
      name: "Lunettes de protection",
      category: "epi",
      description: "Lunettes de sécurité anti-projections",
      certifications: ["EN 166"],
      features: ["Anti-rayures", "Anti-buée", "Protection UV"],
      estimatedCost: 10,
    },
    {
      id: "goggles-chemical",
      name: "Lunettes-masque chimique",
      category: "epi",
      description: "Protection intégrale contre les éclaboussures chimiques",
      certifications: ["EN 166", "EN 170"],
      features: ["Étanche", "Ventilée", "Compatible masque respiratoire"],
      estimatedCost: 20,
    },
    // EPI - Hearing Protection
    {
      id: "earplugs-foam",
      name: "Bouchons d'oreilles mousse",
      category: "epi",
      description: "Protection auditive jetable SNR 37dB",
      certifications: ["EN 352-2"],
      features: ["Jetable", "Confortable", "Hypoallergénique"],
      estimatedCost: 0.5,
    },
    {
      id: "earmuffs-industrial",
      name: "Casque antibruit industriel",
      category: "epi",
      description: "Protection auditive haute performance SNR 32dB",
      certifications: ["EN 352-1"],
      features: ["Réglable", "Coussinets remplaçables", "Pliable"],
      estimatedCost: 35,
    },
    // EPI - Hand Protection
    {
      id: "gloves-nitrile",
      name: "Gants nitrile résistants",
      category: "epi",
      description: "Gants de protection chimique et mécanique",
      certifications: ["EN 388", "EN 374"],
      features: ["Résistant aux produits chimiques", "Bonne dextérité"],
      estimatedCost: 8,
    },
    {
      id: "gloves-cut-resistant",
      name: "Gants anti-coupure niveau 5",
      category: "epi",
      description: "Protection maximale contre les coupures",
      certifications: ["EN 388:2016 4X44F"],
      features: ["Niveau F (maximum)", "Bonne préhension", "Lavable"],
      estimatedCost: 15,
    },
    // Ergonomie
    {
      id: "chair-ergonomic",
      name: "Chaise ergonomique de bureau",
      category: "ergonomie",
      description: "Siège avec support lombaire ajustable",
      certifications: ["NF EN 1335"],
      features: ["Accoudoirs réglables", "Support lombaire", "Réglage hauteur"],
      estimatedCost: 350,
    },
    {
      id: "desk-sit-stand",
      name: "Bureau assis-debout électrique",
      category: "ergonomie",
      description: "Poste de travail à hauteur variable",
      certifications: [],
      features: ["Mémorisation positions", "Motorisé", "Silencieux"],
      estimatedCost: 600,
    },
    // Sécurité
    {
      id: "harness-fall",
      name: "Harnais antichute complet",
      category: "securite",
      description: "Équipement de protection contre les chutes de hauteur",
      certifications: ["EN 361", "EN 358"],
      features: ["Points d'ancrage multiples", "Indicateur de chute"],
      estimatedCost: 150,
    },
    {
      id: "kit-lockout",
      name: "Kit de consignation LOTO",
      category: "securite",
      description: "Équipement de consignation des énergies",
      certifications: [],
      features: ["Cadenas de sécurité", "Moraillons", "Étiquettes"],
      estimatedCost: 80,
    },
    // Signalisation
    {
      id: "sign-danger",
      name: "Panneau de danger",
      category: "signalisation",
      description: "Signalisation conforme ISO 7010",
      certifications: ["ISO 7010"],
      features: ["Photoluminescent", "Résistant UV"],
      estimatedCost: 15,
    },
    {
      id: "tape-floor",
      name: "Ruban de marquage au sol",
      category: "signalisation",
      description: "Délimitation des zones de circulation",
      certifications: [],
      features: ["Résistant à l'usure", "Haute visibilité"],
      estimatedCost: 25,
    },
  ];
}

/**
 * Create equipment recommendation from catalog template
 */
export async function createFromCatalogTemplate(
  templateId: string,
  organizationId: string,
  capaId: string | undefined,
  incidentId: string | undefined,
  quantity: number,
  aiReason: string,
  priority: EquipmentPriority,
  userId: string
): Promise<EquipmentRecommendation | null> {
  const templates = getEquipmentCatalogTemplates();
  const template = templates.find(t => t.id === templateId);
  
  if (!template) {
    return null;
  }
  
  return createEquipmentRecommendation(
    {
      organizationId,
      name: template.name,
      category: template.category,
      description: template.description,
      manufacturer: template.manufacturer,
      model: template.model,
      certifications: template.certifications,
      features: template.features,
      aiReason,
      aiConfidence: 75, // Default confidence for template-based recommendations
      linkedActionPlanId: capaId,
      linkedIncidentId: incidentId,
      priority,
      status: "pending",
      quantityRecommended: quantity,
      estimatedCost: template.estimatedCost,
      images: [],
    },
    userId
  );
}

