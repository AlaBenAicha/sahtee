/**
 * Action Executor
 * 
 * Executes agent actions with visual feedback and error handling.
 * Provides DOM interaction utilities for the agent.
 */

import type { AgentAction, AgentActionResult } from "@/types/agent";

// =============================================================================
// Configuration
// =============================================================================

/** Delay between highlighting and action (ms) */
const HIGHLIGHT_DELAY = 400;

/** Delay after action completion (ms) */
const POST_ACTION_DELAY = 200;

/** Maximum wait time for element (ms) */
const ELEMENT_WAIT_TIMEOUT = 5000;

/** CSS class for highlighted elements */
const HIGHLIGHT_CLASS = "agent-highlight";

// =============================================================================
// Highlight Styles
// =============================================================================

/**
 * Inject highlight styles into document
 */
export function injectHighlightStyles(): void {
  if (document.getElementById("agent-highlight-styles")) return;

  const style = document.createElement("style");
  style.id = "agent-highlight-styles";
  style.textContent = `
    .${HIGHLIGHT_CLASS} {
      outline: 3px solid #10b981 !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.5) !important;
      transition: all 0.3s ease !important;
      animation: agent-pulse 1s ease-in-out infinite !important;
    }
    
    @keyframes agent-pulse {
      0%, 100% {
        outline-color: #10b981;
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
      }
      50% {
        outline-color: #34d399;
        box-shadow: 0 0 30px rgba(52, 211, 153, 0.7);
      }
    }
  `;
  document.head.appendChild(style);
}

// =============================================================================
// DOM Utilities
// =============================================================================

/**
 * Find an element using a selector that may include :has-text() patterns
 * Converts Playwright-style selectors to standard DOM queries
 */
function findElement(selector: string): Element | null {
  // Handle :has-text() pattern (Playwright-style selector)
  const hasTextMatch = selector.match(/^(\w+):has-text\("([^"]+)"\)$/);
  if (hasTextMatch) {
    const [, tagName, text] = hasTextMatch;
    const elements = document.querySelectorAll(tagName);
    for (const el of elements) {
      if (el.textContent?.includes(text)) {
        return el;
      }
    }
    return null;
  }

  // Handle multiple selectors separated by comma (try each one)
  if (selector.includes(",")) {
    const selectors = selector.split(",").map((s) => s.trim());
    for (const sel of selectors) {
      const element = findElement(sel);
      if (element) return element;
    }
    return null;
  }

  // Standard CSS selector
  try {
    return document.querySelector(selector);
  } catch {
    console.warn(`[ActionExecutor] Invalid selector: ${selector}`);
    return null;
  }
}

/**
 * Wait for an element to appear in the DOM
 */
