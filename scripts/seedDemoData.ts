#!/usr/bin/env npx ts-node

/**
 * SAHTEE Demo Data Seed Script
 * 
 * This script populates the Firestore database with realistic demo data
 * for a manufacturing company (TechManuf Tunisie).
 * 
 * Usage:
 *   npx ts-node scripts/seedDemoData.ts
 * 
 * Options:
 *   --clean    Clean up existing demo data before seeding
 *   --force    Skip confirmation prompts
 */

import * as readline from "readline";
import { log, logSection, sleep } from "./seed/utils";
import { checkExistingOrg, cleanupExistingData, seedOrganization } from "./seed/seedOrganization";
import { cleanupAuthUsers, seedUsers } from "./seed/seedUsers";
import { seedIncidents } from "./seed/seedIncidents";
import { seedTraining } from "./seed/seedTraining";
import { seedCompliance } from "./seed/seedCompliance";
import { seedHealth } from "./seed/seedHealth";
import { seedCapa } from "./seed/seedCapa";
import { DEMO_USERS } from "./seed/config";

// Parse command line arguments
const args = process.argv.slice(2);
const shouldClean = args.includes("--clean");
const forceMode = args.includes("--force");

/**
 * Prompt user for confirmation
 */
async function confirm(message: string): Promise<boolean> {
  if (forceMode) return true;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

/**
 * Print summary banner
 */
function printBanner(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🏭  SAHTEE Demo Data Seed Script                            ║
║                                                               ║
║   This script will create demo data for:                      ║
║   • Organization: TechManuf Tunisie SARL                      ║
║   • 6 Users with different roles                              ║
║   • 8 Incidents                                               ║
║   • 5 Training Plans                                          ║
║   • 4 Compliance Norms + 3 Audits                             ║
║   • Health Records, Visits, and Exposures                     ║
║   • 12 CAPA Actions                                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
}

/**
 * Print final summary with credentials
 */
function printSummary(
  organizationId: string,
  stats: {
    users: number;
    incidents: number;
    trainings: number;
    norms: number;
    audits: number;
    healthRecords: number;
    medicalVisits: number;
    exposures: number;
    capas: number;
  }
): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    ✅ SEEDING COMPLETE!                       ║
╚═══════════════════════════════════════════════════════════════╝

📊 Data Summary:
────────────────
  Organization ID: ${organizationId}
  
  Users:           ${stats.users}
  Incidents:       ${stats.incidents}
  Training Plans:  ${stats.trainings}
  Norms:           ${stats.norms}
  Audits:          ${stats.audits}
  Health Records:  ${stats.healthRecords}
  Medical Visits:  ${stats.medicalVisits}
  Exposures:       ${stats.exposures}
  CAPA Actions:    ${stats.capas}

🔐 Demo User Credentials:
────────────────────────
  Password for all accounts: Demo2024!

`);

  console.log("  ┌────────────────────────────┬──────────────────────────┐");
  console.log("  │ Email                      │ Role                     │");
  console.log("  ├────────────────────────────┼──────────────────────────┤");
  for (const user of DEMO_USERS) {
    const email = user.email.padEnd(26);
    const role = user.roleName.padEnd(24);
    console.log(`  │ ${email} │ ${role} │`);
  }
  console.log("  └────────────────────────────┴──────────────────────────┘");

  console.log(`
💡 Next Steps:
─────────────
  1. Open the app: http://localhost:5173
  2. Login with: admin@techmanuf.tn / Demo2024!
  3. Explore all modules with realistic demo data

🔥 Firebase Console:
  https://console.firebase.google.com/project/sahtee-3ac27/firestore

`);
}

/**
 * Main seeding function
 */
async function main(): Promise<void> {
  printBanner();

  try {
    // Check for existing demo organization
    const existingOrgId = await checkExistingOrg();

    if (existingOrgId) {
      log(`Found existing demo organization: ${existingOrgId}`, "warn");
      
      if (shouldClean) {
        const confirmed = await confirm("Do you want to clean up existing data and reseed?");
        if (!confirmed) {
          log("Aborted by user", "warn");
          process.exit(0);
        }
        await cleanupExistingData(existingOrgId);
        await cleanupAuthUsers();
      } else {
        log("Use --clean flag to remove existing data first", "info");
        log("Exiting without changes", "info");
        process.exit(0);
      }
    }

    // Confirm before proceeding
    if (!forceMode) {
      const confirmed = await confirm("Do you want to proceed with seeding demo data?");
      if (!confirmed) {
        log("Aborted by user", "warn");
        process.exit(0);
      }
    }

    logSection("Step 1: Creating Users");
    
    // We need to create users first to get their IDs
    // For the organization creation, we'll use a temporary admin ID
    const tempAdminId = "temp-admin-" + Date.now();
    
    // Clean up any existing auth users
    await cleanupAuthUsers();
    await sleep(1000);

    logSection("Step 2: Creating Organization & Roles");
    
    // First pass: create org with temp ID
    const { organizationId, roleIds, departmentIds } = await seedOrganization(tempAdminId);

    logSection("Step 3: Creating Users with Firebase Auth");
    
    // Create users with proper organization ID
    const users = await seedUsers(organizationId, roleIds, departmentIds);
    
    // Update organization with real admin ID
    const adminUser = users.find((u) => u.roleName === "Org Admin");
    if (adminUser) {
      const { db, COLLECTIONS } = await import("./seed/config");
      await db.collection(COLLECTIONS.organizations).doc(organizationId).update({
        "audit.createdBy": adminUser.userId,
        "audit.updatedBy": adminUser.userId,
      });
    }

    logSection("Step 4: Creating Incidents");
    
    const usersForSeeding = users.map((u) => ({
      userId: u.userId,
      roleName: u.roleName,
      displayName: u.displayName,
    }));
    
    const incidents = await seedIncidents(organizationId, usersForSeeding, departmentIds);

    logSection("Step 5: Creating Training Plans");
    
    const trainings = await seedTraining(organizationId, usersForSeeding, departmentIds);

    logSection("Step 6: Creating Compliance Data");
    
    const compliance = await seedCompliance(organizationId, usersForSeeding);

    logSection("Step 7: Creating Health Data");
    
    const healthResult = await seedHealth(organizationId, usersForSeeding, departmentIds);

    logSection("Step 8: Creating CAPA Actions");
    
    const capas = await seedCapa(organizationId, usersForSeeding, incidents, compliance);

    // Print final summary
    printSummary(organizationId, {
      users: users.length,
      incidents: incidents.length,
      trainings: trainings.length,
      norms: compliance.norms.length,
      audits: compliance.audits.length,
      healthRecords: healthResult.healthRecordCount,
      medicalVisits: healthResult.medicalVisitCount,
      exposures: healthResult.exposureCount,
      capas: capas.length,
    });

    process.exit(0);
  } catch (error) {
    log(`Fatal error: ${error}`, "error");
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main();

