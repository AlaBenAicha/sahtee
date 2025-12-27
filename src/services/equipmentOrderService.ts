/**
 * Equipment Order Service
 * 
 * Handles CRUD operations for equipment orders.
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
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { EquipmentOrder, EquipmentOrderStatus } from "@/types/capa";

const EQUIPMENT_ORDERS_COLLECTION = "equipmentOrders";

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Get all equipment orders for an organization
 */
export async function getEquipmentOrders(
  organizationId: string,
  filters: {
    status?: EquipmentOrderStatus[];
    equipmentId?: string;
    requestedBy?: string;
  } = {}
): Promise<EquipmentOrder[]> {
  let q = query(
    collection(db, EQUIPMENT_ORDERS_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("requestedAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  let orders = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as EquipmentOrder[];

  // Apply client-side filters
  if (filters.status && filters.status.length > 0) {
    orders = orders.filter(o => filters.status!.includes(o.status));
  }
  if (filters.equipmentId) {
    orders = orders.filter(o => o.equipmentId === filters.equipmentId);
  }
  if (filters.requestedBy) {
    orders = orders.filter(o => o.requestedBy === filters.requestedBy);
  }

  return orders;
}

/**
 * Get a single equipment order by ID
 */
export async function getEquipmentOrder(orderId: string): Promise<EquipmentOrder | null> {
  const docRef = doc(db, EQUIPMENT_ORDERS_COLLECTION, orderId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() } as EquipmentOrder;
}

/**
 * Create a new equipment order
 */
export async function createEquipmentOrder(
  data: Omit<EquipmentOrder, "id" | "createdAt" | "updatedAt" | "audit">,
  createdBy: string
): Promise<EquipmentOrder> {
  const now = Timestamp.now();
  const docRef = doc(collection(db, EQUIPMENT_ORDERS_COLLECTION));

  const order: Omit<EquipmentOrder, "id"> = {
    ...data,
    requestedAt: now,
    createdAt: now,
    updatedAt: now,
    audit: {
      createdBy,
      createdAt: now,
      updatedBy: createdBy,
      updatedAt: now,
    },
  };

  await setDoc(docRef, order);

  return { id: docRef.id, ...order };
}

/**
 * Update an equipment order
 */
export async function updateEquipmentOrder(
  orderId: string,
  data: Partial<EquipmentOrder>,
  updatedBy: string
): Promise<void> {
  const docRef = doc(db, EQUIPMENT_ORDERS_COLLECTION, orderId);

  await updateDoc(docRef, {
    ...data,
    "audit.updatedBy": updatedBy,
    "audit.updatedAt": serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Approve an equipment order
 */
export async function approveEquipmentOrder(
  orderId: string,
  approvedBy: string,
  approvedByName: string
): Promise<void> {
  await updateEquipmentOrder(
    orderId,
    {
      status: "approved",
      approvedBy,
      approvedByName,
      approvedAt: Timestamp.now(),
    },
    approvedBy
  );
}

/**
 * Reject an equipment order
 */
export async function rejectEquipmentOrder(
  orderId: string,
  rejectedBy: string,
  rejectionReason: string
): Promise<void> {
  await updateEquipmentOrder(
    orderId,
    {
      status: "rejected",
      rejectionReason,
    },
    rejectedBy
  );
}

/**
 * Mark an order as ordered (placed with supplier)
 */
export async function markOrderAsOrdered(
  orderId: string,
  orderDetails: {
    supplierName: string;
    orderReference?: string;
    expectedDeliveryDate?: Timestamp;
  },
  updatedBy: string
): Promise<void> {
  await updateEquipmentOrder(
    orderId,
    {
      status: "ordered",
      ...orderDetails,
    },
    updatedBy
  );
}

/**
 * Mark an order as delivered
 */
export async function markOrderAsDelivered(
  orderId: string,
  deliveryNotes?: string,
  updatedBy?: string
): Promise<void> {
  await updateEquipmentOrder(
    orderId,
    {
      status: "delivered",
      actualDeliveryDate: Timestamp.now(),
      deliveryNotes,
    },
    updatedBy || "system"
  );
}

/**
 * Cancel an equipment order
 */
export async function cancelEquipmentOrder(
  orderId: string,
  cancelledBy: string
): Promise<void> {
  await updateEquipmentOrder(
    orderId,
    { status: "cancelled" },
    cancelledBy
  );
}

/**
 * Delete an equipment order (use with caution)
 */
export async function deleteEquipmentOrder(orderId: string): Promise<void> {
  const docRef = doc(db, EQUIPMENT_ORDERS_COLLECTION, orderId);
  await deleteDoc(docRef);
}

/**
 * Get pending orders count for an organization
 */
export async function getPendingOrdersCount(organizationId: string): Promise<number> {
  const orders = await getEquipmentOrders(organizationId, {
    status: ["requested", "approved"],
  });
  return orders.length;
}

