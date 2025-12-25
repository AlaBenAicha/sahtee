/**
 * QR Code Firestore Service
 * 
 * Handles all QR code-related database operations including:
 * - QR code generation and management
 * - Location-based incident reporting
 * - Scan tracking and analytics
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
  increment,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { QRCodeConfig } from "@/types/capa";
import type { AuditInfo } from "@/types/common";

const QR_CODES_COLLECTION = "qrCodes";
const QR_SCANS_COLLECTION = "qrScans";

// =============================================================================
// Types
// =============================================================================

/**
 * QR code scan record
 */
export interface QRCodeScan {
  id: string;
  qrCodeId: string;
  organizationId: string;
  scannedAt: Timestamp;
  scannedBy?: string;
  userAgent?: string;
  ipAddress?: string;
  incidentCreated: boolean;
  incidentId?: string;
}

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

/**
 * Generate a unique short code for the QR
 */
function generateShortCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// =============================================================================
// QR Code CRUD Operations
// =============================================================================

/**
 * Create a new QR code configuration
 */
export async function createQRCode(
  data: Omit<QRCodeConfig, "id" | "createdAt" | "updatedAt" | "audit" | "scanCount">,
  userId: string
): Promise<QRCodeConfig> {
  const docRef = doc(collection(db, QR_CODES_COLLECTION));
  const now = Timestamp.now();
  
  const qrCode: Omit<QRCodeConfig, "id"> = {
    ...data,
    scanCount: 0,
    createdAt: now,
    updatedAt: now,
    audit: createAuditInfo(userId),
  };
  
  await setDoc(docRef, qrCode);
  
  return { id: docRef.id, ...qrCode };
}

/**
 * Get a single QR code by ID
 */
export async function getQRCode(qrCodeId: string): Promise<QRCodeConfig | null> {
  const docRef = doc(db, QR_CODES_COLLECTION, qrCodeId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as QRCodeConfig;
}

/**
 * Get QR code by short code (for public scanning)
 */
export async function getQRCodeByShortCode(shortCode: string): Promise<QRCodeConfig | null> {
  const q = query(
    collection(db, QR_CODES_COLLECTION),
    where("shortCode", "==", shortCode),
    where("active", "==", true),
    firestoreLimit(1)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as QRCodeConfig;
}

/**
 * Update an existing QR code
 */
export async function updateQRCode(
  qrCodeId: string,
  data: Partial<Omit<QRCodeConfig, "id" | "createdAt" | "audit" | "organizationId" | "scanCount">>,
  userId: string
): Promise<void> {
  const docRef = doc(db, QR_CODES_COLLECTION, qrCodeId);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
    "audit.updatedBy": userId,
    "audit.updatedAt": Timestamp.now(),
  });
}

/**
 * Delete a QR code
 */
export async function deleteQRCode(qrCodeId: string): Promise<void> {
  const docRef = doc(db, QR_CODES_COLLECTION, qrCodeId);
  await deleteDoc(docRef);
}

/**
 * Get all QR codes for an organization
 */
