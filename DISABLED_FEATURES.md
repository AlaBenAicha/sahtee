# Disabled Features for MVP Release

This document tracks features that have been temporarily disabled for the MVP release but will be re-enabled in future versions.

## Status: Disabled for MVP (v1.0)

**Date Disabled:** 2025-10-18  
**Reason:** Features not ready for initial release

---

## ✅ Integrated Features

### Training Module Integration (v1.5)

**Date Integrated:** 2025-10-18
**Status:** Training is no longer a standalone module

**Changes:**

- Training module integrated as a tab within CAPA Room
- Removed from main Dashboard sidebar
- Accessible via CAPA Room → Formation tab
- Training recommendations now linked to action plans
- All training features preserved within new structure

**Access:** Dashboard → CAPA Room → Formation tab

**Rationale:**
Integrating Formation within CAPA Room creates a unified action center where corrective actions, preventive measures, and required training are managed together. This integration enables:

- Automatic training recommendations based on incidents
- Direct linking between action plans and training requirements
- Streamlined workflow for managers
- Better tracking of training completion as part of CAPA effectiveness

**Future Enhancement:**
Equipment recommendations will also be integrated into CAPA Room, completing the transformation into a comprehensive action management center.

---

## 🔴 Disabled Modules

### 1. Mobile App Module

- **Component File:** [`src/components/modules/MobileApp.tsx`](src/components/modules/MobileApp.tsx)
- **Status:** Complete implementation, UI ready
- **Features:**
  - Incident reporting via mobile app
  - QR code scanning functionality
  - Push notifications management
  - Interactive safety quizzes
  - Offline mode support

### 2. Marketplace Module

- **Component File:** [`src/components/modules/Marketplace.tsx`](src/components/modules/Marketplace.tsx)
- **Status:** Complete implementation, UI ready
- **Features:**
  - PPE (Personal Protective Equipment) catalog
  - Ergonomic solutions marketplace
  - Neutral product recommendations
  - Product comparison tools
  - Shopping cart functionality

---

## 📝 Files Modified

### 1. Dashboard Component

**File:** [`src/components/Dashboard.tsx`](src/components/Dashboard.tsx)

**Changes Made:**

- ✅ Removed `Smartphone` and `Store` icon imports (line 19-20)
- ✅ Commented out `Marketplace` and `MobileApp` component imports (lines 33-38)
- ✅ Commented out mobile and marketplace module objects from sidebar array (lines 79-101)
- ✅ Commented out route handler cases for both modules (lines 172-186)
- ✅ Removed activity feed item mentioning mobile app incident (lines 429-444)

### 2. PlatformPreview Component

**File:** [`src/components/PlatformPreview.tsx`](src/components/PlatformPreview.tsx)

**Changes Made:**

- ✅ Removed `Smartphone` and `Store` icon imports (lines 3-5)
- ✅ Commented out Mobile App module definition (lines 39-51)
- ✅ Commented out Marketplace module definition (lines 57-69)

---

## 🔄 How to Re-enable These Features

### Step 1: Dashboard.tsx

```typescript
// 1. Uncomment the icon imports (line ~19)
import {
  // ... other imports ...
  Smartphone,  // Uncomment this
  Store,       // Uncomment this
  // ... other imports ...
} from "lucide-react";

// 2. Uncomment the component imports (lines ~33-38)
import { Marketplace } from "./modules/Marketplace";
import { MobileApp } from "./modules/MobileApp";

// 3. Uncomment the module objects in the modules array (lines ~79-101)
{
  id: "mobile",
  icon: Smartphone,
  title: "Mobile App",
  color: "text-[var(--sahtee-blue-primary)]",
},
{
  id: "marketplace",
  icon: Store,
  title: "Marketplace",
  color: "text-[var(--sahtee-blue-primary)]",
}

// 4. Uncomment the route handler cases (lines ~172-186)
case "mobile":
  return <MobileApp />;
case "marketplace":
  return <Marketplace />;
```

### Step 2: PlatformPreview.tsx

```typescript
// 1. Uncomment the icon imports (line ~3)
import {
  // ... other imports ...
  Smartphone,  // Uncomment this
  Store,       // Uncomment this
  // ... other imports ...
} from "lucide-react";

// 2. Uncomment the module definitions in the modules array (lines ~39-69)
{
  icon: Smartphone,
  title: "Application mobile / QR Code",
  description: "Application mobile pour déclaration d'incidents...",
  features: ["App mobile native", "QR codes", "Notifications push", "Mode offline"]
},
{
  icon: Store,
  title: "Marketplace SST",
  description: "Recommandations neutres d'équipements...",
  features: ["Catalogue EPI", "Recommandations", "Comparatifs neutres", "Ergonomie postes"]
}
```

---

## ✅ Testing Checklist

After re-enabling the features, verify:

- [ ] Mobile App appears in Dashboard sidebar
- [ ] Marketplace appears in Dashboard sidebar
- [ ] Clicking Mobile App loads the module correctly
- [ ] Clicking Marketplace loads the module correctly
- [ ] Mobile App appears in PlatformPreview showcase
- [ ] Marketplace appears in PlatformPreview showcase
- [ ] All module features are functional
- [ ] No console errors or TypeScript issues
- [ ] Navigation between modules works correctly

---

## 📊 Current Module Count

**Before Disabling:** 10 modules  
**After Disabling:** 8 modules

**Active Modules (MVP):**

1. 360° Board
2. Conformity Room (Audit Room)
3. CAPA Room (Action Plans)
4. Formation (Training)
5. Health Barometer (Occupational Health)
6. SafetyBot (Chemical Chatbot)
7. Impact Calculator
8. Advanced Analytics

**Disabled Modules:** 9. ~~Mobile App~~ 🔴 10. ~~Marketplace~~ 🔴

---

## 📅 Roadmap

**Target for Re-enabling:** Version 2.0  
**Dependencies:** None - modules are feature-complete  
**Blockers:** MVP validation and user feedback

---

## 🔍 Additional Notes

- The actual module implementation files ([`MobileApp.tsx`](src/components/modules/MobileApp.tsx) and [`Marketplace.tsx`](src/components/modules/Marketplace.tsx)) have been preserved and remain fully functional
- All changes were made using comment blocks marked with "DISABLED FOR MVP - Re-enable for v2.0"
- No breaking changes were introduced to other modules
- The codebase remains clean and maintainable
- Re-enabling is as simple as uncommenting the marked sections

---

**Document Last Updated:** 2025-10-18  
**Updated By:** Automated documentation during feature disable process
