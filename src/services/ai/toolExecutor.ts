/**
 * Tool Executor Service
 * 
 * Manages the execution of AI tools with security checks and error handling.
 * All tools are scoped to the user's organization for data security.
 */

import type {
  AITool,
  AIContext,
  ToolExecutionResult,
  FunctionCall,
} from "./types";

/**
 * Tool registry for all available AI tools
 */
class ToolRegistry {
  private tools: Map<string, AITool> = new Map();
  private toolsByCategory: Map<string, AITool[]> = new Map();

  /**
   * Register a single tool
   */
  registerTool(tool: AITool, category: string = "general"): void {
    this.tools.set(tool.name, tool);

    if (!this.toolsByCategory.has(category)) {
      this.toolsByCategory.set(category, []);
    }
    this.toolsByCategory.get(category)!.push(tool);
  }

  /**
   * Register multiple tools at once
   */
  registerTools(tools: AITool[], category: string = "general"): void {
    for (const tool of tools) {
      this.registerTool(tool, category);
    }
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): AITool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all tools
   */
  getAllTools(): AITool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): AITool[] {
    return this.toolsByCategory.get(category) || [];
  }

  /**
   * Get tools for a specific bot type
   */
  getToolsForBot(
    botType: "safetybot" | "capa_ai" | "conformity_ai" | "health_ai"
  ): AITool[] {
    switch (botType) {
      case "safetybot":
        // SafetyBot has access to all tools
        return this.getAllTools();

      case "capa_ai":
        return [
          ...this.getToolsByCategory("incident"),
          ...this.getToolsByCategory("capa"),
          ...this.getToolsByCategory("organization"),
        ];

      case "conformity_ai":
        return [
          ...this.getToolsByCategory("compliance"),
          ...this.getToolsByCategory("organization"),
        ];

      case "health_ai":
        return [
          ...this.getToolsByCategory("health"),
          ...this.getToolsByCategory("organization"),
        ];

      default:
        return [];
    }
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    this.tools.clear();
    this.toolsByCategory.clear();
  }
}

// Global tool registry
const globalRegistry = new ToolRegistry();

/**
 * Get the global tool registry
 */
export function getToolRegistry(): ToolRegistry {
  return globalRegistry;
}

/**
 * Tool executor class for handling function calls
 */
export class ToolExecutor {
  private registry: ToolRegistry;

  constructor(registry?: ToolRegistry) {
    this.registry = registry || globalRegistry;
  }

  /**
   * Execute a function call with security context
   */
  async executeTool(
    call: FunctionCall,
    context: AIContext
  ): Promise<ToolExecutionResult> {
    const tool = this.registry.getTool(call.name);

    if (!tool) {
      return {
        success: false,
        error: `Tool "${call.name}" not found`,
      };
    }

    // Validate context
    if (!context.organizationId || !context.userId) {
      return {
        success: false,
        error: "Invalid context: missing organizationId or userId",
      };
    }

    try {
      // Execute the tool with security context
      const result = await tool.execute(call.args, context);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error(`Error executing tool "${call.name}":`, error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : `Error executing ${call.name}`,
      };
    }
  }

  /**
   * Execute multiple function calls in parallel
   */
  async executeTools(
    calls: FunctionCall[],
    context: AIContext
  ): Promise<Map<string, ToolExecutionResult>> {
    const results = new Map<string, ToolExecutionResult>();

    const executions = calls.map(async (call) => {
      const result = await this.executeTool(call, context);
      return { name: call.name, result };
    });

    const completed = await Promise.all(executions);

    for (const { name, result } of completed) {
      results.set(name, result);
    }

    return results;
  }

  /**
   * Get available tools for a bot type
   */
  getAvailableTools(
    botType: "safetybot" | "capa_ai" | "conformity_ai" | "health_ai"
  ): AITool[] {
    return this.registry.getToolsForBot(botType);
  }
}

/**
 * Create a new tool executor
 */
export function createToolExecutor(registry?: ToolRegistry): ToolExecutor {
  return new ToolExecutor(registry);
}

/**
 * Default singleton executor
 */
let defaultExecutor: ToolExecutor | null = null;

export function getDefaultToolExecutor(): ToolExecutor {
  if (!defaultExecutor) {
    defaultExecutor = createToolExecutor();
  }
  return defaultExecutor;
}

// =============================================================================
// Helper functions for creating tools
// =============================================================================

/**
 * Create a tool with type safety
 */
export function createTool(config: AITool): AITool {
  return config;
}

/**
 * Create a tool that wraps an existing service function
 */
export function createServiceTool<T, R>(config: {
  name: string;
  description: string;
  parameters: AITool["parameters"];
  serviceFn: (context: AIContext, params: T) => Promise<R>;
}): AITool {
  return {
    name: config.name,
    description: config.description,
    parameters: config.parameters,
    execute: async (params, context) => {
      return config.serviceFn(context, params as T);
    },
  };
}

/**
 * Helper to create parameter schema for tools
 */
export const paramTypes = {
  string: (description: string, required = false) =>
    ({
      type: "string" as const,
      description,
      _required: required,
    }),

  number: (description: string, required = false) =>
    ({
      type: "number" as const,
      description,
      _required: required,
    }),

  boolean: (description: string, required = false) =>
    ({
      type: "boolean" as const,
      description,
      _required: required,
    }),

  enum: (description: string, values: string[], required = false) =>
    ({
      type: "string" as const,
      description,
      enum: values,
      _required: required,
    }),

  array: (description: string, itemType: "string" | "number" | "object") =>
    ({
      type: "array" as const,
      description,
      items: { type: itemType },
    }),
};

/**
 * Build a parameter schema from a definition object
 */
export function buildParameterSchema(
  params: Record<
    string,
    {
      type: "string" | "number" | "boolean" | "array" | "object";
      description?: string;
      enum?: string[];
      items?: { type: "string" | "number" | "object" };
      _required?: boolean;
    }
  >
): AITool["parameters"] {
  const properties: AITool["parameters"]["properties"] = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    const { _required, ...schema } = value;
    properties[key] = schema;
    if (_required) {
      required.push(key);
    }
  }

  return {
    type: "object",
    properties,
    required: required.length > 0 ? required : undefined,
  };
}

