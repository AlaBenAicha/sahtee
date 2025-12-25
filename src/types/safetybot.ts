/**
 * SafetyBot Type Definitions
 * AI conversational assistant types for the SAHTEE platform
 */

import type { Timestamp } from "firebase/firestore";

/**
 * SafetyBot message role
 */
export type MessageRole = "user" | "assistant" | "system";

/**
 * Suggested action types that SafetyBot can recommend
 */
export type SuggestedActionType =
  | "navigate"
  | "create_capa"
  | "create_incident"
  | "schedule_audit"
  | "view_document"
  | "generate_report"
  | "view_training"
  | "view_health";

/**
 * Source reference for SafetyBot responses
 */
export interface MessageSource {
  type: "document" | "data" | "regulation" | "module";
  title: string;
  description?: string;
  link?: string;
}

/**
 * Action suggested by SafetyBot
 */
export interface SuggestedAction {
  type: SuggestedActionType;
  label: string;
  icon?: string;
  path?: string;
  payload?: Record<string, unknown>;
}

/**
 * Individual message in a SafetyBot conversation
 */
export interface SafetyBotMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  sources?: MessageSource[];
  suggestedActions?: SuggestedAction[];
  isStreaming?: boolean;
  isError?: boolean;
}

/**
 * Context for the current conversation
 */
export interface ConversationContext {
  currentPage: string;
  currentModule?: string;
  userRole: string;
  userName: string;
  organizationId: string;
  organizationName: string;
  // Dynamic data from the platform
  stats?: {
    activeIncidents?: number;
    pendingCapas?: number;
    overdueCapas?: number;
    complianceScore?: number;
    upcomingAudits?: number;
    pendingVisits?: number;
  };
}

/**
 * Full SafetyBot conversation stored in Firestore
 */
export interface SafetyBotConversation {
  id: string;
  organizationId: string;
  userId: string;
  messages: SafetyBotMessage[];
  context: ConversationContext;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

/**
 * SafetyBot panel state
 */
export interface SafetyBotState {
  isOpen: boolean;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  messages: SafetyBotMessage[];
  conversationId: string | null;
}

/**
 * Quick suggestion for the chat input
 */
export interface QuickSuggestion {
  id: string;
  text: string;
  icon?: string;
  category?: "navigation" | "data" | "help" | "report";
}

/**
 * Platform knowledge item for navigation assistance
 */
export interface PlatformKnowledgeItem {
  id: string;
  path: string;
  name: string;
  nameFr: string;
  description: string;
  features: string[];
  actions: {
    id: string;
    label: string;
    description?: string;
  }[];
  keywords: string[];
}

/**
 * FAQ item for common questions
 */
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  relatedModule?: string;
  keywords: string[];
}

/**
 * SafetyBot API request
 */
export interface SafetyBotRequest {
  message: string;
  context: ConversationContext;
  conversationHistory?: SafetyBotMessage[];
}

/**
 * SafetyBot API response
 */
export interface SafetyBotResponse {
  content: string;
  sources?: MessageSource[];
  suggestedActions?: SuggestedAction[];
  confidence?: number;
}
