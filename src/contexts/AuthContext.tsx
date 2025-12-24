/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Handles Firebase Auth state changes and user profile loading.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import type { User, UserSession, UserRole, Permission, ROLE_PERMISSIONS } from "@/types/user";

/** Authentication state */
interface AuthState {
  user: FirebaseUser | null;
  userProfile: User | null;
  session: UserSession | null;
  loading: boolean;
  error: string | null;
}

/** Authentication context value */
interface AuthContextValue extends AuthState {
  // Auth methods
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  
  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  
  // Helpers
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isOnboarded: boolean;
  clearError: () => void;
}

/** Data required for sign up */
interface SignUpData {
  firstName: string;
  lastName: string;
  phone?: string;
  organizationId: string;
  role?: UserRole;
  /** Organization data collected during signup to skip onboarding step 1 */
  pendingOrganization?: {
    name: string;
    industry: string;
    size: string;
  };
}

// Create context with undefined default
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Auth Provider Props */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider Component
 * Wraps the app and provides authentication context
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    userProfile: null,
    session: null,
    loading: true,
    error: null,
  });

  // Load user profile from Firestore
  const loadUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error("Error loading user profile:", error);
      return null;
    }
  }, []);

  // Build session from user profile
  const buildSession = useCallback((profile: User): UserSession => {
    // Import ROLE_PERMISSIONS dynamically to avoid circular dependency
    const rolePermissions = getRolePermissions(profile.role);
    
    return {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      organizationId: profile.organizationId,
      role: profile.role,
      permissions: rolePermissions,
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const profile = await loadUserProfile(firebaseUser);
        const session = profile ? buildSession(profile) : null;
        
        setState({
          user: firebaseUser,
          userProfile: profile,
          session,
          loading: false,
          error: null,
        });
        
        // Update last login timestamp
        if (profile) {
          try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
          } catch (error) {
            console.error("Error updating last login:", error);
          }
        }
      } else {
        // User is signed out
        setState({
          user: null,
          userProfile: null,
          session: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, [loadUserProfile, buildSession]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string): Promise<UserCredential> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return credential;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Sign in failed";
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (
    email: string,
    password: string,
    userData: SignUpData
  ): Promise<UserCredential> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = credential;

      // Update display name
      const displayName = `${userData.firstName} ${userData.lastName}`;
      await updateProfile(firebaseUser, { displayName });

      // Create user profile in Firestore
      const now = Timestamp.now();
      const userProfile: Omit<User, "id"> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        organizationId: userData.organizationId,
        role: userData.role || "user",
        status: "active",
        emailVerified: false,
        onboardingCompleted: false,
        onboardingStep: 0,
        preferences: {
          language: "fr",
          theme: "system",
          notifications: {
            email: true,
            push: true,
            sms: false,
            digest: "weekly",
            categories: {
              incidents: true,
              capa: true,
              training: true,
              compliance: true,
              system: true,
            },
          },
          dashboard: {
            defaultView: "overview",
            widgets: [],
            refreshInterval: 5,
          },
        },
        audit: {
          createdBy: firebaseUser.uid,
          createdAt: now,
          updatedBy: firebaseUser.uid,
          updatedAt: now,
        },
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userProfile);

      // Send verification email
      await sendEmailVerification(firebaseUser);

      return credential;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Sign up failed";
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Sign out failed";
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Password reset failed";
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  // Send verification email
  const sendVerificationEmail = useCallback(async (): Promise<void> => {
    if (state.user) {
      await sendEmailVerification(state.user);
    }
  }, [state.user]);

  // Update user profile
  const updateUserProfile = useCallback(async (data: Partial<User>): Promise<void> => {
    if (!state.user || !state.userProfile) return;
    
    try {
      const userDocRef = doc(db, "users", state.user.uid);
      await setDoc(userDocRef, {
        ...data,
        "audit.updatedBy": state.user.uid,
        "audit.updatedAt": serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Reload profile
      const updatedProfile = await loadUserProfile(state.user);
      if (updatedProfile) {
        setState(prev => ({
          ...prev,
          userProfile: updatedProfile,
          session: buildSession(updatedProfile),
        }));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Profile update failed";
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [state.user, state.userProfile, loadUserProfile, buildSession]);

  // Permission checks
  const hasPermission = useCallback((permission: Permission): boolean => {
    return state.session?.permissions.includes(permission) ?? false;
  }, [state.session]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!state.session) return false;
    return permissions.some(p => state.session!.permissions.includes(p));
  }, [state.session]);

  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    if (!state.session) return false;
    return permissions.every(p => state.session!.permissions.includes(p));
  }, [state.session]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Derived state
  const isAuthenticated = !!state.user;
  const isEmailVerified = state.user?.emailVerified ?? false;
  const isOnboarded = state.userProfile?.onboardingCompleted ?? false;

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    sendVerificationEmail,
    updateUserProfile,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAuthenticated,
    isEmailVerified,
    isOnboarded,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * Must be used within an AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Get permissions for a role
 * Defined here to avoid circular imports
 */
function getRolePermissions(role: UserRole): Permission[] {
  const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    super_admin: [
      "org:read", "org:update", "org:delete",
      "users:read", "users:create", "users:update", "users:delete", "users:invite",
      "incidents:read", "incidents:create", "incidents:update", "incidents:delete", "incidents:assign",
      "capa:read", "capa:create", "capa:update", "capa:delete", "capa:approve",
      "training:read", "training:create", "training:update", "training:delete", "training:assign",
      "compliance:read", "compliance:create", "compliance:update", "compliance:delete",
      "health:read", "health:create", "health:update", "health:delete",
      "analytics:read", "analytics:export",
      "settings:read", "settings:update",
    ],
    org_admin: [
      "org:read", "org:update",
      "users:read", "users:create", "users:update", "users:invite",
      "incidents:read", "incidents:create", "incidents:update", "incidents:assign",
      "capa:read", "capa:create", "capa:update", "capa:approve",
      "training:read", "training:create", "training:update", "training:assign",
      "compliance:read", "compliance:create", "compliance:update",
      "health:read", "health:create", "health:update",
      "analytics:read", "analytics:export",
      "settings:read", "settings:update",
    ],
    manager: [
      "org:read",
      "users:read",
      "incidents:read", "incidents:create", "incidents:update", "incidents:assign",
      "capa:read", "capa:create", "capa:update",
      "training:read", "training:create", "training:assign",
      "compliance:read", "compliance:create",
      "health:read", "health:create",
      "analytics:read",
      "settings:read",
    ],
    user: [
      "org:read",
      "incidents:read", "incidents:create",
      "capa:read",
      "training:read",
      "compliance:read",
      "health:read",
    ],
    viewer: [
      "org:read",
      "incidents:read",
      "capa:read",
      "training:read",
      "compliance:read",
      "health:read",
    ],
  };
  
  return ROLE_PERMISSIONS[role] || [];
}

export default AuthContext;

