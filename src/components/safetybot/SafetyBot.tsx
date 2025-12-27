/**
 * SafetyBot Component
 * Main container for the SafetyBot AI assistant with session management
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSafetyBot from "@/hooks/useSafetyBot";
import SafetyBotTrigger from "./SafetyBotTrigger";
import SafetyBotPanel from "./SafetyBotPanel";
import { createAssistantMessage } from "@/services/safetyBotService";
import { toast } from "sonner";
import type { SuggestedAction } from "@/types/safetybot";

// Fallback message when AI is not configured
const FALLBACK_MESSAGE = `👋 Bienvenue sur SafetyBot !

Je suis votre assistant IA dédié à la santé et sécurité au travail. Actuellement, le service IA n'est pas configuré.

**Pour activer SafetyBot :**
Configurez la variable d'environnement \`VITE_GEMINI_API_KEY\` avec votre clé API Gemini.

En attendant, voici comment je peux vous aider une fois activé :
- 📊 Analyser vos indicateurs SST
- 📋 Vous guider dans la création de CAPA
- 🔍 Répondre à vos questions sur la conformité
- 📅 Suivre vos formations et audits`;

interface SafetyBotProps {
  /** Whether to show the trigger button */
  showTrigger?: boolean;
}

export function SafetyBot({ showTrigger = true }: SafetyBotProps) {
  const navigate = useNavigate();
  const [fallbackPanelOpen, setFallbackPanelOpen] = useState(false);
  
  const {
    isOpen,
    isLoading,
    isEnabled,
    isInitializing,
    messages,
    toggle,
    close,
    sendMessage,
    clearHistory,
    getSuggestions,
    // Session management
    currentSessionId,
    sessions,
    isSessionsLoading,
    createNewSession,
    switchSession,
    archiveCurrentSession,
    deleteSession,
    // Agent mode
    mode,
    thinking,
    isThinking,
    setMode,
    pendingActions,
    clearPendingActions,
  } = useSafetyBot();

  // Fallback messages when AI is not configured
  const fallbackMessages = [createAssistantMessage(FALLBACK_MESSAGE)];

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
        // Navigate to dashboard with report generation flag
        toast.info("Génération du rapport", {
          description: "Vous allez être redirigé vers le tableau de bord pour générer le rapport.",
        });
        navigate("/app/dashboard?generateReport=true");
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

  // If AI is not enabled, show a simplified panel with fallback message
  if (!isEnabled) {
    return (
      <>
        {/* Fallback Panel */}
        <SafetyBotPanel
          isOpen={fallbackPanelOpen}
          isLoading={false}
          messages={fallbackMessages}
          suggestions={[]}
          onClose={() => setFallbackPanelOpen(false)}
          onSend={() => {}} // No-op when AI is not configured
          onClear={() => {}}
          onActionClick={handleActionClick}
        />

        {/* Floating Trigger Button - Hidden when panel is open */}
        {showTrigger && !fallbackPanelOpen && (
          <SafetyBotTrigger 
            isOpen={fallbackPanelOpen} 
            onClick={() => setFallbackPanelOpen(!fallbackPanelOpen)} 
          />
        )}
      </>
    );
  }

  return (
    <>
      {/* Panel */}
      <SafetyBotPanel
        isOpen={isOpen}
        isLoading={isLoading || isInitializing}
        messages={messages}
        suggestions={getSuggestions()}
        onClose={close}
        onSend={sendMessage}
        onClear={clearHistory}
        onActionClick={handleActionClick}
        // Session management props
        currentSessionId={currentSessionId}
        sessions={sessions}
        isSessionsLoading={isSessionsLoading}
        onNewSession={createNewSession}
        onSwitchSession={switchSession}
        onArchiveSession={archiveCurrentSession}
        onDeleteSession={deleteSession}
        // Agent mode props
        mode={mode}
        onModeChange={setMode}
        thinking={thinking}
        isThinking={isThinking}
        // Agent actions props
        pendingActions={pendingActions}
        onClearPendingActions={clearPendingActions}
      />

      {/* Floating Trigger Button - Hidden when panel is open */}
      {showTrigger && !isOpen && (
        <SafetyBotTrigger isOpen={isOpen} onClick={toggle} />
      )}
    </>
  );
}

export default SafetyBot;
