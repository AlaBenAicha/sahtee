/**
 * AI Tools Index
 * 
 * Central registry for all AI data access tools.
 */

import type { AITool, AIBotType } from "../types";
import { getToolRegistry } from "../toolExecutor";

// Import tool collections
import { incidentTools } from "./incidentTools";
import { capaTools } from "./capaTools";
import { complianceTools } from "./complianceTools";
import { healthTools } from "./healthTools";
import { organizationTools } from "./organizationTools";

/**
 * Register all tools with the global registry
 */
export function registerAllTools(): void {
    const registry = getToolRegistry();

    // Clear any existing tools
    registry.clear();

    // Register by category
    registry.registerTools(incidentTools, "incident");
    registry.registerTools(capaTools, "capa");
    registry.registerTools(complianceTools, "compliance");
    registry.registerTools(healthTools, "health");
    registry.registerTools(organizationTools, "organization");
}

/**
 * Get all tools for a specific AI bot type
 */
export function getToolsForBot(botType: AIBotType): AITool[] {
    switch (botType) {
        case "safetybot":
            // SafetyBot has access to all tools
            return [
                ...organizationTools,
                ...incidentTools,
                ...capaTools,
                ...complianceTools,
                ...healthTools,
            ];

        case "capa_ai":
            // CAPA-AI focuses on incidents and CAPAs
            return [
                ...incidentTools,
                ...capaTools,
                ...organizationTools.filter(t =>
                    ["get_dashboard_stats", "get_alerts"].includes(t.name)
                ),
            ];

        case "conformity_ai":
            // Conformity-AI focuses on compliance
            return [
                ...complianceTools,
                ...organizationTools.filter(t =>
                    ["get_dashboard_stats", "get_alerts"].includes(t.name)
                ),
            ];

        case "health_ai":
            // Health-AI focuses on health data (non-PHI)
            return [
                ...healthTools,
                ...organizationTools.filter(t =>
                    ["get_dashboard_stats", "get_alerts"].includes(t.name)
                ),
            ];

        default:
            return [];
    }
}

/**
 * Get a specific tool by name
 */
export function getToolByName(name: string): AITool | undefined {
    const allTools = [
        ...incidentTools,
        ...capaTools,
        ...complianceTools,
        ...healthTools,
        ...organizationTools,
    ];

    return allTools.find(tool => tool.name === name);
}

/**
 * Get all available tools
 */
export function getAllTools(): AITool[] {
    return [
        ...organizationTools,
        ...incidentTools,
        ...capaTools,
        ...complianceTools,
        ...healthTools,
    ];
}

// Re-export individual tool collections
export { incidentTools } from "./incidentTools";
export { capaTools } from "./capaTools";
export { complianceTools } from "./complianceTools";
export { healthTools } from "./healthTools";
export { organizationTools } from "./organizationTools";

