/**
 * Roles Management Page
 * 
 * Allows org_admin to manage custom roles and permissions.
 * Features:
 * - View all organization roles
 * - Edit template roles
 * - Create new custom roles
 * - Delete roles (if no users assigned)
 * - Configure CRUD permissions per feature module
 */

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Shield, 
  Plus, 
  Pencil, 
  Trash2, 
  Users, 
  AlertTriangle,
  FileWarning,
  GraduationCap,
  CheckCircle2,
  HeartPulse,
  BarChart3,
  Settings,
  LayoutDashboard,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { 
  CustomRole, 
  FeaturePermissions, 
  CRUDPermissions,
  FeatureModule,
} from "@/types/organization";
import {
  getRolesByOrganization,
  createRole,
  updateRole,
  deleteRole,
  canDeleteRole,
  createEmptyFeaturePermissions,
} from "@/services/roleService";

// Feature module configuration for display
interface FeatureConfig {
  key: keyof FeaturePermissions;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const FEATURE_CONFIGS: FeatureConfig[] = [
  { 
    key: "dashboard", 
    label: "Tableau de bord", 
    icon: LayoutDashboard, 
    description: "Vue d'ensemble et statistiques",
    color: "text-blue-600" 
  },
  { 
    key: "incidents", 
    label: "Incidents", 
    icon: AlertTriangle, 
    description: "Signalement et suivi des incidents",
    color: "text-red-600" 
  },
  { 
    key: "capa", 
    label: "CAPA", 
    icon: FileWarning, 
    description: "Actions correctives et préventives",
    color: "text-amber-600" 
  },
  { 
    key: "training", 
    label: "Formations", 
    icon: GraduationCap, 
    description: "Gestion des formations",
    color: "text-purple-600" 
  },
  { 
    key: "compliance", 
    label: "Conformité", 
    icon: CheckCircle2, 
    description: "Audits et conformité réglementaire",
    color: "text-green-600" 
  },
  { 
    key: "health", 
    label: "Santé", 
    icon: HeartPulse, 
    description: "Santé au travail",
    color: "text-pink-600" 
  },
  { 
    key: "analytics", 
    label: "Analytiques", 
    icon: BarChart3, 
    description: "Rapports et analyses",
    color: "text-indigo-600" 
  },
  { 
    key: "settings", 
    label: "Paramètres", 
    icon: Settings, 
    description: "Configuration de l'organisation",
    color: "text-slate-600" 
  },
  { 
    key: "users", 
    label: "Utilisateurs", 
    icon: Users, 
    description: "Gestion des utilisateurs",
    color: "text-cyan-600" 
  },
];

// CRUD action labels
const CRUD_LABELS: { key: keyof CRUDPermissions; label: string; description: string }[] = [
  { key: "create", label: "Créer", description: "Ajouter de nouveaux éléments" },
  { key: "read", label: "Lire", description: "Consulter les données" },
  { key: "update", label: "Modifier", description: "Mettre à jour les données" },
  { key: "delete", label: "Supprimer", description: "Supprimer des éléments" },
];

// Empty role for creation form
const EMPTY_ROLE: Omit<CustomRole, "id" | "organizationId" | "createdAt" | "updatedAt" | "audit"> = {
  name: "",
  description: "",
  isTemplate: false,
  permissions: createEmptyFeaturePermissions(),
};

export default function RolesPage() {
  const { session, userProfile } = useAuth();
  
  // State
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Form state
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [formData, setFormData] = useState(EMPTY_ROLE);
  const [deleteInfo, setDeleteInfo] = useState<{ role: CustomRole; canDelete: boolean; userCount: number } | null>(null);

  // Load roles
  const loadRoles = useCallback(async () => {
    if (!userProfile?.organizationId) return;
    
    setLoading(true);
    try {
      const orgRoles = await getRolesByOrganization(userProfile.organizationId);
      setRoles(orgRoles);
    } catch (error) {
      console.error("Error loading roles:", error);
      toast.error("Erreur lors du chargement des rôles");
    } finally {
      setLoading(false);
    }
  }, [userProfile?.organizationId]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Check if user can manage roles
  const canManageRoles = session?.isOrgAdmin || session?.featurePermissions?.users?.update;

  // Handle create role
  const handleCreateRole = async () => {
    if (!formData.name.trim()) {
      toast.error("Le nom du rôle est requis");
      return;
    }
    
    if (!userProfile?.organizationId || !userProfile.uid) return;
    
    setSaving(true);
    try {
      const newRole = await createRole(
        {
          ...formData,
          organizationId: userProfile.organizationId,
        },
        userProfile.uid
      );
      
      setRoles(prev => [...prev, newRole].sort((a, b) => a.name.localeCompare(b.name)));
      setShowCreateDialog(false);
      setFormData(EMPTY_ROLE);
      toast.success("Rôle créé avec succès");
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error("Erreur lors de la création du rôle");
    } finally {
      setSaving(false);
    }
  };

  // Handle update role
  const handleUpdateRole = async () => {
    if (!editingRole || !formData.name.trim()) {
      toast.error("Le nom du rôle est requis");
      return;
    }
    
    if (!userProfile?.uid) return;
    
    setSaving(true);
    try {
      await updateRole(
        editingRole.id,
        {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        },
        userProfile.uid
      );
      
      setRoles(prev => prev.map(r => 
        r.id === editingRole.id 
          ? { ...r, name: formData.name, description: formData.description, permissions: formData.permissions }
          : r
      ).sort((a, b) => a.name.localeCompare(b.name)));
      
      setShowEditDialog(false);
      setEditingRole(null);
      setFormData(EMPTY_ROLE);
      toast.success("Rôle mis à jour avec succès");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Erreur lors de la mise à jour du rôle");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete role
  const handleDeleteRole = async () => {
    if (!deleteInfo?.role) return;
    
    setSaving(true);
    try {
      const result = await deleteRole(deleteInfo.role.id);
      
      if (result.success) {
        setRoles(prev => prev.filter(r => r.id !== deleteInfo.role.id));
        toast.success("Rôle supprimé avec succès");
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Erreur lors de la suppression du rôle");
    } finally {
      setSaving(false);
      setShowDeleteDialog(false);
      setDeleteInfo(null);
    }
  };

  // Open edit dialog
  const openEditDialog = (role: CustomRole) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      isTemplate: role.isTemplate,
      permissions: { ...role.permissions },
    });
    setShowEditDialog(true);
  };

  // Handle create dialog open/close
  const handleCreateDialogChange = (open: boolean) => {
    setShowCreateDialog(open);
    if (open) {
      // Reset form when opening create dialog
      setFormData(EMPTY_ROLE);
    }
  };

  // Handle edit dialog open/close
  const handleEditDialogChange = (open: boolean) => {
    setShowEditDialog(open);
    if (!open) {
      // Reset form when closing edit dialog
      setFormData(EMPTY_ROLE);
      setEditingRole(null);
    }
  };

  // Open delete dialog
  const openDeleteDialog = async (role: CustomRole) => {
    try {
      const { canDelete, assignedUsersCount } = await canDeleteRole(role.id);
      setDeleteInfo({ role, canDelete, userCount: assignedUsersCount });
      setShowDeleteDialog(true);
    } catch (error) {
      console.error("Error checking role deletion:", error);
      toast.error("Erreur lors de la vérification");
    }
  };

  // Toggle permission
  const togglePermission = (feature: keyof FeaturePermissions, action: keyof CRUDPermissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [feature]: {
          ...prev.permissions[feature],
          [action]: !prev.permissions[feature][action],
        },
      },
    }));
  };

  // Toggle all permissions for a feature
  const toggleAllFeaturePermissions = (feature: keyof FeaturePermissions, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [feature]: {
          create: enabled,
          read: enabled,
          update: enabled,
          delete: enabled,
        },
      },
    }));
  };

  // Check if all permissions for a feature are enabled
  const hasFullAccess = (feature: keyof FeaturePermissions): boolean => {
    const perms = formData.permissions[feature];
    return perms.create && perms.read && perms.update && perms.delete;
  };

  // Check if any permission for a feature is enabled
  const hasAnyAccess = (feature: keyof FeaturePermissions): boolean => {
    const perms = formData.permissions[feature];
    return perms.create || perms.read || perms.update || perms.delete;
  };

  // Count total permissions for a role (only for features in FEATURE_CONFIGS)
  const countPermissions = (permissions: FeaturePermissions): number => {
    return FEATURE_CONFIGS.reduce((count, config) => {
      const crud = permissions[config.key];
      if (!crud) return count;
      return count + Object.values(crud).filter(Boolean).length;
    }, 0);
  };

  // Permission editor component
  const PermissionEditor = () => (
    <div className="space-y-4">
      {FEATURE_CONFIGS.map((config) => (
        <Card key={config.key} className="overflow-hidden">
          <CardHeader className="py-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <config.icon className={cn("h-5 w-5", config.color)} />
                <div>
                  <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                  <CardDescription className="text-xs">{config.description}</CardDescription>
                </div>
              </div>
              <button
                onClick={() => toggleAllFeaturePermissions(config.key, !hasFullAccess(config.key))}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-md border transition-colors cursor-pointer",
                  hasFullAccess(config.key)
                    ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                )}
              >
                Accès complet
              </button>
            </div>
          </CardHeader>
          <CardContent className="py-3">
            <div className="flex flex-wrap gap-2">
              {CRUD_LABELS.map((crud) => (
                <button 
                  key={crud.key} 
                  onClick={() => togglePermission(config.key, crud.key)}
                  className={cn(
                    "px-4 py-1.5 rounded-md border transition-colors cursor-pointer hover:shadow-sm text-sm",
                    formData.permissions[config.key][crud.key] 
                      ? "bg-green-50 border-green-200 hover:bg-green-100 text-green-700 font-medium" 
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                  )}
                >
                  {crud.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestion des rôles</h1>
            <p className="text-slate-600 mt-1">
              Configurez les rôles et permissions pour votre organisation
            </p>
          </div>
        </div>
        
        {canManageRoles && (
          <Dialog open={showCreateDialog} onOpenChange={handleCreateDialogChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau rôle
              </Button>
            </DialogTrigger>
            <DialogContent size="xl" className="overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Créer un nouveau rôle</DialogTitle>
                <DialogDescription>
                  Définissez un nouveau rôle avec des permissions personnalisées
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto space-y-6 py-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Nom du rôle *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Chef d'équipe"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez les responsabilités de ce rôle..."
                      className="mt-1.5"
                      rows={2}
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-semibold">Permissions par module</Label>
                  <p className="text-sm text-slate-500 mb-4">
                    Définissez les actions autorisées pour chaque module
                  </p>
                  <PermissionEditor />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleCreateRole} 
                  disabled={saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer le rôle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Roles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    {role.isTemplate && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Modèle
                      </Badge>
                    )}
                  </div>
                </div>
                
                {canManageRoles && (
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => openEditDialog(role)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => openDeleteDialog(role)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {role.description || "Aucune description"}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Permissions actives</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {countPermissions(role.permissions)} / {FEATURE_CONFIGS.length * 4}
                </Badge>
              </div>
              
              {/* Permission summary */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {FEATURE_CONFIGS.map((config) => {
                  const hasAccess = role.permissions[config.key]?.read;
                  if (!hasAccess) return null;
                  
                  return (
                    <Badge 
                      key={config.key} 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {config.label}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {roles.length === 0 && (
        <Card className="p-12 text-center">
          <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Aucun rôle configuré
          </h3>
          <p className="text-slate-500 mb-4">
            Créez des rôles personnalisés pour votre organisation
          </p>
          {canManageRoles && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer un rôle
            </Button>
          )}
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={handleEditDialogChange}>
        <DialogContent size="xl" className="overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>
              Modifiez les informations et permissions de ce rôle
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="edit-name">Nom du rôle *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1.5"
                  rows={2}
                />
              </div>
            </div>
            
            <div>
              <Label className="text-base font-semibold">Permissions par module</Label>
              <p className="text-sm text-slate-500 mb-4">
                Définissez les actions autorisées pour chaque module
              </p>
              <PermissionEditor />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleUpdateRole} 
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le rôle</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteInfo?.canDelete ? (
                <>
                  Êtes-vous sûr de vouloir supprimer le rôle "{deleteInfo.role.name}" ?
                  Cette action est irréversible.
                </>
              ) : (
                <div className="space-y-2">
                  <p>
                    Impossible de supprimer le rôle "{deleteInfo?.role.name}".
                  </p>
                  <p className="text-red-600 font-medium">
                    {deleteInfo?.userCount} utilisateur(s) sont encore assignés à ce rôle.
                  </p>
                  <p>
                    Veuillez d'abord réassigner ces utilisateurs à un autre rôle.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            {deleteInfo?.canDelete && (
              <AlertDialogAction
                onClick={handleDeleteRole}
                className="bg-red-600 hover:bg-red-700"
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Supprimer
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

