/**
 * AI Session Service
 * 
 * Handles CRUD operations for AI conversation sessions in Firestore.
 * Sessions are scoped to user and organization for security.
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
    Timestamp,
    onSnapshot,
    Unsubscribe,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type {
    AISession,
    AISessionSummary,
    AIMessage,
    AIContext,
    AIBotType,
} from "./types";

const AI_SESSIONS_COLLECTION = "aiSessions";

// =============================================================================
// Session CRUD Operations
// =============================================================================

/**
 * Create a new AI session
 */
export async function createSession(
    userId: string,
    organizationId: string,
    botType: AIBotType,
    context: AIContext,
    initialMessage?: AIMessage
): Promise<AISession> {
    const docRef = doc(collection(db, AI_SESSIONS_COLLECTION));
    const now = Timestamp.now();

    const session: Omit<AISession, "id"> = {
        organizationId,
        userId,
        botType,
        title: generateSessionTitle(botType, initialMessage),
        messages: initialMessage ? [initialMessage] : [],
        context,
        createdAt: now,
        updatedAt: now,
        isArchived: false,
    };

    await setDoc(docRef, session);

    return { id: docRef.id, ...session };
}

/**
 * Get a session by ID
 */
export async function getSession(sessionId: string): Promise<AISession | null> {
    const docRef = doc(db, AI_SESSIONS_COLLECTION, sessionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as AISession;
}

/**
 * Update a session (add message, update title, etc.)
 */
export async function updateSession(
    sessionId: string,
    updates: Partial<Pick<AISession, "title" | "messages" | "context" | "isArchived">>
): Promise<void> {
    const docRef = doc(db, AI_SESSIONS_COLLECTION, sessionId);

    await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
    });
}

/**
 * Add a message to a session
 */
export async function addMessageToSession(
    sessionId: string,
    message: AIMessage
): Promise<void> {
    const session = await getSession(sessionId);
    if (!session) {
        throw new Error("Session not found");
    }

    const updatedMessages = [...session.messages, message];

    // Update title from first user message if it's still the default
    let newTitle = session.title;
    if (
        session.title.startsWith("Nouvelle conversation") &&
        message.role === "user"
    ) {
        newTitle = generateTitleFromMessage(message.content);
    }

    await updateSession(sessionId, {
        messages: updatedMessages,
        title: newTitle,
    });
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
    const docRef = doc(db, AI_SESSIONS_COLLECTION, sessionId);
    await deleteDoc(docRef);
}

/**
 * Archive a session (soft delete)
 */
export async function archiveSession(sessionId: string): Promise<void> {
    await updateSession(sessionId, { isArchived: true });
}

/**
 * Unarchive a session
 */
export async function unarchiveSession(sessionId: string): Promise<void> {
    await updateSession(sessionId, { isArchived: false });
}

// =============================================================================
// Session Query Operations
// =============================================================================

/**
 * Get sessions for a user
 */
export async function getUserSessions(
    userId: string,
    organizationId: string,
    options: {
        botType?: AIBotType;
        includeArchived?: boolean;
        limit?: number;
    } = {}
): Promise<AISessionSummary[]> {
    const { botType, includeArchived = false, limit = 50 } = options;

    let q = query(
        collection(db, AI_SESSIONS_COLLECTION),
        where("userId", "==", userId),
        where("organizationId", "==", organizationId),
        orderBy("updatedAt", "desc"),
        firestoreLimit(limit)
    );

    const snapshot = await getDocs(q);
    let sessions = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            botType: data.botType,
            messageCount: data.messages?.length || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            isArchived: data.isArchived || false,
        } as AISessionSummary;
    });

    // Client-side filtering
    if (botType) {
        sessions = sessions.filter((s) => s.botType === botType);
    }

    if (!includeArchived) {
        sessions = sessions.filter((s) => !s.isArchived);
    }

    return sessions;
}

/**
 * Get recent sessions for quick access
 */
export async function getRecentSessions(
    userId: string,
    organizationId: string,
    botType?: AIBotType,
    limit = 5
): Promise<AISessionSummary[]> {
    return getUserSessions(userId, organizationId, {
        botType,
        includeArchived: false,
        limit,
    });
}

/**
 * Subscribe to session updates for real-time sync
 */
export function subscribeToSessions(
    userId: string,
    organizationId: string,
    callback: (sessions: AISessionSummary[]) => void,
    botType?: AIBotType
): Unsubscribe {
    const q = query(
        collection(db, AI_SESSIONS_COLLECTION),
        where("userId", "==", userId),
        where("organizationId", "==", organizationId),
        orderBy("updatedAt", "desc"),
        firestoreLimit(50)
    );

    return onSnapshot(
        q,
        (snapshot) => {
            let sessions = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    botType: data.botType,
                    messageCount: data.messages?.length || 0,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                    isArchived: data.isArchived || false,
                } as AISessionSummary;
            });

            // Filter by bot type if specified
            if (botType) {
                sessions = sessions.filter((s) => s.botType === botType);
            }

            // Filter out archived
            sessions = sessions.filter((s) => !s.isArchived);

            callback(sessions);
        },
        (error) => {
            console.error("Sessions subscription error:", error);
            callback([]);
        }
    );
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate a default session title based on bot type
 */
function generateSessionTitle(
    botType: AIBotType,
    initialMessage?: AIMessage
): string {
    if (initialMessage && initialMessage.role === "user") {
        return generateTitleFromMessage(initialMessage.content);
    }

    const botNames: Record<AIBotType, string> = {
        safetybot: "SafetyBot",
        capa_ai: "CAPA-AI",
        conformity_ai: "Conformity-AI",
        health_ai: "Health-AI",
    };

    const date = new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
    });

    return `Nouvelle conversation ${botNames[botType]} - ${date}`;
}

/**
 * Generate a title from the first user message
 */
function generateTitleFromMessage(content: string): string {
    // Take first 50 chars and clean up
    let title = content.substring(0, 50).trim();

    // Remove trailing incomplete words
    const lastSpace = title.lastIndexOf(" ");
    if (lastSpace > 20 && title.length === 50) {
        title = title.substring(0, lastSpace);
    }

    // Add ellipsis if truncated
    if (content.length > 50) {
        title += "...";
    }

    return title;
}

/**
 * Convert Firestore session to AISession type
 */
export function firestoreToSession(
    id: string,
    data: Record<string, unknown>
): AISession {
    return {
        id,
        organizationId: data.organizationId as string,
        userId: data.userId as string,
        botType: data.botType as AIBotType,
        title: data.title as string,
        messages: (data.messages as AIMessage[]) || [],
        context: data.context as AIContext,
        createdAt: data.createdAt as Timestamp,
        updatedAt: data.updatedAt as Timestamp,
        isArchived: (data.isArchived as boolean) || false,
    };
}

