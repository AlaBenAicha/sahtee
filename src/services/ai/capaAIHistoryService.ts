/**
 * CAPA AI History Service
 * 
 * Manages storage and retrieval of AI-generated analyses and suggestions for the CAPA module.
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  deleteDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { SuggestedCapa, PredictionResult, RootCauseAnalysisResult, PatternCluster } from "./types";
import type { PortfolioHealth } from "./capaHealthMonitor";
import type { RiskIntelligenceReport } from "./riskIntelligenceHub";

// Collection name
const CAPA_AI_HISTORY_COLLECTION = "capaAIHistory";

// Entry types
export type CAPAAIHistoryType = 
  | "suggestions"      // AI-generated CAPA suggestions
  | "analysis"         // Root cause analysis
  | "predictions"      // Risk predictions
  | "patterns"         // Pattern recognition results
  | "investigation";   // Investigation session

// History entry status
export type CAPAAIHistoryStatus = "completed" | "in_progress" | "failed" | "applied";

// Base history entry interface
export interface CAPAAIHistoryEntry {
  id: string;
  organizationId: string;
  type: CAPAAIHistoryType;
  title: string;
  description?: string;
  status: CAPAAIHistoryStatus;
  
  // Content based on type
  suggestions?: SuggestedCapa[];
  predictions?: PredictionResult[];
  patterns?: PatternCluster[];
  rootCauseAnalysis?: RootCauseAnalysisResult;
  portfolioHealth?: PortfolioHealth;
  riskReport?: RiskIntelligenceReport;
  
  // Metadata
  incidentsAnalyzed?: number;
  capasAnalyzed?: number;
  confidence?: number;
  
  // Applied actions tracking
  appliedSuggestions?: string[];  // IDs of suggestions that were applied
  createdCapaIds?: string[];      // IDs of CAPAs created from suggestions
  
  // Audit info
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Create input type
export type CreateCAPAAIHistoryInput = Omit<
  CAPAAIHistoryEntry,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Save an AI history entry
 */
export async function saveCAPAAIHistory(
  data: CreateCAPAAIHistoryInput
): Promise<CAPAAIHistoryEntry> {
  const now = Timestamp.now();
  
  const docRef = await addDoc(collection(db, CAPA_AI_HISTORY_COLLECTION), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  
  return {
    id: docRef.id,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get CAPA AI history for an organization
 */
export async function getCAPAAIHistory(
  organizationId: string,
  filters: {
    type?: CAPAAIHistoryType;
    status?: CAPAAIHistoryStatus;
    limit?: number;
  } = {}
): Promise<CAPAAIHistoryEntry[]> {
  const maxResults = filters.limit || 50;
  
  try {
    // Try with index (requires composite index)
    const q = query(
      collection(db, CAPA_AI_HISTORY_COLLECTION),
      where("organizationId", "==", organizationId),
      orderBy("createdAt", "desc"),
      firestoreLimit(maxResults)
    );
    
    const snapshot = await getDocs(q);
    let entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CAPAAIHistoryEntry[];
    
    // Apply type filter if specified
    if (filters.type) {
      entries = entries.filter(e => e.type === filters.type);
    }
    
    // Apply status filter if specified
    if (filters.status) {
      entries = entries.filter(e => e.status === filters.status);
    }
    
    return entries;
  } catch (error) {
    // Fallback without orderBy if index is missing
    console.warn("CAPA AI History index not available, using fallback query:", error);
    
    const q = query(
      collection(db, CAPA_AI_HISTORY_COLLECTION),
      where("organizationId", "==", organizationId),
      firestoreLimit(maxResults)
    );
    
    const snapshot = await getDocs(q);
    let entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CAPAAIHistoryEntry[];
    
    // Sort client-side
    entries.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    
    // Apply filters
    if (filters.type) {
      entries = entries.filter(e => e.type === filters.type);
    }
    if (filters.status) {
      entries = entries.filter(e => e.status === filters.status);
    }
    
    return entries;
  }
}

/**
 * Subscribe to real-time history updates
 */
export function subscribeToCAPAAIHistory(
  organizationId: string,
  callback: (entries: CAPAAIHistoryEntry[]) => void,
  maxResults: number = 50
): Unsubscribe {
  const q = query(
    collection(db, CAPA_AI_HISTORY_COLLECTION),
    where("organizationId", "==", organizationId),
    firestoreLimit(maxResults)
  );
  
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CAPAAIHistoryEntry[];
    
    // Sort by createdAt descending
    entries.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    
    callback(entries);
  });
}

/**
 * Delete a history entry
 */
export async function deleteCAPAAIHistory(entryId: string): Promise<void> {
  await deleteDoc(doc(db, CAPA_AI_HISTORY_COLLECTION, entryId));
}

/**
 * Get statistics for AI history
 */
export async function getCAPAAIHistoryStats(organizationId: string): Promise<{
  totalEntries: number;
  byType: Record<CAPAAIHistoryType, number>;
  appliedSuggestions: number;
  createdCapas: number;
  averageConfidence: number;
}> {
  const entries = await getCAPAAIHistory(organizationId, { limit: 500 });
  
  const stats = {
    totalEntries: entries.length,
    byType: {
      suggestions: 0,
      analysis: 0,
      predictions: 0,
      patterns: 0,
      investigation: 0,
    } as Record<CAPAAIHistoryType, number>,
    appliedSuggestions: 0,
    createdCapas: 0,
    averageConfidence: 0,
  };
  
  let totalConfidence = 0;
  let confidenceCount = 0;
  
  for (const entry of entries) {
    stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
    
    if (entry.appliedSuggestions) {
      stats.appliedSuggestions += entry.appliedSuggestions.length;
    }
    
    if (entry.createdCapaIds) {
      stats.createdCapas += entry.createdCapaIds.length;
    }
    
    if (entry.confidence !== undefined) {
      totalConfidence += entry.confidence;
      confidenceCount++;
    }
  }
  
  if (confidenceCount > 0) {
    stats.averageConfidence = totalConfidence / confidenceCount;
  }
  
  return stats;
}

/**
 * Helper to create a history title based on type and results
 */
export function generateHistoryTitle(
  type: CAPAAIHistoryType,
  count: number,
  context?: string
): string {
  switch (type) {
    case "suggestions":
      return `${count} suggestion${count > 1 ? "s" : ""} CAPA générée${count > 1 ? "s" : ""}`;
    case "analysis":
      return `Analyse des causes profondes${context ? ` - ${context}` : ""}`;
    case "predictions":
      return `${count} prédiction${count > 1 ? "s" : ""} de risque${count > 1 ? "s" : ""}`;
    case "patterns":
      return `${count} pattern${count > 1 ? "s" : ""} détecté${count > 1 ? "s" : ""}`;
    case "investigation":
      return `Session d'investigation${context ? ` - ${context}` : ""}`;
    default:
      return "Analyse IA";
  }
}