export async function getQRCodes(
  organizationId: string,
  filters: {
    siteId?: string;
    departmentId?: string;
    active?: boolean;
    searchQuery?: string;
  } = {},
  limit = 100
): Promise<QRCodeConfig[]> {
  const q = query(
    collection(db, QR_CODES_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc"),
    firestoreLimit(limit)
  );
  
  const snapshot = await getDocs(q);
  let qrCodes = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as QRCodeConfig[];
  
  // Client-side filtering
  if (filters.siteId) {
    qrCodes = qrCodes.filter(qr => qr.siteId === filters.siteId);
  }
  if (filters.departmentId) {
    qrCodes = qrCodes.filter(qr => qr.departmentId === filters.departmentId);
  }
  if (filters.active !== undefined) {
    qrCodes = qrCodes.filter(qr => qr.active === filters.active);
  }
  if (filters.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    qrCodes = qrCodes.filter(
      qr =>
        qr.locationName.toLowerCase().includes(searchLower) ||
        qr.locationDescription.toLowerCase().includes(searchLower) ||
        qr.shortCode.toLowerCase().includes(searchLower)
    );
  }
  
  return qrCodes;
}

/**
 * Subscribe to real-time QR code updates for an organization
 */
export function subscribeToQRCodes(
  organizationId: string,
  callback: (qrCodes: QRCodeConfig[]) => void
): Unsubscribe {
  const q = query(
    collection(db, QR_CODES_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const qrCodes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as QRCodeConfig[];
      
      callback(qrCodes);
    },
    (error) => {
      console.error("QR codes subscription error:", error);
      callback([]);
    }
  );
}

// =============================================================================
// QR Code Generation
// =============================================================================

/**
 * Generate a new QR code for a location
 */
export async function generateQRCodeForLocation(
  organizationId: string,
  siteId: string,
  departmentId: string | undefined,
  locationName: string,
  locationDescription: string,
  coordinates: { latitude: number; longitude: number } | undefined,
  userId: string
): Promise<QRCodeConfig> {
  const shortCode = generateShortCode();
  
  // Verify short code is unique
  let isUnique = false;
  let finalShortCode = shortCode;
  let attempts = 0;
  
  while (!isUnique && attempts < 10) {
    const existing = await getQRCodeByShortCode(finalShortCode);
    if (!existing) {
      isUnique = true;
    } else {
      finalShortCode = generateShortCode();
      attempts++;
    }
  }
  
  if (!isUnique) {
    throw new Error("Failed to generate unique QR code");
  }
  
  return createQRCode(
    {
      organizationId,
      siteId,
      departmentId,
      locationName,
      locationDescription,
      shortCode: finalShortCode,
      coordinates,
      active: true,
    },
    userId
  );
}

/**
 * Activate a QR code
 */
export async function activateQRCode(
  qrCodeId: string,
  userId: string
): Promise<void> {
  await updateQRCode(qrCodeId, { active: true }, userId);
}

/**
 * Deactivate a QR code
 */
export async function deactivateQRCode(
  qrCodeId: string,
  userId: string
): Promise<void> {
  await updateQRCode(qrCodeId, { active: false }, userId);
}

// =============================================================================
// Scan Tracking
// =============================================================================

/**
 * Record a QR code scan
 */
export async function recordQRCodeScan(
  qrCodeId: string,
  organizationId: string,
  scannedBy?: string,
  userAgent?: string,
  ipAddress?: string
): Promise<QRCodeScan> {
  const scanRef = doc(collection(db, QR_SCANS_COLLECTION));
  const now = Timestamp.now();
  
  const scan: Omit<QRCodeScan, "id"> = {
    qrCodeId,
    organizationId,
    scannedAt: now,
    scannedBy,
    userAgent,
    ipAddress,
    incidentCreated: false,
  };
  
  await setDoc(scanRef, scan);
  
  // Increment scan count on the QR code
  const qrCodeRef = doc(db, QR_CODES_COLLECTION, qrCodeId);
  await updateDoc(qrCodeRef, {
    scanCount: increment(1),
    lastScannedAt: now,
  });
  
  return { id: scanRef.id, ...scan };
}

/**
 * Link a scan to an incident
 */
export async function linkScanToIncident(
  scanId: string,
  incidentId: string
): Promise<void> {
  const docRef = doc(db, QR_SCANS_COLLECTION, scanId);
  
  await updateDoc(docRef, {
    incidentCreated: true,
    incidentId,
  });
}

/**
 * Get scans for a QR code
 */
export async function getQRCodeScans(
  qrCodeId: string,
  limit = 50
): Promise<QRCodeScan[]> {
  const q = query(
    collection(db, QR_SCANS_COLLECTION),
    where("qrCodeId", "==", qrCodeId),
    orderBy("scannedAt", "desc"),
    firestoreLimit(limit)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as QRCodeScan[];
}

// =============================================================================
// URL Generation
// =============================================================================

/**
 * Get the full URL for a QR code
 */
export function getQRCodeUrl(shortCode: string, baseUrl?: string): string {
  const base = baseUrl || window.location.origin;
  return `${base}/report/${shortCode}`;
}

/**
 * Get QR code data URL for rendering
 */
export async function generateQRCodeDataUrl(
  content: string,
  options: {
    size?: number;
    level?: "L" | "M" | "Q" | "H";
    includeMargin?: boolean;
  } = {}
): Promise<string> {
  // This function is meant to be used with a QR code library like qrcode
  // For now, we return the content to be used with qrcode.react
  // The actual SVG/Canvas generation happens in the component
  return content;
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Validate a QR code is still active and belongs to valid organization
 */
export async function validateQRCode(shortCode: string): Promise<{
  valid: boolean;
  qrCode?: QRCodeConfig;
  error?: string;
}> {
  try {
    const qrCode = await getQRCodeByShortCode(shortCode);
    
    if (!qrCode) {
      return { valid: false, error: "QR code not found" };
    }
    
    if (!qrCode.active) {
      return { valid: false, error: "QR code is deactivated" };
    }
    
    return { valid: true, qrCode };
  } catch (error) {
    console.error("Error validating QR code:", error);
    return { valid: false, error: "Validation error" };
  }
}

// =============================================================================
// Statistics
// =============================================================================

/**
 * Get QR code statistics for an organization
 */
export async function getQRCodeStats(organizationId: string): Promise<{
  totalCodes: number;
  activeCodes: number;
  totalScans: number;
  scansLast30Days: number;
  incidentsFromQR: number;
  topLocations: Array<{ locationName: string; scanCount: number }>;
}> {
  const qrCodes = await getQRCodes(organizationId);
  
  let totalScans = 0;
  const stats = {
    totalCodes: qrCodes.length,
    activeCodes: qrCodes.filter(qr => qr.active).length,
    totalScans: 0,
    scansLast30Days: 0,
    incidentsFromQR: 0,
    topLocations: [] as Array<{ locationName: string; scanCount: number }>,
  };
  
  for (const qrCode of qrCodes) {
    totalScans += qrCode.scanCount;
  }
  
  stats.totalScans = totalScans;
  
  // Get top 5 locations by scan count
  stats.topLocations = qrCodes
    .sort((a, b) => b.scanCount - a.scanCount)
    .slice(0, 5)
    .map(qr => ({
      locationName: qr.locationName,
      scanCount: qr.scanCount,
    }));
  
  // Get scans from last 30 days and incidents count
  const thirtyDaysAgo = Timestamp.fromMillis(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const scansQuery = query(
    collection(db, QR_SCANS_COLLECTION),
    where("organizationId", "==", organizationId),
    where("scannedAt", ">=", thirtyDaysAgo)
  );
  
  try {
    const scansSnapshot = await getDocs(scansQuery);
    stats.scansLast30Days = scansSnapshot.size;
    stats.incidentsFromQR = scansSnapshot.docs.filter(
      doc => doc.data().incidentCreated === true
    ).length;
  } catch (error) {
    console.error("Error fetching QR scan stats:", error);
  }
  
  return stats;
}

// =============================================================================
// Print Data
// =============================================================================

/**
 * Get data for printing QR code labels
 */
export async function getQRCodePrintData(qrCodeId: string): Promise<{
  qrCode: QRCodeConfig;
  url: string;
  printData: {
    title: string;
    subtitle: string;
    instructions: string[];
    logoUrl?: string;
  };
} | null> {
  const qrCode = await getQRCode(qrCodeId);
  
  if (!qrCode) {
    return null;
  }
  
  return {
    qrCode,
    url: getQRCodeUrl(qrCode.shortCode),
    printData: {
      title: qrCode.locationName,
      subtitle: qrCode.locationDescription,
      instructions: [
        "Scannez ce QR code pour signaler un incident",
        "Prenez des photos si possible",
        "Décrivez la situation en détail",
      ],
    },
  };
}

/**
 * Get multiple QR codes for batch printing
 */
export async function getQRCodesForBatchPrint(
  qrCodeIds: string[]
): Promise<Array<{
  qrCode: QRCodeConfig;
  url: string;
}>> {
  const results: Array<{ qrCode: QRCodeConfig; url: string }> = [];
  
  for (const id of qrCodeIds) {
    const qrCode = await getQRCode(id);
    if (qrCode) {
      results.push({
        qrCode,
        url: getQRCodeUrl(qrCode.shortCode),
      });
    }
  }
  
  return results;
}

