/**
 * SafetyBot Trigger Button
 * Floating action button to open SafetyBot
 */

import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafetyBotTriggerProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function SafetyBotTrigger({ isOpen, onClick, className }: SafetyBotTriggerProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300",
        "bg-emerald-500 hover:bg-emerald-600 text-white",
        "hover:scale-105 active:scale-95",
        isOpen && "bg-slate-600 hover:bg-slate-700",
        className
      )}
      aria-label={isOpen ? "Fermer SafetyBot" : "Ouvrir SafetyBot"}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <MessageCircle className="h-6 w-6" />
      )}
    </Button>
  );
}

export default SafetyBotTrigger;
