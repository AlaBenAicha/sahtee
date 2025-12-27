/**
 * QR Code Card Component
 * 
 * Displays a single QR code with its details.
 */

import { useMemo } from "react";
import {
  QrCode,
  MapPin,
  Scan,
  Calendar,
  MoreHorizontal,
  Eye,
  Printer,
  Power,
  PowerOff,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useFeaturePermissions } from "@/hooks/useFeaturePermissions";
import { useActivateQRCode, useDeactivateQRCode, useDeleteQRCode } from "@/hooks/useQRCodes";
import { toast } from "sonner";
import type { QRCodeConfig } from "@/types/capa";

interface QRCodeCardProps {
  qrCode: QRCodeConfig;
  onClick?: () => void;
  onPrint?: () => void;
  className?: string;
}

export function QRCodeCard({ qrCode, onClick, onPrint, className }: QRCodeCardProps) {
  const { canUpdate, canDelete } = useFeaturePermissions("qrcodes");
  const { mutate: activateQR, isPending: isActivating } = useActivateQRCode();
  const { mutate: deactivateQR, isPending: isDeactivating } = useDeactivateQRCode();
  const { mutate: deleteQR, isPending: isDeleting } = useDeleteQRCode();

  const createdDate = useMemo(() => {
    return qrCode.createdAt.toDate().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [qrCode.createdAt]);

  const lastScannedDate = useMemo(() => {
    if (!qrCode.lastScannedAt) return null;
    return qrCode.lastScannedAt.toDate().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [qrCode.lastScannedAt]);

  const handleToggleActive = () => {
    if (qrCode.active) {
      deactivateQR(qrCode.id, {
        onSuccess: () => toast.success("QR code désactivé"),
        onError: (error) => toast.error("Erreur", { description: error.message }),
      });
    } else {
      activateQR(qrCode.id, {
        onSuccess: () => toast.success("QR code activé"),
        onError: (error) => toast.error("Erreur", { description: error.message }),
      });
    }
  };

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce QR code ?")) {
      deleteQR(qrCode.id, {
        onSuccess: () => toast.success("QR code supprimé"),
        onError: (error) => toast.error("Erreur", { description: error.message }),
      });
    }
  };

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "transition-all hover:shadow-lg cursor-pointer group",
          !qrCode.active && "opacity-60",
          className
        )}
        onClick={onClick}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* QR Code Preview */}
              <div
                className={cn(
                  "w-16 h-16 rounded-lg flex items-center justify-center",
                  qrCode.active
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <QrCode className="h-10 w-10" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">
                    {qrCode.shortCode}
                  </span>
                  {qrCode.active ? (
                    <Badge variant="outline" className="text-green-600 bg-green-50">
                      Actif
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inactif
                    </Badge>
                  )}
                </div>
                <h3 className="font-medium text-sm line-clamp-1">
                  {qrCode.locationName}
                </h3>
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onClick?.()}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPrint?.()}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`/report/${qrCode.shortCode}`, "_blank")}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Tester le lien
                </DropdownMenuItem>

                {canUpdate && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleToggleActive}
                      disabled={isActivating || isDeactivating}
                    >
                      {qrCode.active ? (
                        <>
                          <PowerOff className="mr-2 h-4 w-4" />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <Power className="mr-2 h-4 w-4" />
                          Activer
                        </>
                      )}
                    </DropdownMenuItem>
                  </>
                )}

                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-3">
          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {qrCode.locationDescription}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>Site {qrCode.siteId}</span>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 font-medium">
                  <Scan className="h-3 w-3" />
                  <span>{qrCode.scanCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {qrCode.scanCount} scan{qrCode.scanCount !== 1 ? "s" : ""} total
                {lastScannedDate && (
                  <>
                    <br />
                    Dernier: {lastScannedDate}
                  </>
                )}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
            <Calendar className="h-3 w-3" />
            <span>Créé le {createdDate}</span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

