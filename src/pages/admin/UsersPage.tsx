/**
 * Users Management Page
 * 
 * Allows org_admin to manage users and send invitations.
 * Features:
 * - View all organization users
 * - Invite users via email
 * - Generate shareable invitation links
 * - Assign roles to users
 * - Manage pending invitations
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Users, 
  Plus, 
  Mail,
  Link2,
  Copy,
  Trash2, 
  UserCheck,
  Clock,
  XCircle,
  Loader2,
  ArrowLeft,
  MoreHorizontal,
  Shield,
  Send,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User, UserInvitation, UserStatus } from "@/types/user";
import type { CustomRole } from "@/types/organization";
import {
  getUsersByOrganization,
  createInvitation,
  getInvitationsByOrganization,
  cancelInvitation,
  updateUserRoleId,
} from "@/services/userService";
import { getRolesByOrganization } from "@/services/roleService";

// Status badge configuration
const STATUS_CONFIG: Record<UserStatus, { label: string; color: string }> = {
  active: { label: "Actif", color: "bg-emerald-100 text-emerald-700" },
  deactivated: { label: "Désactivé", color: "bg-slate-100 text-slate-600" },
  suspended: { label: "Suspendu", color: "bg-red-100 text-red-700" },
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700" },
};

// Invitation status configuration
const INVITATION_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-700", icon: Clock },
  accepted: { label: "Acceptée", color: "bg-emerald-100 text-emerald-700", icon: UserCheck },
  expired: { label: "Expirée", color: "bg-slate-100 text-slate-600", icon: XCircle },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function UsersPage() {
  const { session, userProfile } = useAuth();
  
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dialog states
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRoleChangeDialog, setShowRoleChangeDialog] = useState(false);
  const [showCancelInviteDialog, setShowCancelInviteDialog] = useState(false);
  
  // Form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedInvitation, setSelectedInvitation] = useState<UserInvitation | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    if (!userProfile?.organizationId) return;
    
    setLoading(true);
    try {
      const [orgUsers, orgInvitations, orgRoles] = await Promise.all([
        getUsersByOrganization(userProfile.organizationId),
        getInvitationsByOrganization(userProfile.organizationId),
        getRolesByOrganization(userProfile.organizationId),
      ]);
      
      setUsers(orgUsers);
      setInvitations(orgInvitations);
      setRoles(orgRoles);
      
      // Set default role for invitations
      if (orgRoles.length > 0 && !inviteRoleId) {
        const employeeRole = orgRoles.find(r => r.name === "Employé");
        setInviteRoleId(employeeRole?.id || orgRoles[0].id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [userProfile?.organizationId, inviteRoleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check if user can manage users
  const canManageUsers = session?.isOrgAdmin || session?.featurePermissions?.users?.create;

  // Get role name by ID
  const getRoleName = (roleId: string): string => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || "Non assigné";
  };

  // Handle send invitation
  const handleSendInvitation = async () => {
    if (!inviteEmail.trim() || !inviteRoleId) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error("Adresse email invalide");
      return;
    }
    
    // Check if email is already used
    const existingUser = users.find(u => u.email.toLowerCase() === inviteEmail.toLowerCase());
    if (existingUser) {
      toast.error("Un utilisateur avec cette adresse email existe déjà");
      return;
    }
    
    // Check if invitation already exists
    const existingInvitation = invitations.find(
      i => i.email.toLowerCase() === inviteEmail.toLowerCase() && i.status === "pending"
    );
    if (existingInvitation) {
      toast.error("Une invitation est déjà en cours pour cette adresse email");
      return;
    }
    
    if (!userProfile?.organizationId || !userProfile.uid) return;
    
    setSaving(true);
    try {
      const invitation = await createInvitation(
        inviteEmail,
        userProfile.organizationId,
        inviteRoleId,
        userProfile.uid
      );
      
      setInvitations(prev => [invitation, ...prev]);
      
      // Generate invitation link
      const invitationLink = `${window.location.origin}/accept-invitation?token=${invitation.token}`;
      setGeneratedLink(invitationLink);
      
      toast.success("Invitation envoyée avec succès");
      setInviteEmail("");
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Erreur lors de l'envoi de l'invitation");
    } finally {
      setSaving(false);
    }
  };

  // Handle copy invitation link
  const handleCopyLink = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success("Lien copié dans le presse-papiers");
    } catch (error) {
      console.error("Error copying link:", error);
      toast.error("Erreur lors de la copie");
    }
  };

  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRoleId || !userProfile?.uid) return;
    
    setSaving(true);
    try {
      await updateUserRoleId(selectedUser.id, selectedRoleId, userProfile.uid);
      
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { ...u, roleId: selectedRoleId }
          : u
      ));
      
      setShowRoleChangeDialog(false);
      setSelectedUser(null);
      toast.success("Rôle mis à jour avec succès");
    } catch (error) {
      console.error("Error changing role:", error);
      toast.error("Erreur lors du changement de rôle");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel invitation
  const handleCancelInvitation = async () => {
    if (!selectedInvitation) return;
    
    setSaving(true);
    try {
      await cancelInvitation(selectedInvitation.id);
      
      setInvitations(prev => prev.map(i => 
        i.id === selectedInvitation.id 
          ? { ...i, status: "cancelled" as const }
          : i
      ));
      
      setShowCancelInviteDialog(false);
      setSelectedInvitation(null);
      toast.success("Invitation annulée");
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast.error("Erreur lors de l'annulation");
    } finally {
      setSaving(false);
    }
  };

  // Open role change dialog
  const openRoleChangeDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRoleId(user.roleId || "");
    setShowRoleChangeDialog(true);
  };

  // Get user initials
  const getInitials = (user: User): string => {
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  // Format date
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Pending invitations count
  const pendingInvitationsCount = invitations.filter(i => i.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
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
            <h1 className="text-3xl font-bold text-slate-900">Gestion des utilisateurs</h1>
            <p className="text-slate-600 mt-1">
              Gérez les utilisateurs et les invitations de votre organisation
            </p>
          </div>
        </div>
        
        {canManageUsers && (
          <Dialog open={showInviteDialog} onOpenChange={(open) => {
            setShowInviteDialog(open);
            if (!open) {
              setGeneratedLink("");
              setInviteEmail("");
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <Plus className="mr-2 h-4 w-4" />
                Inviter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Inviter un utilisateur</DialogTitle>
                <DialogDescription>
                  Envoyez une invitation par email ou partagez un lien d'invitation
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="email">Adresse email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="utilisateur@exemple.com"
                    className="mt-1.5"
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Rôle à attribuer *</Label>
                  <Select value={inviteRoleId} onValueChange={setInviteRoleId}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-slate-400" />
                            {role.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {generatedLink && (
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Link2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">
                        Lien d'invitation généré
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        value={generatedLink} 
                        readOnly 
                        className="text-xs bg-white"
                      />
                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={handleCopyLink}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-emerald-600 mt-2">
                      Partagez ce lien avec l'utilisateur pour qu'il puisse rejoindre votre organisation.
                    </p>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Fermer
                </Button>
                <Button 
                  onClick={handleSendInvitation} 
                  disabled={saving || !inviteEmail.trim() || !inviteRoleId}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Envoyer l'invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Utilisateurs actifs</CardDescription>
            <CardTitle className="text-3xl">
              {users.filter(u => u.status === "active").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              sur {users.length} utilisateurs au total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Invitations en attente</CardDescription>
            <CardTitle className="text-3xl">
              {pendingInvitationsCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              invitations non acceptées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rôles configurés</CardDescription>
            <CardTitle className="text-3xl">
              {roles.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/app/admin/roles" className="text-xs text-emerald-600 hover:underline">
              Gérer les rôles →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Utilisateurs ({users.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-2">
            <Mail className="h-4 w-4" />
            Invitations 
            {pendingInvitationsCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-700">
                {pendingInvitationsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Liste des utilisateurs</CardTitle>
              <CardDescription>
                Tous les membres de votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-600 text-sm">
                              {getInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900">
                              {user.firstName} {user.lastName}
                              {user.isOrgAdmin && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Admin
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100">
                          {getRoleName(user.roleId || "")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={STATUS_CONFIG[user.status]?.color}
                        >
                          {STATUS_CONFIG[user.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {formatDate(user.lastLoginAt)}
                      </TableCell>
                      <TableCell>
                        {canManageUsers && !user.isOrgAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openRoleChangeDialog(user)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Changer le rôle
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        Aucun utilisateur dans votre organisation
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invitations</CardTitle>
                  <CardDescription>
                    Gérez les invitations envoyées
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadData}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualiser
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Envoyée le</TableHead>
                    <TableHead>Expire le</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => {
                    const statusConfig = INVITATION_STATUS_CONFIG[invitation.status];
                    const StatusIcon = statusConfig?.icon || Clock;
                    
                    return (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">{invitation.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-slate-100">
                            {getRoleName(invitation.roleId)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={cn("gap-1", statusConfig?.color)}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {formatDate(invitation.createdAt)}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {formatDate(invitation.expiresAt)}
                        </TableCell>
                        <TableCell>
                          {invitation.status === "pending" && canManageUsers && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedInvitation(invitation);
                                setShowCancelInviteDialog(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {invitations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        Aucune invitation envoyée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Change Dialog */}
      <Dialog open={showRoleChangeDialog} onOpenChange={setShowRoleChangeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer le rôle</DialogTitle>
            <DialogDescription>
              Modifier le rôle de {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="new-role">Nouveau rôle</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-slate-400" />
                      {role.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleChangeDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleRoleChange} 
              disabled={saving || !selectedRoleId}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Invitation Dialog */}
      <AlertDialog open={showCancelInviteDialog} onOpenChange={setShowCancelInviteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler l'invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler l'invitation envoyée à "{selectedInvitation?.email}" ?
              Le lien d'invitation ne sera plus valide.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fermer</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelInvitation}
              className="bg-red-600 hover:bg-red-700"
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Annuler l'invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

