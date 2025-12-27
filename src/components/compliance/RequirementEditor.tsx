/**
 * Requirement Editor Component
 * 
 * Inline editor for updating requirement compliance status,
 * adding evidence, and managing notes.
 */

import { useState } from "react";
import { Upload, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { NormRequirement, ComplianceStatus } from "@/types/conformity";

interface RequirementEditorProps {
  requirement: NormRequirement;
  onSave: (data: Partial<NormRequirement>) => void;
  onCancel: () => void;
}

const COMPLIANCE_OPTIONS: Array<{ value: ComplianceStatus; label: string }> = [
  { value: "compliant", label: "Conforme" },
  { value: "non_compliant", label: "Non conforme" },
  { value: "partially_compliant", label: "Partiellement conforme" },
  { value: "not_applicable", label: "Non applicable" },
  { value: "pending_review", label: "En attente d'évaluation" },
];

export function RequirementEditor({
  requirement,
  onSave,
  onCancel,
}: RequirementEditorProps) {
  const [status, setStatus] = useState<ComplianceStatus>(requirement.status);
  const [notes, setNotes] = useState(requirement.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Build update data, excluding undefined/empty values to avoid Firebase errors
      const updateData: Partial<NormRequirement> = { status };
      
      // Only include notes if it has content, otherwise omit to keep existing value
      // or use empty string to clear it
      const trimmedNotes = notes.trim();
      if (trimmedNotes) {
        updateData.notes = trimmedNotes;
      } else if (requirement.notes) {
        // If there were previous notes and now they're cleared, set to empty string
        updateData.notes = "";
      }
      // If both are empty/undefined, don't include notes at all
      
      onSave(updateData);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = status !== requirement.status || notes !== (requirement.notes || "");

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Statut de conformité</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as ComplianceStatus)}>
          <SelectTrigger id="status" className="w-full">
            <SelectValue placeholder="Sélectionner le statut" />
          </SelectTrigger>
          <SelectContent>
            {COMPLIANCE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes / Observations</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ajouter des notes ou observations..."
          className="min-h-[80px] resize-none"
        />
      </div>

      {/* Evidence Upload Placeholder */}
      <div className="space-y-2">
        <Label>Preuves documentaires</Label>
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
          <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">
            Glissez-déposez des fichiers ou cliquez pour télécharger
          </p>
          <Button variant="outline" size="sm" className="mt-2" disabled>
            Ajouter une preuve
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="h-4 w-4 mr-1" />
          Annuler
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}

