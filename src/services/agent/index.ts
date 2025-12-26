/**
 * Agent Services
 * Services for the SafetyBot Agent Mode
 */

export { 
  canAgentExecuteAction,
  isPathBlocked,
  isSelectorBlocked,
  hasFeaturePermission,
  actionRequiresConfirmation,
  getPermissionErrorMessage,
  validateActionBatch,
  getAvailableFeatures,
  isElementBlocked,
  BLOCKED_PATHS,
  BLOCKED_SELECTORS,
  AGENT_BLOCK_ATTRIBUTE,
} from "./agentPermissions";

export {
  ACTION_REGISTRY,
  getModuleActions,
  getAction,
  createActionFromTemplate,
  getAllActionTemplates,
  getNavigationActions,
  findActionByTarget,
  dashboardActions,
  incidentActions,
  capaActions,
  trainingActions,
  complianceActions,
  healthActions,
  analyticsActions,
  type ActionModule,
} from "./actionRegistry";

export {
  executeAction,
  executeActionSequence,
  waitForElement,
  highlightElement,
  unhighlightElement,
  clearAllHighlights,
  scrollToElement,
  simulateTyping,
  setInputValue,
  clickElement,
  selectOption,
  toggleElement,
  injectHighlightStyles,
} from "./actionExecutor";

