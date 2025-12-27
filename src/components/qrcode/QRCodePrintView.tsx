/**
 * QR Code Print View Component
 * 
 * Renders a printable view of QR codes with:
 * - Large QR code image
 * - Location name and description
 * - Instructions for scanning
 * - Organization branding
 */

import { useEffect, useRef } from "react";
import { QrCode, AlertTriangle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBatchPrintData } from "@/hooks/useQRCodes";
import { getQRCodeUrl } from "@/services/qrCodeService";

interface QRCodePrintViewProps {
  qrCodeIds: string[];
  onClose: () => void;
}

export function QRCodePrintView({ qrCodeIds, onClose }: QRCodePrintViewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { data: printData = [], isLoading, error } = useBatchPrintData(qrCodeIds);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-64 w-64 mx-auto" />
          <p className="text-muted-foreground">Préparation de l'impression...</p>
        </div>
      </div>
    );
  }

  if (error || printData.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
          <p className="text-red-500">Erreur lors du chargement des QR codes</p>
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      {/* Print Controls (hidden when printing) */}
      <div className="print:hidden sticky top-0 bg-background border-b p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Aperçu d'impression</h2>
          <p className="text-sm text-muted-foreground">
            {printData.length} QR code{printData.length > 1 ? "s" : ""} à imprimer
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handlePrint}>
            Imprimer
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="p-8 print:p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 print:gap-0">
          {printData.map(({ qrCode, url }) => (
            <div
              key={qrCode.id}
              className="print:break-inside-avoid print:page-break-inside-avoid print:h-[50vh] border print:border-0 rounded-lg print:rounded-none p-6 flex flex-col"
            >
              {/* Header */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-primary">
                  {qrCode.locationName}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {qrCode.locationDescription}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex-1 flex items-center justify-center my-4">
                <div className="relative bg-white p-4 rounded-lg shadow-lg print:shadow-none">
                  {/* Placeholder for actual QR code - in production, use a QR code library */}
                  <div className="w-48 h-48 bg-black/5 rounded flex items-center justify-center">
                    <QrCode className="h-32 w-32 text-black" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-4 border-black rounded" />
                  </div>
                </div>
              </div>

              {/* Short Code */}
              <div className="text-center mb-4">
                <span className="font-mono text-2xl font-bold tracking-wider">
                  {qrCode.shortCode}
                </span>
              </div>

              {/* Instructions */}
              <div className="bg-muted/50 print:bg-gray-100 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Smartphone className="h-5 w-5" />
                  <span className="font-medium">Signaler un incident</span>
                </div>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Scannez ce QR code avec votre téléphone</li>
                  <li>2. Décrivez l'incident observé</li>
                  <li>3. Ajoutez des photos si nécessaire</li>
                </ol>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
                <p>{url}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 1cm;
            }
            
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            
            .print\\:hidden {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

