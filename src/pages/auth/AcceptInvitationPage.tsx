/**
 * Accept Invitation Page
 * 
 * Allows invited users to accept their invitation and complete signup.
 * Flow:
 * 1. Validate invitation token
 * 2. Collect user information (name, password)
 * 3. Create user account linked to the organization
 * 4. Assign the pre-selected role
 * 5. Update invitation status to accepted
 */

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, Timestamp, writeBatch, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Shield,
  Building2,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserInvitation, User } from "@/types/user";
import type { Organization, CustomRole } from "@/types/organization";
import { getInvitationByToken } from "@/services/userService";
import { getRoleById } from "@/services/roleService";

// Invitation validation states
type InvitationState = "loading" | "valid" | "expired" | "accepted" | "cancelled" | "not_found" | "error";

interface InvitationData {
  invitation: UserInvitation;
  organization: Organization;
  role: CustomRole;
}

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  // State
  const [invitationState, setInvitationState] = useState<InvitationState>("loading");
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load and validate invitation
  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        setInvitationState("not_found");
        return;
      }
      
      try {
        const invitation = await getInvitationByToken(token);
        
        if (!invitation) {
          setInvitationState("not_found");
          return;
        }
        
        // Check invitation status
        if (invitation.status === "accepted") {
          setInvitationState("accepted");
          return;
        }
        
        if (invitation.status === "cancelled") {
          setInvitationState("cancelled");
          return;
        }
        
        if (invitation.status === "expired") {
          setInvitationState("expired");
          return;
        }
        
        // Check if expired
        const expiresAt = invitation.expiresAt.toDate ? invitation.expiresAt.toDate() : new Date(invitation.expiresAt);
        if (new Date() > expiresAt) {
          setInvitationState("expired");
          return;
        }
        
        // Load organization
        const orgDoc = await getDoc(doc(db, "organizations", invitation.organizationId));
        if (!orgDoc.exists()) {
          setInvitationState("error");
          return;
        }
        const organization = { id: orgDoc.id, ...orgDoc.data() } as Organization;
        
        // Load role
        const role = await getRoleById(invitation.roleId);
        if (!role) {
          setInvitationState("error");
          return;
        }
        
        setInvitationData({ invitation, organization, role });
        setInvitationState("valid");
        
        // Pre-fill form with invitation data if provided
        if (invitation.firstName || invitation.lastName) {
          setFormData(prev => ({
            ...prev,
            firstName: invitation.firstName || "",
            lastName: invitation.lastName || "",
          }));
        }
      } catch (error) {
        console.error("Error validating invitation:", error);
        setInvitationState("error");
      }
    };
    
    validateInvitation();
  }, [token]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }
    
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle accept invitation
  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !invitationData) return;
    
    setLoading(true);
    try {
      const { invitation, organization, role } = invitationData;
      
      // Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(
        auth, 
        invitation.email, 
        formData.password
      );
      const firebaseUser = credential.user;
      
      // Update display name
      const displayName = `${formData.firstName} ${formData.lastName}`;
      await updateProfile(firebaseUser, { displayName });
      
      const now = Timestamp.now();
      
      // Use batch for atomic operations
      const batch = writeBatch(db);
      
      // Create user profile
      const userProfile: Omit<User, "id"> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        organizationId: invitation.organizationId,
        role: "user", // Legacy role field
        roleId: invitation.roleId,
        isOrgAdmin: false,
        ...(invitation.departmentId && { departmentId: invitation.departmentId }), // Only include if defined
        ...(invitation.jobTitle && { jobTitle: invitation.jobTitle }), // Only include if defined
        status: "active",
        emailVerified: false,
        onboardingCompleted: false,
        onboardingStep: 0,
        preferences: {
          language: "fr",
          theme: "system",
          notifications: {
            email: true,
            push: true,
            sms: false,
            digest: "weekly",
            categories: {
              incidents: true,
              capa: true,
              training: true,
              compliance: true,
              system: true,
            },
          },
          dashboard: {
            defaultView: "overview",
            widgets: [],
            refreshInterval: 5,
          },
        },
        audit: {
          createdBy: invitation.invitedBy,
          createdAt: now,
          updatedBy: firebaseUser.uid,
          updatedAt: now,
        },
        createdAt: now,
        updatedAt: now,
      };
      
      batch.set(doc(db, "users", firebaseUser.uid), userProfile);
      
      // Update invitation status
      batch.update(doc(db, "invitations", invitation.id), {
        status: "accepted",
        acceptedAt: now,
        acceptedBy: firebaseUser.uid,
        updatedAt: now,
      });
      
      // Commit batch
      await batch.commit();
      
      // Send verification email
      await sendEmailVerification(firebaseUser);
      
      setSuccess(true);
      toast.success("Compte créé avec succès !");
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/app/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      
      let errorMessage = "Une erreur s'est produite lors de la création du compte";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Un compte existe déjà avec cette adresse email";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Le mot de passe est trop faible";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render based on invitation state
  const renderContent = () => {
    // Loading state
    if (invitationState === "loading") {
      return (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-[var(--sahtee-blue-primary)] mb-4" />
              <p className="text-slate-600">Validation de l'invitation...</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Not found state
    if (invitationState === "not_found") {
      return (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Invitation introuvable
              </h2>
              <p className="text-slate-600 mb-6">
                Le lien d'invitation n'est pas valide ou a été supprimé.
              </p>
              <Link to="/">
                <Button>Retour à l'accueil</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Expired state
    if (invitationState === "expired") {
      return (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Invitation expirée
              </h2>
              <p className="text-slate-600 mb-6">
                Cette invitation a expiré. Veuillez contacter l'administrateur de l'organisation pour obtenir une nouvelle invitation.
              </p>
              <Link to="/">
                <Button>Retour à l'accueil</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Already accepted state
    if (invitationState === "accepted") {
      return (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Invitation déjà acceptée
              </h2>
              <p className="text-slate-600 mb-6">
                Vous avez déjà accepté cette invitation. Connectez-vous pour accéder à votre compte.
              </p>
              <Link to="/login">
                <Button className="bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)] text-white">
                  Se connecter
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Cancelled state
    if (invitationState === "cancelled") {
      return (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Invitation annulée
              </h2>
              <p className="text-slate-600 mb-6">
                Cette invitation a été annulée. Veuillez contacter l'administrateur de l'organisation.
              </p>
              <Link to="/">
                <Button>Retour à l'accueil</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Error state
    if (invitationState === "error") {
      return (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Erreur
              </h2>
              <p className="text-slate-600 mb-6">
                Une erreur s'est produite lors de la validation de l'invitation. Veuillez réessayer.
              </p>
              <Link to="/">
                <Button>Retour à l'accueil</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Success state
    if (success) {
      return (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Bienvenue chez {invitationData?.organization.name} !
              </h2>
              <p className="text-slate-600 mb-6">
                Votre compte a été créé avec succès. Vous allez être redirigé vers le tableau de bord...
              </p>
              <Loader2 className="h-6 w-6 animate-spin text-[var(--sahtee-blue-primary)]" />
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Valid invitation - show signup form
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-[var(--sahtee-blue-primary)] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/30">
              S
            </div>
          </div>
          <CardTitle className="text-2xl">Rejoindre l'organisation</CardTitle>
          <CardDescription>
            Vous avez été invité à rejoindre une organisation sur SAHTEE
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Invitation info */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Organisation</p>
                <p className="font-medium text-slate-900">{invitationData?.organization.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{invitationData?.invitation.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Rôle attribué</p>
                <Badge variant="secondary" className="bg-secondary text-primary mt-0.5">
                  {invitationData?.role.name}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Signup form */}
          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={cn("mt-1.5", errors.firstName && "border-red-500")}
                  disabled={loading}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={cn("mt-1.5", errors.lastName && "border-red-500")}
                  disabled={loading}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={cn("pr-10", errors.password && "border-red-500")}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Au moins 8 caractères
              </p>
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={cn("mt-1.5", errors.confirmPassword && "border-red-500")}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[var(--sahtee-blue-primary)] hover:bg-[var(--sahtee-blue-secondary)] text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Créer mon compte
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-slate-500">
              Vous avez déjà un compte ?{" "}
              <Link to="/login" className="text-[var(--sahtee-blue-primary)] hover:underline font-medium">
                Connectez-vous
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      {renderContent()}
    </div>
  );
}

