/**
 * Common Types - Shared across modules
 */

import type { Timestamp } from "firebase/firestore";

/** Firestore document base fields */
export interface FirestoreDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Audit trail for tracking changes */
export interface AuditInfo {
  createdBy: string;
  createdAt: Timestamp;
  updatedBy: string;
  updatedAt: Timestamp;
}

/** Generic API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Pagination parameters */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/** File upload metadata */
export interface FileMetadata {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Timestamp;
}

/** Address type for locations */
export interface Address {
  street: string;
  city: string;
  governorate: string;
  postalCode: string;
  country: string;
}

/** Contact information */
export interface ContactInfo {
  email: string;
  phone?: string;
  mobile?: string;
}

/** Date range for filtering */
export interface DateRange {
  start: Date;
  end: Date;
}

/** Priority levels used across the application */
export type Priority = "critique" | "haute" | "moyenne" | "basse";

/** Status levels used across the application */
export type GenericStatus = "pending" | "in_progress" | "completed" | "cancelled";

/** Localized text support (French/English) */
export interface LocalizedText {
  fr: string;
  en?: string;
}

