/**
 * Quick Actions Component
 * 
 * Provides quick access to common actions from the 360° Board.
 * Actions per PRD: Incident, CAPA, Training, Audit, Report
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckSquare,
  GraduationCap,
  ClipboardCheck,
  FileText,
  Plus,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
  hoverColor: string;
}

const quickActions: QuickAction[] = [
  {
    id: "incident",
    label: "Déclarer un incident",
    description: "Signaler un nouvel incident de sécurité",
    icon: AlertTriangle,
    href: "/incidents?action=new",
    color: "text-red-600",
    bgColor: "bg-red-100",
    hoverColor: "hover:bg-red-200",
  },
  {
    id: "capa",
    label: "Créer une action CAPA",
    description: "Nouvelle action corrective ou préventive",
    icon: CheckSquare,
    href: "/capa?action=new",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    hoverColor: "hover:bg-blue-200",
  },
  {
    id: "training",
    label: "Planifier une formation",
    description: "Programmer une session de formation",
    icon: GraduationCap,
    href: "/training?action=new",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    hoverColor: "hover:bg-purple-200",
  },
  {
    id: "audit",
    label: "Lancer un audit",
    description: "Démarrer une vérification de conformité",
    icon: ClipboardCheck,
    href: "/compliance?action=new",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    hoverColor: "hover:bg-amber-200",
  },
  {
    id: "report",
    label: "Générer un rapport",
    description: "Créer un rapport d'analyse",
    icon: FileText,
    href: "/analytics?action=report",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    hoverColor: "hover:bg-emerald-200",
  },
];

interface QuickActionsProps {
  className?: string;
  variant?: "grid" | "inline" | "compact";
}

/**
 * Quick Actions Component - Grid Layout
 */
export function QuickActions({ className, variant = "grid" }: QuickActionsProps) {
  const navigate = useNavigate();

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {quickActions.slice(0, 3).map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => navigate(action.href)}
            className="gap-2"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex gap-3 overflow-x-auto pb-2", className)}>
        {quickActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            onClick={() => navigate(action.href)}
            className={cn(
              "flex-shrink-0 gap-2 px-4 py-2 h-auto",
              action.hoverColor
            )}
          >
            <div className={cn("p-1.5 rounded", action.bgColor)}>
              <action.icon className={cn("h-4 w-4", action.color)} />
            </div>
            <span>{action.label}</span>
          </Button>
        ))}
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4", className)}>
      {quickActions.map((action) => (
        <Card
          key={action.id}
          className={cn(
            "cursor-pointer transition-all duration-200",
            "hover:shadow-md hover:scale-[1.02]",
            "group"
          )}
          onClick={() => navigate(action.href)}
        >
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div
                className={cn(
                  "rounded-full p-4 mb-3 transition-colors",
                  action.bgColor,
                  `group-${action.hoverColor}`
                )}
              >
                <action.icon className={cn("h-6 w-6", action.color)} />
              </div>
              <h3 className="font-medium text-slate-900 text-sm">
                {action.label}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {action.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Quick Action Button - Single action button
 */
interface QuickActionButtonProps {
  action: "incident" | "capa" | "training" | "audit" | "report";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function QuickActionButton({
  action,
  size = "md",
  showLabel = true,
  className,
}: QuickActionButtonProps) {
  const navigate = useNavigate();
  const actionConfig = quickActions.find((a) => a.id === action);

  if (!actionConfig) return null;

  const sizeClasses = {
    sm: "h-8 text-xs px-3",
    md: "h-10 px-4",
    lg: "h-12 text-lg px-6",
  };

  return (
    <Button
      onClick={() => navigate(actionConfig.href)}
      className={cn(
        "gap-2",
        sizeClasses[size],
        actionConfig.color.replace("text-", "bg-").replace("-600", "-500"),
        "hover:" + actionConfig.color.replace("text-", "bg-").replace("-600", "-600"),
        "text-white",
        className
      )}
    >
      <Plus className={cn("h-4 w-4", size === "sm" && "h-3 w-3")} />
      {showLabel && actionConfig.label}
    </Button>
  );
}

/**
 * Primary Action Button - Main CTA for dashboard
 */
export function PrimaryActionButton({ className }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/incidents?action=new")}
      className={cn(
        "bg-emerald-500 hover:bg-emerald-600 text-white gap-2",
        className
      )}
    >
      <AlertTriangle className="h-4 w-4" />
      Déclarer un incident
    </Button>
  );
}

/**
 * Action Card - Larger action card with more details
 */
interface ActionCardProps {
  action: QuickAction;
  stats?: {
    label: string;
    value: number | string;
  };
  className?: string;
}

export function ActionCard({ action, stats, className }: ActionCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.01]",
        "group overflow-hidden",
        className
      )}
      onClick={() => navigate(action.href)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div
              className={cn(
                "inline-flex rounded-lg p-2.5 mb-3",
                action.bgColor
              )}
            >
              <action.icon className={cn("h-5 w-5", action.color)} />
            </div>
            <h3 className="font-semibold text-slate-900">{action.label}</h3>
            <p className="text-sm text-slate-500 mt-1">{action.description}</p>
            
            {stats && (
              <div className="mt-3 pt-3 border-t">
                <span className="text-xs text-slate-400">{stats.label}</span>
                <span className="text-lg font-bold text-slate-900 ml-2">
                  {stats.value}
                </span>
              </div>
            )}
          </div>
          
          <ArrowRight
            className={cn(
              "h-5 w-5 text-slate-300 transition-transform",
              "group-hover:translate-x-1 group-hover:text-slate-500"
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickActions;