export async function waitForElement(
  selector: string,
  timeout: number = ELEMENT_WAIT_TIMEOUT
): Promise<Element | null> {
  return new Promise((resolve) => {
    // Check if element already exists (using findElement for text selectors)
    const existing = findElement(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    // Set up observer for standard selectors only
    // For :has-text() selectors, we poll instead
    const hasTextPattern = /^(\w+):has-text\("([^"]+)"\)$/;
    if (hasTextPattern.test(selector)) {
      // Poll for element
      const startTime = Date.now();
      const poll = () => {
        const element = findElement(selector);
        if (element) {
          resolve(element);
          return;
        }
        if (Date.now() - startTime < timeout) {
          setTimeout(poll, 100);
        } else {
          resolve(null);
        }
      };
      poll();
      return;
    }

    // Standard observer for CSS selectors
    const observer = new MutationObserver(() => {
      const element = findElement(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Timeout
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Highlight an element
 */
export function highlightElement(element: Element): void {
  injectHighlightStyles();
  element.classList.add(HIGHLIGHT_CLASS);
}

/**
 * Remove highlight from element
 */
export function unhighlightElement(element: Element): void {
  element.classList.remove(HIGHLIGHT_CLASS);
}

/**
 * Remove all highlights
 */
export function clearAllHighlights(): void {
  document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
    el.classList.remove(HIGHLIGHT_CLASS);
  });
}

/**
 * Scroll element into view
 */
export function scrollToElement(element: Element): void {
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center",
  });
}

/**
 * Simulate typing in an input
 */
export async function simulateTyping(
  input: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  delay: number = 30
): Promise<void> {
  input.focus();
  input.value = "";

  for (const char of text) {
    input.value += char;
    
    // Trigger input event
    input.dispatchEvent(new Event("input", { bubbles: true }));
    
    await new Promise((r) => setTimeout(r, delay));
  }

  // Trigger change event at the end
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Set input value directly (faster than simulateTyping)
 */
export function setInputValue(
  input: HTMLInputElement | HTMLTextAreaElement,
  value: string
): void {
  input.focus();
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Click an element
 */
export function clickElement(element: Element): void {
  if (element instanceof HTMLElement) {
    element.click();
  } else {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
}

/**
 * Select option in a select element
 */
export function selectOption(select: HTMLSelectElement, value: string): void {
  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Toggle checkbox/switch
 */
export function toggleElement(element: HTMLInputElement): void {
  element.checked = !element.checked;
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

// =============================================================================
// Action Executor
// =============================================================================

/**
 * Execute a single agent action
 */
export async function executeAction(
  action: AgentAction,
  onHighlight?: (selector: string | null) => void
): Promise<AgentActionResult> {
  try {
    switch (action.type) {
      case "navigate": {
        // Navigation is handled by the router in AgentContext
        // This executor handles DOM-level actions
        return { success: true, action };
      }

      case "click": {
        const element = await waitForElement(action.target);
        if (!element) {
          return { 
            success: false, 
            action, 
            error: `Élément non trouvé: ${action.target}` 
          };
        }

        // Highlight and scroll
        scrollToElement(element);
        highlightElement(element);
        onHighlight?.(action.target);
        await delay(HIGHLIGHT_DELAY);

        // Click
        clickElement(element);
        await delay(POST_ACTION_DELAY);

        // Cleanup
        unhighlightElement(element);
        onHighlight?.(null);

        return { success: true, action };
      }

      case "fill_input": {
        const input = await waitForElement(action.target);
        if (!input || !(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) {
          return { 
            success: false, 
            action, 
            error: `Champ non trouvé: ${action.target}` 
          };
        }

        // Highlight and scroll
        scrollToElement(input);
        highlightElement(input);
        onHighlight?.(action.target);
        await delay(HIGHLIGHT_DELAY);

        // Fill value
        const value = String(action.params?.value ?? "");
        const useTyping = action.params?.simulateTyping === true;
        
        if (useTyping) {
          await simulateTyping(input, value);
        } else {
          setInputValue(input, value);
        }

        await delay(POST_ACTION_DELAY);

        // Cleanup
        unhighlightElement(input);
        onHighlight?.(null);

        return { success: true, action };
      }

      case "select_option": {
        const select = await waitForElement(action.target);
        if (!select || !(select instanceof HTMLSelectElement)) {
          return { 
            success: false, 
            action, 
            error: `Sélecteur non trouvé: ${action.target}` 
          };
        }

        // Highlight and scroll
        scrollToElement(select);
        highlightElement(select);
        onHighlight?.(action.target);
        await delay(HIGHLIGHT_DELAY);

        // Select option
        const value = String(action.params?.value ?? "");
        selectOption(select, value);

        await delay(POST_ACTION_DELAY);

        // Cleanup
        unhighlightElement(select);
        onHighlight?.(null);

        return { success: true, action };
      }

      case "toggle": {
        const toggle = await waitForElement(action.target);
        if (!toggle) {
          return { 
            success: false, 
            action, 
            error: `Toggle non trouvé: ${action.target}` 
          };
        }

        // Highlight and scroll
        scrollToElement(toggle);
        highlightElement(toggle);
        onHighlight?.(action.target);
        await delay(HIGHLIGHT_DELAY);

        // Toggle
        if (toggle instanceof HTMLInputElement) {
          toggleElement(toggle);
        } else {
          clickElement(toggle);
        }

        await delay(POST_ACTION_DELAY);

        // Cleanup
        unhighlightElement(toggle);
        onHighlight?.(null);

        return { success: true, action };
      }

      case "scroll": {
        const element = await waitForElement(action.target);
        if (!element) {
          return { 
            success: false, 
            action, 
            error: `Élément non trouvé: ${action.target}` 
          };
        }

        scrollToElement(element);
        await delay(300);

        return { success: true, action };
      }

      case "search": {
        const searchInput = await waitForElement(action.target);
        if (!searchInput || !(searchInput instanceof HTMLInputElement)) {
          return { 
            success: false, 
            action, 
            error: `Champ de recherche non trouvé: ${action.target}` 
          };
        }

        // Highlight and scroll
        scrollToElement(searchInput);
        highlightElement(searchInput);
        onHighlight?.(action.target);
        await delay(HIGHLIGHT_DELAY);

        // Enter search query
        const query = String(action.params?.query ?? "");
        setInputValue(searchInput, query);

        // Submit search (press Enter)
        searchInput.dispatchEvent(new KeyboardEvent("keydown", { 
          key: "Enter", 
          bubbles: true 
        }));

        await delay(POST_ACTION_DELAY);

        // Cleanup
        unhighlightElement(searchInput);
        onHighlight?.(null);

        return { success: true, action };
      }

      case "filter": {
        const filterElement = await waitForElement(action.target);
        if (!filterElement) {
          return { 
            success: false, 
            action, 
            error: `Filtre non trouvé: ${action.target}` 
          };
        }

        // Highlight and scroll
        scrollToElement(filterElement);
        highlightElement(filterElement);
        onHighlight?.(action.target);
        await delay(HIGHLIGHT_DELAY);

        // Handle different filter types
        if (filterElement instanceof HTMLSelectElement) {
          const value = String(action.params?.value ?? "");
          selectOption(filterElement, value);
        } else {
          clickElement(filterElement);
        }

        await delay(POST_ACTION_DELAY);

        // Cleanup
        unhighlightElement(filterElement);
        onHighlight?.(null);

        return { success: true, action };
      }

      case "submit_form": {
        const form = await waitForElement(action.target);
        if (form && form instanceof HTMLFormElement) {
          highlightElement(form);
          onHighlight?.(action.target);
          await delay(HIGHLIGHT_DELAY);

          form.requestSubmit();
          
          await delay(POST_ACTION_DELAY);
          unhighlightElement(form);
          onHighlight?.(null);

          return { success: true, action };
        }

        // Try to find submit button
        const submitBtn = await waitForElement(
          `${action.target} button[type="submit"], ${action.target} input[type="submit"]`
        );
        if (submitBtn) {
          highlightElement(submitBtn);
          onHighlight?.(action.target);
          await delay(HIGHLIGHT_DELAY);

          clickElement(submitBtn);
          
          await delay(POST_ACTION_DELAY);
          unhighlightElement(submitBtn);
          onHighlight?.(null);

          return { success: true, action };
        }

        return { 
          success: false, 
          action, 
          error: `Formulaire non trouvé: ${action.target}` 
        };
      }

      case "wait": {
        const duration = Number(action.params?.duration) || 1000;
        await delay(duration);
        return { success: true, action };
      }

      case "switch_tab": {
        const tab = await waitForElement(action.target);
        if (!tab) {
          return { 
            success: false, 
            action, 
            error: `Onglet non trouvé: ${action.target}` 
          };
        }

        highlightElement(tab);
        onHighlight?.(action.target);
        await delay(HIGHLIGHT_DELAY);

        clickElement(tab);

        await delay(POST_ACTION_DELAY);
        unhighlightElement(tab);
        onHighlight?.(null);

        return { success: true, action };
      }

      case "open_modal":
      case "close_modal":
      case "expand_collapse": {
        const element = await waitForElement(action.target);
        if (!element) {
          return { 
            success: false, 
            action, 
            error: `Élément non trouvé: ${action.target}` 
          };
        }

        highlightElement(element);
        onHighlight?.(action.target);
        await delay(HIGHLIGHT_DELAY);

        clickElement(element);

        await delay(POST_ACTION_DELAY);
        unhighlightElement(element);
        onHighlight?.(null);

        return { success: true, action };
      }

      default: {
        return { 
          success: false, 
          action, 
          error: `Type d'action non supporté: ${action.type}` 
        };
      }
    }
  } catch (error) {
    clearAllHighlights();
    onHighlight?.(null);
    
    return {
      success: false,
      action,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Execute multiple actions in sequence
 */
export async function executeActionSequence(
  actions: AgentAction[],
  onProgress?: (completed: number, total: number) => void,
  onHighlight?: (selector: string | null) => void,
  shouldAbort?: () => boolean
): Promise<AgentActionResult[]> {
  const results: AgentActionResult[] = [];

  for (let i = 0; i < actions.length; i++) {
    // Check if we should abort
    if (shouldAbort?.()) {
      break;
    }

    const result = await executeAction(actions[i], onHighlight);
    results.push(result);

    onProgress?.(i + 1, actions.length);

    // Stop on failure
    if (!result.success) {
      break;
    }

    // Delay between actions
    await delay(100);
  }

  clearAllHighlights();
  return results;
}

// =============================================================================
// Utilities
// =============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

