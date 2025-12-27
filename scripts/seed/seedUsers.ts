/**
 * Seed Users with Firebase Auth and Firestore Profiles
 */

import { auth, db, COLLECTIONS, DEMO_USERS } from "./config";
import { now, createAuditInfo, log } from "./utils";

interface UserSeedResult {
  userId: string;
  email: string;
  displayName: string;
  roleId: string;
  roleName: string;
}

/**
 * Delete existing auth users by email
 */
export async function cleanupAuthUsers(): Promise<void> {
  log("Cleaning up existing auth users...", "warn");

  for (const userData of DEMO_USERS) {
    try {
      const user = await auth.getUserByEmail(userData.email);
      await auth.deleteUser(user.uid);
      log(`Deleted auth user: ${userData.email}`, "info");
    } catch (error: unknown) {
      // User doesn't exist, that's fine
      if ((error as { code?: string }).code !== "auth/user-not-found") {
        console.error(`Error deleting user ${userData.email}:`, error);
      }
    }
  }
}

/**
 * Seed demo users
 */
export async function seedUsers(
  organizationId: string,
  roleIds: Record<string, string>,
  departmentIds: Record<string, string>
): Promise<UserSeedResult[]> {
  log("Creating demo users...");

  const results: UserSeedResult[] = [];
  const timestamp = now();

  // Map users to departments
  const userDepartmentMap: Record<string, string> = {
    "admin@techmanuf.tn": "Administration",
    "qhse@techmanuf.tn": "Qualité",
    "rh@techmanuf.tn": "RH",
    "chef@techmanuf.tn": "Production",
    "medecin@techmanuf.tn": "Administration",
    "employe@techmanuf.tn": "Production",
  };

  for (const userData of DEMO_USERS) {
    try {
      // Create Firebase Auth user
      const displayName = `${userData.firstName} ${userData.lastName}`;
      
      const authUser = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName,
        emailVerified: true, // Pre-verify for demo
      });

      const userId = authUser.uid;
      const roleId = roleIds[userData.roleName];
      const departmentName = userDepartmentMap[userData.email];
      const departmentId = departmentIds[departmentName] || "";

      // Create Firestore user profile
      const userProfile = {
        uid: userId,
        email: userData.email,
        displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        organizationId,
        role: userData.isOrgAdmin ? "org_admin" : "user",
        roleId,
        isOrgAdmin: userData.isOrgAdmin,
        departmentId,
        jobTitle: userData.jobTitle,
        phone: userData.phone,
        status: "active",
        emailVerified: true,
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
            widgets: ["incidents", "capa", "compliance", "health"],
            refreshInterval: 5,
          },
        },
        onboardingCompleted: true,
        onboardingStep: 6,
        createdAt: timestamp,
        updatedAt: timestamp,
        audit: createAuditInfo(userId),
      };

      await db.collection(COLLECTIONS.users).doc(userId).set(userProfile);

      results.push({
        userId,
        email: userData.email,
        displayName,
        roleId,
        roleName: userData.roleName,
      });

      log(`Created user: ${displayName} (${userData.email}) - ${userData.roleName}`, "success");
    } catch (error) {
      log(`Error creating user ${userData.email}: ${error}`, "error");
      throw error;
    }
  }

  return results;
}

/**
 * Get user ID by role name
 */
export function getUserByRole(users: UserSeedResult[], roleName: string): UserSeedResult | undefined {
  return users.find((u) => u.roleName === roleName);
}

/**
 * Get user ID by email
 */
export function getUserByEmail(users: UserSeedResult[], email: string): UserSeedResult | undefined {
  return users.find((u) => u.email === email);
}

