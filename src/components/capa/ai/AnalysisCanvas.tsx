/**
 * Analysis Canvas Component
 *
 * Interactive visual canvas for multi-methodology root cause analysis.
 * Supports Ishikawa (Fishbone), Fault Tree, Barrier Analysis, and Bow-Tie visualizations.
 */

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  GitBranch,
  Network,
  Shield,
  Target,
  Layers,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import type {
  RCAMethodologyType,
  IshikawaAnalysis,
  IshikawaCategory,
  FaultTreeAnalysis,
  FaultTreeNode,
  BarrierAnalysisResult,
  BarrierAnalysis,
  BowTieModel,
  ContributingFactor,
  EnhancedIncidentAnalysis,
} from "@/services/ai/types";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

interface AnalysisCanvasProps {
  analysis?: EnhancedIncidentAnalysis;
  selectedMethodology: RCAMethodologyType;
  onMethodologyChange: (method: RCAMethodologyType) => void;
  onNodeClick?: (nodeId: string, nodeType: string) => void;
  onExport?: (format: "png" | "svg" | "pdf") => void;
  isLoading?: boolean;
  className?: string;
}

// =============================================================================
// Methodology Icons & Colors
// =============================================================================

const methodologyConfig: Record<
  RCAMethodologyType,
  { icon: React.ReactNode; label: string; color: string }
