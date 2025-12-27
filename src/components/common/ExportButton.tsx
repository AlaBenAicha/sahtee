/**
 * Export Button Component
 * Dropdown button for exporting data to PDF or Excel
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExportOption {
  label: string;
  format: "pdf" | "excel";
  onClick: () => Promise<void> | void;
  description?: string;
}

interface ExportButtonProps {
  options: ExportOption[];
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
}

export function ExportButton({
  options,
  label = "Exporter",
  variant = "outline",
  size = "sm",
  className,
  disabled = false,
}: ExportButtonProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (option: ExportOption) => {
    setLoading(option.label);
    try {
      await option.onClick();
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setLoading(null);
    }
  };

  const pdfOptions = options.filter((o) => o.format === "pdf");
  const excelOptions = options.filter((o) => o.format === "excel");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || loading !== null}
          className={cn("gap-2", className)}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {pdfOptions.length > 0 && (
          <>
            <DropdownMenuLabel className="flex items-center gap-2 text-xs text-slate-500">
              <FileText className="h-3 w-3" />
              PDF
            </DropdownMenuLabel>
            {pdfOptions.map((option) => (
              <DropdownMenuItem
                key={option.label}
                onClick={() => handleExport(option)}
                disabled={loading !== null}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4 text-red-500" />
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-slate-500">
                      {option.description}
                    </span>
                  )}
                </div>
                {loading === option.label && (
                  <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {pdfOptions.length > 0 && excelOptions.length > 0 && (
          <DropdownMenuSeparator />
        )}

        {excelOptions.length > 0 && (
          <>
            <DropdownMenuLabel className="flex items-center gap-2 text-xs text-slate-500">
              <FileSpreadsheet className="h-3 w-3" />
              Excel
            </DropdownMenuLabel>
            {excelOptions.map((option) => (
              <DropdownMenuItem
                key={option.label}
                onClick={() => handleExport(option)}
                disabled={loading !== null}
                className="cursor-pointer"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-slate-500">
                      {option.description}
                    </span>
                  )}
                </div>
                {loading === option.label && (
                  <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportButton;
