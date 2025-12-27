/**
 * QR Code List Component
 * 
 * Displays a grid or list of QR codes with filtering and selection.
 */

import { useState } from "react";
import {
  QrCode,
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Printer,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeCard } from "./QRCodeCard";
import { useQRCodes } from "@/hooks/useQRCodes";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import type { QRCodeConfig } from "@/types/capa";

interface QRCodeListProps {
  onCreateClick: () => void;
  onCodeClick: (qrCode: QRCodeConfig) => void;
  onPrintClick: (qrCodeIds: string[]) => void;
}

type ViewMode = "grid" | "list";

export function QRCodeList({ onCreateClick, onCodeClick, onPrintClick }: QRCodeListProps) {
  const { canCreate } = useFeaturePermissions("qrcodes");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filters = {
    searchQuery: searchQuery || undefined,
    active: activeFilter === "all" ? undefined : activeFilter === "active",
  };

  const { data: qrCodes = [], isLoading, error } = useQRCodes(filters);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(qrCodes.map((qr) => qr.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleBatchPrint = () => {
    if (selectedIds.size > 0) {
      onPrintClick(Array.from(selectedIds));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-red-500">Erreur lors du chargement des QR codes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>

          {/* Active Filter */}
          <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as typeof activeFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value as ViewMode)}
          >
            <ToggleGroupItem value="grid" aria-label="Vue grille">
              <Grid3X3 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Vue liste">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Create Button */}
          {canCreate && (
            <Button onClick={onCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau QR Code
            </Button>
          )}
        </div>
      </div>

      {/* Selection Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedIds.size} sélectionné(s)</Badge>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="h-4 w-4 mr-1" />
              Tout désélectionner
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleBatchPrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer la sélection
          </Button>
        </div>
      )}

      {/* Content */}
      {qrCodes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <QrCode className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Aucun QR code trouvé</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              {searchQuery || activeFilter !== "all"
                ? "Modifiez vos filtres ou créez un nouveau QR code"
                : "Créez des QR codes pour permettre le signalement d'incidents"}
            </p>
            {canCreate && (
              <Button onClick={onCreateClick} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Créer un QR Code
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrCodes.map((qrCode) => (
            <div key={qrCode.id} className="relative">
              <Checkbox
                className="absolute top-4 left-4 z-10"
                checked={selectedIds.has(qrCode.id)}
                onCheckedChange={(checked) => handleSelectOne(qrCode.id, !!checked)}
              />
              <QRCodeCard
                qrCode={qrCode}
                onClick={() => onCodeClick(qrCode)}
                onPrint={() => onPrintClick([qrCode.id])}
                className="pl-10"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Select All */}
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <Checkbox
              checked={selectedIds.size === qrCodes.length && qrCodes.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Tout sélectionner ({qrCodes.length})
            </span>
          </div>

          {/* List Items */}
          {qrCodes.map((qrCode) => (
            <div
              key={qrCode.id}
              className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => onCodeClick(qrCode)}
            >
              <Checkbox
                checked={selectedIds.has(qrCode.id)}
                onCheckedChange={(checked) => handleSelectOne(qrCode.id, !!checked)}
                onClick={(e) => e.stopPropagation()}
              />
              <div
                className={`w-10 h-10 rounded flex items-center justify-center ${
                  qrCode.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                <QrCode className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{qrCode.shortCode}</span>
                  {qrCode.active ? (
                    <Badge variant="outline" className="text-green-600">
                      Actif
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inactif
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {qrCode.locationName}
                </p>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium">{qrCode.scanCount} scans</div>
                <div className="text-muted-foreground">
                  {qrCode.createdAt.toDate().toLocaleDateString("fr-FR")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