> = {
  "5why": {
    icon: <ChevronRight className="h-4 w-4" />,
    label: "5 Pourquoi",
    color: "bg-blue-500",
  },
  ishikawa: {
    icon: <Network className="h-4 w-4" />,
    label: "Ishikawa",
    color: "bg-purple-500",
  },
  fta: {
    icon: <GitBranch className="h-4 w-4" />,
    label: "Arbre de Défaillances",
    color: "bg-red-500",
  },
  barrier: {
    icon: <Shield className="h-4 w-4" />,
    label: "Analyse Barrières",
    color: "bg-amber-500",
  },
  bowtie: {
    icon: <Target className="h-4 w-4" />,
    label: "Bow-Tie",
    color: "bg-green-500",
  },
  tripod: {
    icon: <Layers className="h-4 w-4" />,
    label: "TRIPOD",
    color: "bg-indigo-500",
  },
  hybrid: {
    icon: <Sparkles className="h-4 w-4" />,
    label: "Hybride",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
};

// =============================================================================
// Main Component
// =============================================================================

export function AnalysisCanvas({
  analysis,
  selectedMethodology,
  onMethodologyChange,
  onNodeClick,
  onExport,
  isLoading,
  className,
}: AnalysisCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 0.1, 0.5));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setSelectedNode(null);
  }, []);

  const handleNodeClick = useCallback(
    (nodeId: string, nodeType: string) => {
      setSelectedNode(nodeId);
      onNodeClick?.(nodeId, nodeType);
    },
    [onNodeClick]
  );

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-slate-600">Analyse en cours...</p>
            <p className="text-sm text-slate-400">
              L'IA génère la visualisation
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Network className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Aucune analyse disponible</p>
            <p className="text-sm text-slate-400">
              Sélectionnez un incident et lancez l'analyse
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg text-white",
                methodologyConfig[selectedMethodology].color
              )}
            >
              {methodologyConfig[selectedMethodology].icon}
            </div>
            <div>
              <CardTitle className="text-lg">
                {methodologyConfig[selectedMethodology].label}
              </CardTitle>
              <p className="text-sm text-slate-500">
                Analyse interactive des causes racines
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom arrière</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <span className="text-sm text-slate-500 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom avant</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Réinitialiser</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport("png")}
                className="ml-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            )}
          </div>
        </div>

        {/* Methodology Tabs */}
        <Tabs
          value={selectedMethodology}
          onValueChange={(v) => onMethodologyChange(v as RCAMethodologyType)}
          className="mt-3"
        >
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-1">
            {Object.entries(methodologyConfig).map(([key, config]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-1 text-xs"
              >
                {config.icon}
                <span className="hidden sm:inline">{config.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div
            className="p-4 min-h-[500px]"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          >
            {selectedMethodology === "ishikawa" && analysis.ishikawaAnalysis && (
              <IshikawaVisualization
                data={analysis.ishikawaAnalysis}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
              />
            )}

            {selectedMethodology === "fta" && analysis.faultTreeAnalysis && (
              <FaultTreeVisualization
                data={analysis.faultTreeAnalysis}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
              />
            )}

            {selectedMethodology === "barrier" && analysis.barrierAnalysis && (
              <BarrierVisualization
                data={analysis.barrierAnalysis}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
              />
            )}

            {selectedMethodology === "bowtie" && analysis.bowtieAnalysis && (
              <BowTieVisualization
                data={analysis.bowtieAnalysis}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
              />
            )}

            {selectedMethodology === "5why" && analysis.fiveWhysAnalysis && (
              <FiveWhysVisualization
                data={analysis.fiveWhysAnalysis}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
              />
            )}

            {selectedMethodology === "tripod" && analysis.tripodAnalysis && (
              <TripodVisualization
                data={analysis.tripodAnalysis}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
              />
            )}

            {selectedMethodology === "hybrid" && (
              <HybridVisualization
                analysis={analysis}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
              />
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Ishikawa (Fishbone) Visualization
// =============================================================================

interface IshikawaVisualizationProps {
  data: IshikawaAnalysis;
  selectedNode: string | null;
  onNodeClick: (nodeId: string, nodeType: string) => void;
}

function IshikawaVisualization({
  data,
  selectedNode,
  onNodeClick,
}: IshikawaVisualizationProps) {
  const categoryColors: Record<string, string> = {
    man: "bg-blue-100 border-blue-400 text-blue-800",
    machine: "bg-red-100 border-red-400 text-red-800",
    method: "bg-green-100 border-green-400 text-green-800",
    material: "bg-yellow-100 border-yellow-400 text-yellow-800",
    measurement: "bg-purple-100 border-purple-400 text-purple-800",
    environment: "bg-orange-100 border-orange-400 text-orange-800",
  };

  const categoryLabels: Record<string, string> = {
    man: "Main d'œuvre",
    machine: "Machine",
    method: "Méthode",
    material: "Matière",
    measurement: "Mesure",
    environment: "Milieu",
  };

  const topCategories = data.categories.slice(0, 3);
  const bottomCategories = data.categories.slice(3, 6);

  return (
    <div className="relative min-h-[400px] px-4">
      {/* Problem/Effect (Fish Head) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <div className="bg-red-500 text-white rounded-lg p-4 shadow-lg max-w-48">
          <h4 className="font-semibold text-sm mb-1">Problème</h4>
          <p className="text-xs line-clamp-3">{data.problem}</p>
        </div>
      </div>

      {/* Main Spine */}
      <div className="absolute left-0 right-48 top-1/2 h-1 bg-slate-400 -translate-y-1/2" />

      {/* Top Categories */}
      <div className="flex justify-around mb-16 pr-48">
        {topCategories.map((category, index) => (
          <CategoryBranch
            key={category.name}
            category={category}
            position="top"
            colorClass={categoryColors[category.name]}
            label={categoryLabels[category.name]}
            selectedNode={selectedNode}
            onNodeClick={onNodeClick}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Spacer for spine */}
      <div className="h-24" />

      {/* Bottom Categories */}
      <div className="flex justify-around mt-16 pr-48">
        {bottomCategories.map((category, index) => (
          <CategoryBranch
            key={category.name}
            category={category}
            position="bottom"
            colorClass={categoryColors[category.name]}
            label={categoryLabels[category.name]}
            selectedNode={selectedNode}
            onNodeClick={onNodeClick}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Root Cause Highlight */}
      {data.rootCause && (
        <div className="absolute left-4 bottom-4 bg-purple-100 border-2 border-purple-500 rounded-lg p-3 max-w-64">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-purple-600" />
            <span className="font-semibold text-purple-800 text-sm">
              Cause Racine
            </span>
          </div>
          <p className="text-xs text-purple-700">{data.rootCause}</p>
        </div>
      )}
    </div>
  );
}

interface CategoryBranchProps {
  category: IshikawaCategory;
  position: "top" | "bottom";
  colorClass: string;
  label: string;
  selectedNode: string | null;
  onNodeClick: (nodeId: string, nodeType: string) => void;
  delay: number;
}

function CategoryBranch({
  category,
  position,
  colorClass,
  label,
  selectedNode,
  onNodeClick,
}: CategoryBranchProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center",
        position === "bottom" && "flex-col-reverse"
      )}
    >
      {/* Category Label */}
      <div
        className={cn(
          "px-3 py-2 rounded-lg border-2 cursor-pointer transition-all hover:scale-105",
          colorClass,
          selectedNode === category.name && "ring-2 ring-offset-2 ring-slate-500"
        )}
        onClick={() => onNodeClick(category.name, "category")}
      >
        <span className="font-semibold text-sm">{label}</span>
        {category.weight > 0 && (
          <Badge variant="outline" className="ml-2 text-xs">
            {Math.round(category.weight * 100)}%
          </Badge>
        )}
      </div>

      {/* Branch Line */}
      <div
        className={cn(
          "w-0.5 bg-slate-400",
          position === "top" ? "h-12" : "h-12"
        )}
      />

      {/* Factors */}
      <div className={cn("flex flex-col gap-1", position === "bottom" && "flex-col-reverse")}>
        {category.factors.slice(0, 4).map((factor, idx) => (
          <FactorNode
            key={factor.id}
            factor={factor}
            isSelected={selectedNode === factor.id}
            onClick={() => onNodeClick(factor.id, "factor")}
            position={position}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
}

interface FactorNodeProps {
  factor: ContributingFactor;
  isSelected: boolean;
  onClick: () => void;
  position: "top" | "bottom";
  index: number;
}

function FactorNode({
  factor,
  isSelected,
  onClick,
  position,
  index,
}: FactorNodeProps) {
  const offset = position === "top" ? index % 2 === 0 : index % 2 !== 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        offset ? "ml-8" : "mr-8",
        position === "bottom" && "flex-row-reverse"
      )}
    >
      <div className="w-8 h-0.5 bg-slate-300" />
      <div
        className={cn(
          "px-2 py-1 rounded text-xs max-w-32 truncate cursor-pointer transition-all",
          "bg-slate-100 hover:bg-slate-200 border",
          isSelected && "ring-2 ring-purple-500",
          factor.isPrimary && "border-purple-400 bg-purple-50"
        )}
        onClick={onClick}
        title={factor.description}
      >
        {factor.description}
      </div>
    </div>
  );
}

// =============================================================================
// Fault Tree Visualization
// =============================================================================

interface FaultTreeVisualizationProps {
  data: FaultTreeAnalysis;
  selectedNode: string | null;
  onNodeClick: (nodeId: string, nodeType: string) => void;
}

function FaultTreeVisualization({
  data,
  selectedNode,
  onNodeClick,
}: FaultTreeVisualizationProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <FaultTreeNodeComponent
        node={data.topEvent}
        selectedNode={selectedNode}
        onNodeClick={onNodeClick}
        criticalPath={data.criticalPath}
        level={0}
      />

      {/* Analysis Summary */}
      <div className="mt-4 p-4 bg-slate-50 rounded-lg w-full max-w-lg">
        <h4 className="font-semibold text-sm mb-2">Résumé de l'analyse</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Probabilité système:</span>
            <span className="ml-2 font-medium">
              {(data.systemProbability * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-slate-500">Coupes minimales:</span>
            <span className="ml-2 font-medium">
              {data.minimalCutSets.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FaultTreeNodeComponentProps {
  node: FaultTreeNode;
  selectedNode: string | null;
  onNodeClick: (nodeId: string, nodeType: string) => void;
  criticalPath: string[];
  level: number;
}

function FaultTreeNodeComponent({
  node,
  selectedNode,
  onNodeClick,
  criticalPath,
  level,
}: FaultTreeNodeComponentProps) {
  const isOnCriticalPath = criticalPath.includes(node.id);

  const nodeTypeStyles: Record<string, string> = {
    top_event: "bg-red-500 text-white border-red-600",
    intermediate: "bg-orange-100 border-orange-400 text-orange-800",
    basic: "bg-blue-100 border-blue-400 text-blue-800",
    undeveloped: "bg-slate-100 border-slate-400 text-slate-600",
    conditioning: "bg-purple-100 border-purple-400 text-purple-800",
    transfer: "bg-green-100 border-green-400 text-green-800",
  };

  const gateIcons: Record<string, string> = {
    AND: "∧",
    OR: "∨",
    XOR: "⊕",
    INHIBIT: "⊖",
    PRIORITY_AND: "P∧",
    VOTING: "M/N",
  };

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div
        className={cn(
          "px-4 py-2 rounded-lg border-2 cursor-pointer transition-all max-w-48",
          nodeTypeStyles[node.type] || nodeTypeStyles.basic,
          selectedNode === node.id && "ring-2 ring-offset-2 ring-purple-500",
          isOnCriticalPath && "ring-2 ring-red-500"
        )}
        onClick={() => onNodeClick(node.id, node.type)}
      >
        <p className="text-xs text-center line-clamp-2">{node.description}</p>
        {node.probability !== undefined && (
          <p className="text-xs text-center mt-1 opacity-75">
            P: {(node.probability * 100).toFixed(1)}%
          </p>
        )}
      </div>

      {/* Gate (if has children) */}
      {node.gateType && node.children && node.children.length > 0 && (
        <>
          <div className="w-0.5 h-4 bg-slate-400" />
          <div className="w-8 h-8 rounded-full border-2 border-slate-400 flex items-center justify-center bg-white text-sm font-bold">
            {gateIcons[node.gateType] || node.gateType}
          </div>
          <div className="w-0.5 h-4 bg-slate-400" />

          {/* Children */}
          <div className="flex gap-4">
            {node.children.map((child) => (
              <FaultTreeNodeComponent
                key={child.id}
                node={child}
                selectedNode={selectedNode}
                onNodeClick={onNodeClick}
                criticalPath={criticalPath}
                level={level + 1}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// =============================================================================
// Barrier Analysis Visualization
// =============================================================================

interface BarrierVisualizationProps {
  data: BarrierAnalysisResult;
  selectedNode: string | null;
  onNodeClick: (nodeId: string, nodeType: string) => void;
}

function BarrierVisualization({
  data,
  selectedNode,
  onNodeClick,
}: BarrierVisualizationProps) {
  const statusColors: Record<string, string> = {
    effective: "bg-green-100 border-green-400 text-green-800",
    partially_effective: "bg-yellow-100 border-yellow-400 text-yellow-800",
    failed: "bg-red-100 border-red-400 text-red-800",
    missing: "bg-slate-100 border-slate-400 text-slate-600 border-dashed",
    bypassed: "bg-orange-100 border-orange-400 text-orange-800",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    effective: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    partially_effective: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
    failed: <XCircle className="h-4 w-4 text-red-600" />,
    missing: <HelpCircle className="h-4 w-4 text-slate-400" />,
    bypassed: <AlertTriangle className="h-4 w-4 text-orange-600" />,
  };

  return (
    <div className="space-y-6">
      {/* Defense Score */}
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <div
            className={cn(
              "text-4xl font-bold",
              data.overallDefenseScore >= 70
                ? "text-green-600"
                : data.overallDefenseScore >= 40
                ? "text-yellow-600"
                : "text-red-600"
            )}
          >
            {data.overallDefenseScore}%
          </div>
          <p className="text-sm text-slate-500">Score de Défense</p>
        </div>
      </div>

      {/* Barriers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.barriers.map((barrier) => (
          <BarrierCard
            key={barrier.id}
            barrier={barrier}
            isSelected={selectedNode === barrier.id}
            onClick={() => onNodeClick(barrier.id, "barrier")}
            statusColor={statusColors[barrier.status]}
            statusIcon={statusIcons[barrier.status]}
          />
        ))}
      </div>

      {/* Critical Gaps */}
      {data.criticalGaps.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Lacunes Critiques
          </h4>
          <ul className="list-disc list-inside text-sm text-red-700">
            {data.criticalGaps.map((gap, idx) => (
              <li key={idx}>{gap}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface BarrierCardProps {
  barrier: BarrierAnalysis;
  isSelected: boolean;
  onClick: () => void;
  statusColor: string;
  statusIcon: React.ReactNode;
}

function BarrierCard({
  barrier,
  isSelected,
  onClick,
  statusColor,
  statusIcon,
}: BarrierCardProps) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
        statusColor,
        isSelected && "ring-2 ring-offset-2 ring-purple-500"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h5 className="font-semibold text-sm">{barrier.name}</h5>
          <p className="text-xs mt-1 line-clamp-2">{barrier.description}</p>
        </div>
        {statusIcon}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {barrier.type}
        </Badge>
        <span className="text-xs font-medium">{barrier.effectiveness}%</span>
      </div>
    </div>
  );
}

// =============================================================================
// Bow-Tie Visualization
// =============================================================================

interface BowTieVisualizationProps {
  data: BowTieModel;
  selectedNode: string | null;
  onNodeClick: (nodeId: string, nodeType: string) => void;
}

function BowTieVisualization({
  data,
  selectedNode,
  onNodeClick,
}: BowTieVisualizationProps) {
  return (
    <div className="flex items-center justify-center gap-4 min-h-[400px]">
      {/* Threats (Left Side) */}
      <div className="flex flex-col gap-2 items-end">
        <h4 className="text-sm font-semibold text-slate-600 mb-2">Menaces</h4>
        {data.threats.map((threat) => (
          <div
            key={threat.id}
            className={cn(
              "px-3 py-2 rounded-lg border-2 bg-red-50 border-red-300 cursor-pointer",
              "max-w-48 text-xs hover:shadow-md transition-all",
              selectedNode === threat.id && "ring-2 ring-purple-500"
            )}
            onClick={() => onNodeClick(threat.id, "threat")}
          >
            <p className="line-clamp-2">{threat.description}</p>
            <Badge variant="outline" className="mt-1 text-xs">
              Prob: {threat.likelihood}/5
            </Badge>
          </div>
        ))}
      </div>

      {/* Preventive Barriers */}
      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-semibold text-slate-500 text-center mb-1">
          Barrières Préventives
        </h4>
        {data.preventiveBarriers.slice(0, 4).map((barrier, idx) => (
          <div
            key={barrier.id}
            className={cn(
              "w-4 h-8 rounded",
              barrier.status === "effective"
                ? "bg-green-400"
                : barrier.status === "failed"
                ? "bg-red-400"
                : "bg-yellow-400"
            )}
            title={barrier.name}
          />
        ))}
      </div>

      {/* Central Hazard */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center",
            "bg-gradient-to-br from-orange-500 to-red-600 text-white",
            "shadow-lg cursor-pointer hover:scale-105 transition-all"
          )}
          onClick={() => onNodeClick("hazard", "hazard")}
        >
          <div className="text-center p-2">
            <Target className="h-6 w-6 mx-auto mb-1" />
            <p className="text-xs font-semibold line-clamp-2">{data.hazard}</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center max-w-32">
          {data.hazardDescription}
        </p>
      </div>

      {/* Mitigating Barriers */}
      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-semibold text-slate-500 text-center mb-1">
          Barrières de Mitigation
        </h4>
        {data.mitigatingBarriers.slice(0, 4).map((barrier, idx) => (
          <div
            key={barrier.id}
            className={cn(
              "w-4 h-8 rounded",
              barrier.status === "effective"
                ? "bg-green-400"
                : barrier.status === "failed"
                ? "bg-red-400"
                : "bg-yellow-400"
            )}
            title={barrier.name}
          />
        ))}
      </div>

      {/* Consequences (Right Side) */}
      <div className="flex flex-col gap-2 items-start">
        <h4 className="text-sm font-semibold text-slate-600 mb-2">
          Conséquences
        </h4>
        {data.consequences.map((consequence) => (
          <div
            key={consequence.id}
            className={cn(
              "px-3 py-2 rounded-lg border-2 bg-amber-50 border-amber-300 cursor-pointer",
              "max-w-48 text-xs hover:shadow-md transition-all",
              selectedNode === consequence.id && "ring-2 ring-purple-500"
            )}
            onClick={() => onNodeClick(consequence.id, "consequence")}
          >
            <p className="line-clamp-2">{consequence.description}</p>
            <Badge variant="outline" className="mt-1 text-xs">
              Sév: {consequence.severity}/5
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// 5 Whys Visualization
// =============================================================================

interface FiveWhysVisualizationProps {
  data: FiveWhysAnalysis;
  selectedNode: string | null;
  onNodeClick: (nodeId: string, nodeType: string) => void;
}

function FiveWhysVisualization({
  data,
  selectedNode,
  onNodeClick,
}: FiveWhysVisualizationProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Problem Statement */}
      <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4 max-w-lg">
        <h4 className="font-semibold text-blue-800 mb-1">Problème Initial</h4>
        <p className="text-sm text-blue-700">{data.problem}</p>
      </div>

      {/* Why Chain */}
      {data.whys.map((why, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-6 w-6 text-slate-400 rotate-90" />
          <div
            className={cn(
              "rounded-lg p-4 max-w-lg cursor-pointer transition-all hover:shadow-md",
              index === data.whys.length - 1
                ? "bg-purple-100 border-2 border-purple-400"
                : "bg-slate-100 border-2 border-slate-300",
              selectedNode === `why-${index}` && "ring-2 ring-purple-500"
            )}
            onClick={() => onNodeClick(`why-${index}`, "why")}
          >
            <div className="flex items-start gap-2">
              <Badge
                className={cn(
                  "shrink-0",
                  index === data.whys.length - 1 ? "bg-purple-500" : "bg-slate-500"
                )}
              >
                {index + 1}
              </Badge>
              <div>
                <p className="text-xs text-slate-500 mb-1">{why.question}</p>
                <p className="text-sm font-medium">{why.answer}</p>
                {why.evidence && (
                  <p className="text-xs text-slate-500 mt-1 italic">
                    Preuve: {why.evidence}
                  </p>
                )}
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}

      {/* Root Cause */}
      <ChevronRight className="h-6 w-6 text-purple-500 rotate-90" />
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 max-w-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-5 w-5" />
          <h4 className="font-semibold">Cause Racine Identifiée</h4>
        </div>
        <p className="text-sm">{data.rootCause}</p>
      </div>
    </div>
  );
}

// =============================================================================
// TRIPOD Visualization (Placeholder)
// =============================================================================

interface TripodVisualizationProps {
  data: TripodAnalysis;
  selectedNode: string | null;
  onNodeClick: (nodeId: string, nodeType: string) => void;
}

function TripodVisualization({
  data,
  selectedNode,
  onNodeClick,
}: TripodVisualizationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Active Failures */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            Défaillances Actives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.activeFailures.map((failure, idx) => (
              <li
                key={idx}
                className="text-xs p-2 bg-red-50 rounded border border-red-200"
              >
                {failure}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Preconditions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Préconditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.preconditions.map((precond) => (
              <li
                key={precond.id}
                className={cn(
                  "text-xs p-2 rounded border cursor-pointer transition-all",
                  precond.isLatentFailure
                    ? "bg-orange-50 border-orange-200"
                    : "bg-yellow-50 border-yellow-200",
                  selectedNode === precond.id && "ring-2 ring-purple-500"
                )}
                onClick={() => onNodeClick(precond.id, "precondition")}
              >
                <Badge variant="outline" className="text-xs mb-1">
                  {precond.category}
                </Badge>
                <p>{precond.description}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Organizational Factors */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-500" />
            Facteurs Organisationnels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.organizationalFactors.map((factor, idx) => (
              <li
                key={idx}
                className="text-xs p-2 bg-indigo-50 rounded border border-indigo-200"
              >
                {factor}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recovery Opportunities */}
      {data.recoveryOpportunities.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Opportunités de Récupération Manquées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.recoveryOpportunities.map((opp, idx) => (
                <Badge key={idx} variant="outline" className="bg-green-50">
                  {opp}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =============================================================================
// Hybrid Visualization
// =============================================================================

interface HybridVisualizationProps {
  analysis: EnhancedIncidentAnalysis;
  selectedNode: string | null;
  onNodeClick: (nodeId: string, nodeType: string) => void;
}

function HybridVisualization({
  analysis,
  selectedNode,
  onNodeClick,
}: HybridVisualizationProps) {
  const availableAnalyses = useMemo(() => {
    const analyses: Array<{ key: string; label: string; available: boolean }> = [
      { key: "5why", label: "5 Pourquoi", available: !!analysis.fiveWhysAnalysis },
      { key: "ishikawa", label: "Ishikawa", available: !!analysis.ishikawaAnalysis },
      { key: "fta", label: "Arbre de Défaillances", available: !!analysis.faultTreeAnalysis },
      { key: "barrier", label: "Barrières", available: !!analysis.barrierAnalysis },
      { key: "bowtie", label: "Bow-Tie", available: !!analysis.bowtieAnalysis },
      { key: "tripod", label: "TRIPOD", available: !!analysis.tripodAnalysis },
    ];
    return analyses;
  }, [analysis]);

  return (
    <div className="space-y-6">
      {/* Hybrid Insights */}
      {analysis.hybridInsights && analysis.hybridInsights.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Insights Combinés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.hybridInsights.map((insight, idx) => (
                <li
                  key={idx}
                  className="text-sm text-purple-800 flex items-start gap-2"
                >
                  <span className="text-purple-500">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Available Analyses Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {availableAnalyses.map((item) => (
          <Card
            key={item.key}
            className={cn(
              "cursor-pointer transition-all",
              item.available
                ? "hover:shadow-md border-green-200 bg-green-50"
                : "opacity-50 bg-slate-50"
            )}
          >
            <CardContent className="p-4 flex items-center gap-3">
              {item.available ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-slate-400" />
              )}
              <div>
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-slate-500">
                  {item.available ? "Analyse complète" : "Non effectuée"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Root Cause Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Synthèse des Causes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-500">Cause Racine:</span>
              <p className="font-medium text-sm">{analysis.rootCause}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Catégorie:</span>
              <Badge variant="outline" className="ml-2">
                {analysis.rootCauseCategory}
              </Badge>
            </div>
            <div>
              <span className="text-xs text-slate-500">Facteurs Contributifs:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.contributingFactors.slice(0, 5).map((factor, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalysisCanvas;

