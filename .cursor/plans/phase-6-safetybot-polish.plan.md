# Phase 6: SafetyBot & Polish - Implementation Plan

**Phase Duration:** Weeks 17-18  
**Last Updated:** December 25, 2025  
**Status:** ✅ COMPLETED

---

## Executive Summary

Phase 6 completes the SAHTEE platform by implementing the SafetyBot AI conversational assistant, adding report generation capabilities, creating optional module placeholders, and performing final polish including performance optimization and bug fixes.

---

## Table of Contents

1. [SafetyBot Chat Interface](#1-safetybot-chat-interface)
2. [Context-Aware Responses](#2-context-aware-responses)
3. [Platform Navigation Assistance](#3-platform-navigation-assistance)
4. [Optional Modules Placeholders](#4-optional-modules-placeholders)
5. [Report Generation](#5-report-generation-pdfexcel)
6. [Performance Optimization](#6-performance-optimization)
7. [Testing & Bug Fixes](#7-testing--bug-fixes)
8. [Technical Dependencies](#8-technical-dependencies)

---

## 1. SafetyBot Chat Interface

### 1.1 Overview

SafetyBot is a transversal AI assistant accessible from anywhere in the platform via a sidebar/modal chat interface. It uses Google Gemini API to provide intelligent responses about:
- Platform usage and navigation
- HSE regulations and best practices
- Organization-specific data queries
- Report generation assistance

### 1.2 Component Architecture

```
src/components/safetybot/
├── SafetyBot.tsx              # Main container component
├── SafetybotPanel.tsx         # Sliding panel/sidebar UI
├── ChatInterface.tsx          # Chat messages display
├── ChatInput.tsx              # Message input with suggestions
├── ChatMessage.tsx            # Individual message component
├── SuggestedActions.tsx       # Quick action buttons
├── SafetybotTrigger.tsx       # Floating action button
└── index.ts                   # Exports
```

### 1.3 Tasks

| ID | Task | Priority | Estimate |
|----|------|----------|----------|
| SB-001 | Create SafetyBot container component with open/close state | High | 2h |
| SB-002 | Implement sliding panel UI (right sidebar) | High | 3h |
| SB-003 | Build chat interface with message history | High | 4h |
| SB-004 | Create chat input with send functionality | High | 2h |
| SB-005 | Add floating trigger button (visible on all pages) | High | 1h |
| SB-006 | Implement message streaming for AI responses | High | 3h |
| SB-007 | Add suggested questions based on context | Medium | 2h |
| SB-008 | Create loading/typing indicators | Medium | 1h |
| SB-009 | Persist chat history to Firestore | Medium | 2h |
| SB-010 | Add error handling and retry logic | High | 2h |

### 1.4 UI Design Specifications

- **Trigger Button:** Fixed position, bottom-right corner, emerald-500 background with chat icon
- **Panel:** 400px width, slides in from right, white background with shadow
- **Messages:**
  - User messages: Right-aligned, emerald background
  - Bot messages: Left-aligned, slate-100 background
  - Timestamps on hover
- **Input:** Fixed at bottom, with send button and quick suggestions

### 1.5 Type Definitions

```typescript
// src/types/safetybot.ts

export interface SafetyBotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: MessageSource[];
  suggestedActions?: SuggestedAction[];
  isStreaming?: boolean;
}

export interface MessageSource {
  type: 'document' | 'data' | 'regulation';
  title: string;
  link?: string;
}

export interface SuggestedAction {
  type: 'navigate' | 'create_capa' | 'schedule_audit' | 'view_document' | 'generate_report';
  label: string;
  icon?: string;
  payload: Record<string, unknown>;
}

export interface SafetyBotConversation {
  id: string;
  organizationId: string;
  userId: string;
  messages: SafetyBotMessage[];
  context: ConversationContext;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationContext {
  currentPage: string;
  userRole: string;
  organizationName: string;
  recentIncidents?: number;
  pendingCapas?: number;
  upcomingAudits?: number;
}
```

---

## 2. Context-Aware Responses

### 2.1 Overview

SafetyBot provides intelligent, context-aware responses by:
- Understanding the current page/module the user is viewing
- Accessing organization-specific data (incidents, CAPAs, compliance status)
- Maintaining conversation history for follow-up questions
- Tailoring responses to user's role and permissions

### 2.2 Implementation Approach

#### 2.2.1 Context Collection Hook

```typescript
// src/hooks/useSafetyBotContext.ts

export function useSafetyBotContext() {
  // Collects context from:
  // - Current route (location.pathname)
  // - Auth context (user role, organization)
  // - Dashboard KPIs (if available)
  // - Recent activity
}
```

#### 2.2.2 System Prompt Construction

```typescript
// src/prompts/safetyBot.ts

export const SAFETYBOT_SYSTEM_PROMPT = `
You are SafetyBot, an AI assistant for the SAHTEE platform - an HSE (Health, Safety & Environment) management system.

Your role is to:
1. Help users navigate the platform and understand its features
2. Answer questions about HSE regulations (ISO 45001, OSHA, French Code du Travail)
3. Provide guidance on best practices for workplace safety
4. Query and summarize organization data when asked
5. Suggest relevant actions based on the user's context

Current user context:
- Role: {userRole}
- Current page: {currentPage}
- Organization: {organizationName}

Organization status:
- Active incidents: {activeIncidents}
- Pending CAPAs: {pendingCapas}
- Compliance score: {complianceScore}%
- Upcoming audits: {upcomingAudits}

Always respond in French unless the user writes in another language.
Be helpful, accurate, and safety-focused.
If unsure about specific organizational data, recommend the user check the relevant module.
`;
```

### 2.3 Tasks

| ID | Task | Priority | Estimate |
|----|------|----------|----------|
| CA-001 | Create useSafetyBotContext hook | High | 3h |
| CA-002 | Build system prompt template with context injection | High | 2h |
| CA-003 | Implement Gemini API service for SafetyBot | High | 4h |
| CA-004 | Add conversation memory management | High | 3h |
| CA-005 | Create data query functions for org-specific responses | Medium | 4h |
| CA-006 | Implement response parsing for suggested actions | Medium | 2h |
| CA-007 | Add role-based response filtering | Medium | 2h |
| CA-008 | Cache organization context for performance | Low | 2h |

### 2.4 Gemini API Integration

```typescript
// src/services/safetyBotService.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

export class SafetyBotService {
  private model: GenerativeModel;
  private chat: ChatSession | null = null;

  async initializeChat(context: ConversationContext): Promise<void>;
  async sendMessage(message: string): Promise<SafetyBotMessage>;
  async streamMessage(message: string, onChunk: (chunk: string) => void): Promise<SafetyBotMessage>;
  clearHistory(): void;
}
```

---

## 3. Platform Navigation Assistance

### 3.1 Overview

SafetyBot can help users navigate the platform by:
- Answering "How do I..." questions
- Providing direct links to relevant pages
- Explaining module features and capabilities
- Offering step-by-step guidance for common tasks

### 3.2 Navigation Knowledge Base

Create a structured knowledge base for platform navigation:

```typescript
// src/data/platformKnowledge.ts

export const PLATFORM_KNOWLEDGE = {
  modules: {
    dashboard: {
      path: '/app/dashboard',
      name: '360° Board',
      description: 'Vue d\'ensemble des KPIs SST et cartographie des risques',
      features: ['KPI Banner', 'Risk Map', 'Trend Charts', 'Alert Feed'],
      actions: ['Consulter les indicateurs', 'Analyser les risques', 'Voir les alertes']
    },
    // ... other modules
  },
  actions: {
    'declare_incident': {
      steps: ['Aller dans Incidents', 'Cliquer sur "Nouvel incident"', 'Remplir le formulaire', 'Soumettre'],
      module: 'incidents'
    },
    'create_capa': {
      steps: ['Aller dans CAPA', 'Cliquer sur "Nouvelle CAPA"', 'Définir les détails', 'Assigner et planifier'],
      module: 'capa'
    },
    // ... other actions
  },
  faqs: [
    {
      question: 'Comment déclarer un incident ?',
      answer: '...',
      relatedModule: 'incidents'
    },
    // ... other FAQs
  ]
};
```

### 3.3 Tasks

| ID | Task | Priority | Estimate |
|----|------|----------|----------|
| NA-001 | Create platform knowledge base data file | High | 3h |
| NA-002 | Implement navigation action handlers | High | 2h |
| NA-003 | Add clickable links in bot responses | Medium | 2h |
| NA-004 | Create step-by-step guide renderer | Medium | 2h |
| NA-005 | Build FAQ quick-access component | Low | 2h |
| NA-006 | Implement "Take me there" action buttons | Medium | 2h |

---

## 4. Optional Modules Placeholders

### 4.1 Overview

Per PRD requirements, optional modules should be visible but non-functional in this version:
- **Impact Calculator** - Environmental impact calculations
- **Ergolab** - Ergonomic assessment tools
- **ESGreport** - ESG reporting module
- **IOT-analysis** - IoT sensor data analysis
- **Mobile App** - Native mobile application

### 4.2 Implementation Approach

Add these modules to the Settings page as "Optional Modules" section with:
- Module name and description
- Status badge: "Bientôt disponible" (Coming Soon)
- "Contacter commercial" (Contact Sales) button

### 4.3 Component Design

```tsx
// src/components/settings/OptionalModules.tsx

export function OptionalModules() {
  const modules = [
    {
      id: 'impact-calculator',
      name: 'Impact Calculator',
      description: 'Calculez l\'impact environnemental de vos activités',
      icon: Calculator,
      status: 'coming_soon'
    },
    {
      id: 'ergolab',
      name: 'Ergolab',
      description: 'Outils d\'évaluation ergonomique des postes de travail',
      icon: Armchair,
      status: 'coming_soon'
    },
    {
      id: 'esgreport',
      name: 'ESGreport',
      description: 'Génération de rapports ESG automatisés',
      icon: FileText,
      status: 'coming_soon'
    },
    {
      id: 'iot-analysis',
      name: 'IOT-analysis',
      description: 'Analyse des données capteurs IoT en temps réel',
      icon: Cpu,
      status: 'coming_soon'
    },
    {
      id: 'mobile-app',
      name: 'Application Mobile',
      description: 'Application native pour iOS et Android',
      icon: Smartphone,
      status: 'coming_soon'
    }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Modules Optionnels</CardTitle>
        <CardDescription>
          Modules supplémentaires disponibles sur demande
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Module cards with "Coming Soon" badges */}
      </CardContent>
    </Card>
  );
}
```

### 4.4 Tasks

| ID | Task | Priority | Estimate |
|----|------|----------|----------|
| OM-001 | Create OptionalModules component | Medium | 2h |
| OM-002 | Design module placeholder cards | Medium | 2h |
| OM-003 | Add to Settings page | Medium | 1h |
| OM-004 | Create "Contact Sales" modal/form | Low | 2h |
| OM-005 | Add module icons and descriptions | Low | 1h |

---

## 5. Report Generation (PDF/Excel)

### 5.1 Overview

Enable users to generate reports from the platform:
- **PDF Reports:** Formatted documents for compliance, audits, incidents
- **Excel Exports:** Data exports for analysis and record-keeping

### 5.2 Report Types

| Report Type | Format | Data Source | Module |
|-------------|--------|-------------|--------|
| Synthèse SST Mensuelle | PDF | Dashboard KPIs | 360° Board |
| Rapport d'Incident | PDF | Incident details | Incidents |
| État de Conformité | PDF/Excel | Compliance status | Conformity Room |
| Plan CAPA | PDF/Excel | CAPA list | CAPA Room |
| Bilan Santé | PDF | Health stats | Healthmeter |
| Export Incidents | Excel | Incident list | Incidents |
| Export CAPA | Excel | CAPA list | CAPA Room |
| Export Formations | Excel | Training data | Training |

### 5.3 Implementation Approach

#### 5.3.1 PDF Generation (Client-side)

Use `jspdf` + `jspdf-autotable` for PDF generation:

```typescript
// src/utils/pdfGenerator.ts

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export async function generateIncidentReport(incident: Incident): Promise<Blob>;
export async function generateMonthlyReport(data: DashboardKPI): Promise<Blob>;
export async function generateComplianceReport(norms: Norm[]): Promise<Blob>;
```

#### 5.3.2 Excel Generation (Client-side)

Use `xlsx` library for Excel exports:

```typescript
// src/utils/excelGenerator.ts

import * as XLSX from 'xlsx';

export function exportToExcel<T>(data: T[], filename: string, sheetName?: string): void;
export function exportIncidents(incidents: Incident[]): void;
export function exportCAPAs(capas: CAPA[]): void;
```

### 5.4 UI Integration

Add "Export" dropdown/buttons to relevant pages:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Exporter
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => exportPDF()}>
      <FileText className="h-4 w-4 mr-2" />
      PDF
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => exportExcel()}>
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      Excel
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 5.5 Tasks

| ID | Task | Priority | Estimate |
|----|------|----------|----------|
| RG-001 | Install jspdf, jspdf-autotable, xlsx dependencies | High | 0.5h |
| RG-002 | Create PDF generator utility with templates | High | 4h |
| RG-003 | Create Excel export utility | High | 2h |
| RG-004 | Design PDF report templates (header, footer, branding) | Medium | 3h |
| RG-005 | Add export buttons to Dashboard page | Medium | 1h |
| RG-006 | Add export buttons to Incidents page | Medium | 1h |
| RG-007 | Add export buttons to CAPA page | Medium | 1h |
| RG-008 | Add export buttons to Compliance page | Medium | 1h |
| RG-009 | Add export buttons to Health page | Medium | 1h |
| RG-010 | Create report preview modal | Low | 2h |
| RG-011 | Integrate report generation with SafetyBot | Medium | 2h |

---

## 6. Performance Optimization

### 6.1 Areas to Optimize

| Area | Current Issue | Solution | Priority |
|------|---------------|----------|----------|
| Bundle Size | Large initial bundle | Code splitting, lazy loading | High |
| Image Loading | Unoptimized images | Lazy loading, WebP format | Medium |
| API Calls | Redundant fetches | React Query caching | High |
| Rendering | Unnecessary re-renders | React.memo, useMemo | Medium |
| Firebase Reads | Too many queries | Batching, local caching | High |

### 6.2 Tasks

| ID | Task | Priority | Estimate |
|----|------|----------|----------|
| PO-001 | Implement route-based code splitting | High | 3h |
| PO-002 | Add lazy loading for heavy components | High | 2h |
| PO-003 | Optimize React Query cache settings | High | 2h |
| PO-004 | Add image lazy loading | Medium | 1h |
| PO-005 | Implement virtualization for long lists | Medium | 3h |
| PO-006 | Optimize Firestore queries with proper indexing | High | 2h |
| PO-007 | Add skeleton loaders for better perceived performance | Medium | 2h |
| PO-008 | Memoize expensive computations | Medium | 2h |
| PO-009 | Analyze and reduce bundle size with Vite | Low | 2h |
| PO-010 | Implement service worker for caching | Low | 3h |

### 6.3 Performance Metrics Targets

| Metric | Target | Measurement Tool |
|--------|--------|------------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Bundle Size (initial) | < 200KB gzipped | Vite build |

---

## 7. Testing & Bug Fixes

### 7.1 Testing Strategy

#### 7.1.1 Component Testing

Focus on critical user paths:
- Authentication flow
- Incident reporting
- CAPA creation and management
- SafetyBot conversations
- Report generation

#### 7.1.2 Integration Testing

Test module interactions:
- Incident → CAPA creation
- Audit → CAPA generation
- Health alerts → CAPA recommendations
- SafetyBot data queries

### 7.2 Tasks

| ID | Task | Priority | Estimate |
|----|------|----------|----------|
| TB-001 | Set up testing framework (Vitest + Testing Library) | High | 2h |
| TB-002 | Write tests for authentication flows | High | 3h |
| TB-003 | Write tests for SafetyBot components | High | 3h |
| TB-004 | Write tests for report generation | Medium | 2h |
| TB-005 | Perform cross-browser testing | Medium | 3h |
| TB-006 | Perform responsive design testing | Medium | 2h |
| TB-007 | Fix identified bugs (budget for unknowns) | High | 8h |
| TB-008 | Accessibility audit and fixes | Medium | 4h |
| TB-009 | Security review and fixes | High | 4h |
| TB-010 | User acceptance testing support | Medium | 4h |

### 7.3 Known Issues to Address

_(To be populated during Phase 6 execution)_

| Issue | Severity | Status | Assigned |
|-------|----------|--------|----------|
| - | - | - | - |

---

## 8. Technical Dependencies

### 8.1 New Dependencies Required

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.1",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0"
  }
}
```

### 8.2 Environment Variables

```bash
# Add to .env.local
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_ENABLE_SAFETYBOT=true
```

### 8.3 Firebase Collections

New collections for SafetyBot:

```
/conversations/{conversationId}
  - organizationId: string
  - userId: string
  - messages: SafetyBotMessage[]
  - context: ConversationContext
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

---

## Implementation Timeline

### Week 17: SafetyBot Core + Reports

| Day | Focus | Tasks |
|-----|-------|-------|
| Mon | SafetyBot UI | SB-001 to SB-005 |
| Tue | SafetyBot AI Integration | SB-006, CA-001, CA-002, CA-003 |
| Wed | Context & Memory | CA-004, CA-005, CA-006 |
| Thu | Navigation & Knowledge | NA-001 to NA-004 |
| Fri | Report Generation | RG-001 to RG-005 |

### Week 18: Polish & Testing

| Day | Focus | Tasks |
|-----|-------|-------|
| Mon | Report Integration | RG-006 to RG-011 |
| Tue | Optional Modules | OM-001 to OM-005, SB-007 to SB-010 |
| Wed | Performance | PO-001 to PO-005 |
| Thu | Performance & Testing | PO-006 to PO-010, TB-001 to TB-003 |
| Fri | Bug Fixes & Final QA | TB-004 to TB-010 |

---

## Success Criteria

### SafetyBot
- [ ] Chat interface accessible from all pages
- [ ] Streaming responses working
- [ ] Context-aware responses based on current page
- [ ] Navigation assistance functional
- [ ] Conversation history persisted

### Reports
- [ ] PDF export working for all major modules
- [ ] Excel export working for data tables
- [ ] Reports include proper branding and formatting

### Optional Modules
- [ ] All 5 optional modules displayed in Settings
- [ ] "Coming Soon" status clearly visible
- [ ] Contact sales functionality working

### Performance
- [ ] Initial load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Bundle size optimized

### Quality
- [ ] No critical bugs remaining
- [ ] Cross-browser compatibility verified
- [ ] Responsive design working on all breakpoints

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gemini API rate limits | Medium | Implement request queuing and caching |
| PDF generation performance | Low | Generate async, show progress |
| Safari compatibility issues | Medium | Test early, use polyfills if needed |
| Bundle size increase | Medium | Lazy load heavy dependencies |

---

## Notes

- SafetyBot should be disabled by default in production until Gemini API is configured
- Report generation should handle large datasets gracefully (pagination/streaming)
- Consider adding analytics for SafetyBot usage to improve responses over time

---

*Document maintained by: Development Team*  
*Next Review: End of Phase 6*
