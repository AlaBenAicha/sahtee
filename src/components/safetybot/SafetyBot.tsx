/**
 * SafetyBot Component
 * Main container for the SafetyBot AI assistant
 */

import { useNavigate } from "react-router-dom";
import useSafetyBot from "@/hooks/useSafetyBot";
import SafetyBotTrigger from "./SafetyBotTrigger";
import SafetyBotPanel from "./SafetyBotPanel";
import type { SuggestedAction } from "@/types/safetybot";

interface SafetyBotProps {
  /** Whether to show the trigger button */
  showTrigger?: boolean;
}

export function SafetyBot({ showTrigger = true }: SafetyBotProps) {
  const navigate = useNavigate();
  const {
    isOpen,
    isLoading,
    isEnabled,
    messages,
    toggle,
    close,
    sendMessage,
    clearHistory,
    getSuggestions,
  } = useSafetyBot();

  // Don't render if SafetyBot is not enabled
  if (!isEnabled) {
    return null;
  }

  const handleActionClick = (action: SuggestedAction) => {
    // Navigate if path is provided
    if (action.path) {
      navigate(action.path);
      // Optionally close the panel after navigation
      // close();
    }

    // Handle other action types
    switch (action.type) {
      case "generate_report":
        // TODO: Trigger report generation
        console.log("Generate report action:", action);
        break;
      case "create_capa":
        navigate("/app/capa");
        break;
      case "create_incident":
        navigate("/app/incidents");
        break;
      case "schedule_audit":
        navigate("/app/compliance");
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* Panel */}
      <SafetyBotPanel
        isOpen={isOpen}
        isLoading={isLoading}
        messages={messages}
        suggestions={getSuggestions()}
        onClose={close}
        onSend={sendMessage}
        onClear={clearHistory}
        onActionClick={handleActionClick}
      />

      {/* Floating Trigger Button */}
      {showTrigger && (
        <SafetyBotTrigger isOpen={isOpen} onClick={toggle} />
      )}
    </>
  );
}

export default SafetyBot;
