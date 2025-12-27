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
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, writeBatch, collection } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import type { User, UserSession, UserRole, Permission } from "@/types/user";
import type { 
  Organization, 
  CustomRole, 
  FeaturePermissions, 
  CRUDPermissions, 
  FeatureModule,
  IndustrySector, 
  CompanySize 
} from "@/types/organization";
import { EMPTY_CRUD_PERMISSIONS } from "@/types/organization";
import { 
  featurePermissionsToLegacy, 
  SUPER_ADMIN_PERMISSIONS, 
  ORG_ADMIN_PERMISSIONS 
} from "@/types/user";
import { TEMPLATE_ROLES, getRoleById } from "@/services/roleService";
import { getDefaultOnboardingData } from "@/services/organizationService";

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
  
  // Permission checks (legacy)
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  
  // Feature-based permission checks
  canAccessFeature: (feature: FeatureModule) => boolean;
  canPerformAction: (feature: FeatureModule, action: keyof CRUDPermissions) => boolean;
  getFeaturePermissions: (feature: FeatureModule) => CRUDPermissions;
  
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
  /** 
   * Organization data for creating new org during signup.
   * When provided, creates a new organization and makes this user the org_admin.
   */
  organization: {
    name: string;
    sector: IndustrySector;
    size: CompanySize;
    employeeCount: number;
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

  // Build session from user profile and role
  const buildSession = useCallback(async (
    profile: User, 
    role: CustomRole | null
  ): Promise<UserSession> => {
    // Determine feature permissions based on role hierarchy
    let featurePermissions: FeaturePermissions;
    let roleName = "Utilisateur";
    
    if (profile.role === "super_admin") {
      // Platform super admin has full access
      featurePermissions = SUPER_ADMIN_PERMISSIONS;
      roleName = "Super Admin";
    } else if (profile.isOrgAdmin) {
      // Org admin has full access within their organization
      featurePermissions = ORG_ADMIN_PERMISSIONS;
      roleName = "Administrateur";
    } else if (role) {
      // Regular user - use permissions from their assigned role
      featurePermissions = role.permissions;
      roleName = role.name;
    } else {
      // Fallback - use legacy role permissions
      const legacyPermissions = getRolePermissions(profile.role);
      // Convert legacy permissions to empty feature permissions
      featurePermissions = {
        dashboard: { create: false, read: true, update: false, delete: false },
        incidents: { 
          create: legacyPermissions.includes("incidents:create"), 
          read: legacyPermissions.includes("incidents:read"), 
          update: legacyPermissions.includes("incidents:update"), 
          delete: legacyPermissions.includes("incidents:delete") 
        },
        capa: { 
          create: legacyPermissions.includes("capa:create"), 
          read: legacyPermissions.includes("capa:read"), 
          update: legacyPermissions.includes("capa:update"), 
          delete: legacyPermissions.includes("capa:delete") 
        },
        training: { 
          create: legacyPermissions.includes("training:create"), 
          read: legacyPermissions.includes("training:read"), 
          update: legacyPermissions.includes("training:update"), 
          delete: legacyPermissions.includes("training:delete") 
        },
        compliance: { 
          create: legacyPermissions.includes("compliance:create"), 
          read: legacyPermissions.includes("compliance:read"), 
          update: legacyPermissions.includes("compliance:update"), 
          delete: legacyPermissions.includes("compliance:delete") 
        },
        health: { 
          create: legacyPermissions.includes("health:create"), 
          read: legacyPermissions.includes("health:read"), 
          update: legacyPermissions.includes("health:update"), 
          delete: legacyPermissions.includes("health:delete") 
        },
        analytics: { 
          create: false, 
          read: legacyPermissions.includes("analytics:read"), 
          update: false, 
          delete: false 
        },
        settings: { 
          create: false, 
          read: legacyPermissions.includes("settings:read"), 
          update: legacyPermissions.includes("settings:update"), 
          delete: false 
        },
        users: { 
          create: legacyPermissions.includes("users:create"), 
          read: legacyPermissions.includes("users:read"), 
          update: legacyPermissions.includes("users:update"), 
          delete: legacyPermissions.includes("users:delete") 
        },
        roles: { 
          create: false, 
          read: false, 
          update: false, 
          delete: false 
        },
      };
    }
    
    // Convert to legacy permissions for backwards compatibility
    const legacyPermissions = featurePermissionsToLegacy(featurePermissions);
    
    return {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      organizationId: profile.organizationId,
      role: profile.role,
      roleId: profile.roleId,
      roleName,
      isOrgAdmin: profile.isOrgAdmin,
      featurePermissions,
      permissions: legacyPermissions,
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const profile = await loadUserProfile(firebaseUser);
        
        let session: UserSession | null = null;
        if (profile) {
          // Load role if user has a roleId
          const role = profile.roleId ? await getRoleById(profile.roleId) : null;
          session = await buildSession(profile, role);
        }
        
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
  // Creates: Organization → Template Roles → User (as org_admin)
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

      const now = Timestamp.now();
      const batch = writeBatch(db);

      // 1. Create Organization document
      const orgRef = doc(collection(db, "organizations"));
      const orgId = orgRef.id;
      
      const organization: Omit<Organization, "id"> = {
        name: userData.organization.name,
        legalName: userData.organization.name,
        registrationNumber: "",
        address: {
          street: "",
          city: "",
          governorate: "",
          postalCode: "",
          country: "Tunisie",
        },
        contact: {
          email: firebaseUser.email!,
        },
        sector: userData.organization.sector,
        size: userData.organization.size,
        employeeCount: userData.organization.employeeCount,
        plan: "starter",
        status: "trial",
        trialEndsAt: Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)), // 14 days trial
        features: {
          capa: true,
          incidents: true,
          training: false,
          compliance: false,
          health: false,
          analytics: false,
          aiAssistant: false,
          mobileApp: false,
          apiAccess: false,
          customBranding: false,
        },
        limits: {
          maxUsers: 10,
          maxDepartments: 3,
          maxStorageGB: 5,
          maxMonthlyReports: 10,
          maxAIQueries: 0,
        },
        onboarding: getDefaultOnboardingData(),
        settings: {
          language: "fr",
          timezone: "Africa/Tunis",
          dateFormat: "DD/MM/YYYY",
          currency: "TND",
          requireIncidentPhotos: false,
          requireWitnesses: false,
          autoGenerateCapa: false,
          adminNotifications: true,
          weeklyDigest: true,
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
      
      batch.set(orgRef, organization);

      // 2. Create Template Roles for the organization
      let orgAdminRoleId = "";
      
      for (const templateRole of TEMPLATE_ROLES) {
        const roleRef = doc(collection(db, "roles"));
        
        const role: Omit<CustomRole, "id"> = {
          ...templateRole,
          organizationId: orgId,
          createdAt: now,
          updatedAt: now,
          audit: {
            createdBy: firebaseUser.uid,
            createdAt: now,
            updatedBy: firebaseUser.uid,
            updatedAt: now,
          },
        };
        
        batch.set(roleRef, role);
        
        // Keep track of the Org Admin role ID to assign to the first user
        if (templateRole.name === "Org Admin") {
          orgAdminRoleId = roleRef.id;
        }
      }

      // 3. Create User profile as org_admin
      const userRef = doc(db, "users", firebaseUser.uid);
      
      const userProfile: Omit<User, "id"> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        organizationId: orgId,
        role: "org_admin", // Legacy role field
        roleId: orgAdminRoleId, // Assigned Org Admin role for the organization creator
        isOrgAdmin: true, // This user is the organization administrator
        status: "active",
        emailVerified: false,
        onboardingCompleted: false,
        onboardingStep: 1, // Skip org setup step since we already have the data
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

      batch.set(userRef, userProfile);

      // Commit all documents atomically
      await batch.commit();

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

      // Reload profile and role
      const updatedProfile = await loadUserProfile(state.user);
      if (updatedProfile) {
        const role = updatedProfile.roleId ? await getRoleById(updatedProfile.roleId) : null;
        const session = await buildSession(updatedProfile, role);
        setState(prev => ({
          ...prev,
          userProfile: updatedProfile,
          session,
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

  // Feature-based permission checks
  const canAccessFeature = useCallback((feature: FeatureModule): boolean => {
    if (!state.session) return false;
    return state.session.featurePermissions[feature]?.read ?? false;
  }, [state.session]);

  const canPerformAction = useCallback((feature: FeatureModule, action: keyof CRUDPermissions): boolean => {
    if (!state.session) return false;
    return state.session.featurePermissions[feature]?.[action] ?? false;
  }, [state.session]);

  const getFeaturePermissions = useCallback((feature: FeatureModule): CRUDPermissions => {
    if (!state.session) return EMPTY_CRUD_PERMISSIONS;
    return state.session.featurePermissions[feature] ?? EMPTY_CRUD_PERMISSIONS;
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
    canAccessFeature,
    canPerformAction,
    getFeaturePermissions,
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

