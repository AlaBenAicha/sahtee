# SAHTEE Scripts

This directory contains utility scripts for the SAHTEE application.

## Demo Data Seed Script

The `seedDemoData.ts` script populates the Firestore database with realistic demo data for a manufacturing company (TechManuf Tunisie SARL).

### What Gets Created

| Entity | Count | Description |
|--------|-------|-------------|
| Organization | 1 | TechManuf Tunisie SARL (manufacturing, 320 employees) |
| Users | 6 | Admin, QHSE, RH, Chef de département, Médecin, Employé |
| Departments | 6 | Production, Maintenance, Qualité, Logistique, Administration, RH |
| Roles | 6 | Template roles with granular permissions |
| Incidents | 8 | Accidents, near-misses, unsafe conditions/acts |
| Training Plans | 5 | Safety training with employee assignments |
| Norms | 4 | ISO 45001, ISO 14001, Code du Travail, CNAM |
| Audits | 3 | Completed, in-progress, and planned audits |
| Health Records | 6 | One per user with medical history |
| Medical Visits | 10 | Mix of completed, scheduled, and missed |
| Exposures | 4 | Bruit, Poussières, Vibrations, Solvants |
| CAPA Actions | 12 | Linked to incidents, audits, and health data |

### Prerequisites

Install the required dependencies:

```bash
npm install firebase-admin ts-node --save-dev
```

### Usage

```bash
# Basic usage (will prompt for confirmation)
npx ts-node scripts/seedDemoData.ts

# Clean existing demo data and reseed
npx ts-node scripts/seedDemoData.ts --clean

# Skip confirmation prompts
npx ts-node scripts/seedDemoData.ts --force

# Clean and reseed without prompts
npx ts-node scripts/seedDemoData.ts --clean --force
```

### Demo Credentials

After running the script, you can login with any of these accounts:

| Email | Role | Password |
|-------|------|----------|
| admin@techmanuf.tn | Org Admin | Demo2024! |
| qhse@techmanuf.tn | QHSE | Demo2024! |
| rh@techmanuf.tn | RH | Demo2024! |
| chef@techmanuf.tn | Chef de département | Demo2024! |
| medecin@techmanuf.tn | Médecin du travail | Demo2024! |
| employe@techmanuf.tn | Employé | Demo2024! |

### Data Relationships

The demo data is interconnected to simulate a realistic HSE management system:

```
Incidents ──────┐
                ├──▶ CAPA Actions
Audit Findings ─┤
                │
Exposure Data ──┘
                
Health Records ◀──▶ Medical Visits
                
Training Plans ──▶ Training Records (per employee)
```

### Script Structure

```
scripts/
├── seedDemoData.ts          # Main entry point
├── seed/
│   ├── config.ts            # Firebase Admin init + constants
│   ├── utils.ts             # Helper functions
│   ├── seedOrganization.ts  # Org + Roles + Departments
│   ├── seedUsers.ts         # Firebase Auth + Firestore profiles
│   ├── seedIncidents.ts     # Incident data
│   ├── seedTraining.ts      # Training plans + records
│   ├── seedCompliance.ts    # Norms + Audits
│   ├── seedHealth.ts        # Health records, visits, exposures
│   └── seedCapa.ts          # Action plans
└── README.md                # This file
```

### Troubleshooting

**Error: Service account file not found**
- Ensure `sahtee-3ac27-firebase-adminsdk-fbsvc-02b6973068.json` exists in the project root
- Check that it has the correct permissions

**Error: User already exists**
- Use the `--clean` flag to remove existing demo users
- Or manually delete users from Firebase Console

**Error: Network issues**
- Ensure you have internet connectivity
- Check Firebase project status at https://status.firebase.google.com

### Resetting Demo Data

To start fresh:

```bash
npx ts-node scripts/seedDemoData.ts --clean --force
```

This will:
1. Delete all Firebase Auth users with demo emails
2. Delete all Firestore documents linked to the demo organization
3. Create fresh demo data

