/**
 * Firebase Admin SDK Configuration for Seed Script
 */

import * as admin from "firebase-admin";
import * as path from "path";

// Path to service account key file
const serviceAccountPath = path.resolve(
  __dirname,
  "../../sahtee-3ac27-firebase-adminsdk-fbsvc-02b6973068.json"
);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

// Collection names (matching the app's Firestore structure)
export const COLLECTIONS = {
  organizations: "organizations",
  users: "users",
  roles: "roles",
  incidents: "incidents",
  actionPlans: "actionPlans",
  trainingPlans: "trainingPlans",
  trainingRecords: "trainingRecords",
  norms: "norms",
  audits: "audits",
  healthRecords: "healthRecords",
  medicalVisits: "medicalVisits",
  exposures: "exposures",
  measurements: "measurements",
  invitations: "invitations",
  healthStats: "healthStats",
} as const;

// Demo organization constants
export const DEMO_ORG = {
  name: "TechManuf Tunisie SARL",
  legalName: "TechManuf Tunisie SARL",
  registrationNumber: "B123456789",
  sector: "manufacturing" as const,
  size: "201-500" as const,
  employeeCount: 320,
  address: {
    street: "Zone Industrielle Sidi Abdelhamid",
    city: "Sousse",
    governorate: "Sousse",
    postalCode: "4000",
    country: "Tunisia",
  },
  contact: {
    email: "contact@techmanuf.tn",
    phone: "+216 73 123 456",
    mobile: "+216 98 765 432",
  },
  website: "https://techmanuf.tn",
};

// Demo users configuration
export const DEMO_USERS = [
  {
    email: "admin@techmanuf.tn",
    password: "Demo2024!",
    firstName: "Ala",
    lastName: "Ben Aicha",
    roleName: "Org Admin",
    isOrgAdmin: true,
    jobTitle: "Directeur Général",
    phone: "+216 98 111 111",
  },
  {
    email: "qhse@techmanuf.tn",
    password: "Demo2024!",
    firstName: "Sami",
    lastName: "Trabelsi",
    roleName: "QHSE",
    isOrgAdmin: false,
    jobTitle: "Responsable QHSE",
    phone: "+216 98 222 222",
  },
  {
    email: "rh@techmanuf.tn",
    password: "Demo2024!",
    firstName: "Fatma",
    lastName: "Bouazizi",
    roleName: "RH",
    isOrgAdmin: false,
    jobTitle: "Responsable RH",
    phone: "+216 98 333 333",
  },
  {
    email: "chef@techmanuf.tn",
    password: "Demo2024!",
    firstName: "Mohamed",
    lastName: "Jebali",
    roleName: "Chef de département",
    isOrgAdmin: false,
    jobTitle: "Chef de Production",
    phone: "+216 98 444 444",
  },
  {
    email: "medecin@techmanuf.tn",
    password: "Demo2024!",
    firstName: "Leila",
    lastName: "Mansouri",
    roleName: "Médecin du travail",
    isOrgAdmin: false,
    jobTitle: "Médecin du Travail",
    phone: "+216 98 555 555",
  },
  {
    email: "employe@techmanuf.tn",
    password: "Demo2024!",
    firstName: "Ahmed",
    lastName: "Khelifi",
    roleName: "Employé",
    isOrgAdmin: false,
    jobTitle: "Opérateur Machine",
    phone: "+216 98 666 666",
  },
];

// Locations in the factory
export const LOCATIONS = [
  "Zone de Production A",
  "Zone de Production B",
  "Atelier Mécanique",
  "Atelier Électrique",
  "Entrepôt Matières Premières",
  "Entrepôt Produits Finis",
  "Zone de Chargement",
  "Laboratoire Qualité",
  "Bureaux Administratifs",
  "Cantine",
];

// Departments
export const DEPARTMENTS = [
  { name: "Production", riskLevel: "high" as const },
  { name: "Maintenance", riskLevel: "high" as const },
  { name: "Qualité", riskLevel: "medium" as const },
  { name: "Logistique", riskLevel: "medium" as const },
  { name: "Administration", riskLevel: "low" as const },
  { name: "RH", riskLevel: "low" as const },
];

export default admin;

