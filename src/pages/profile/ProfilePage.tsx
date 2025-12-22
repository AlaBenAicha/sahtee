/**
 * Profile Page - User profile management
 */

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, Building2, Camera } from "lucide-react";

export default function ProfilePage() {
  const { user, userProfile } = useAuth();

  const initials = userProfile 
    ? `${userProfile.firstName?.[0] || ""}${userProfile.lastName?.[0] || ""}`
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mon profil</h1>
        <p className="text-slate-600 mt-1">Gérez vos informations personnelles</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="bg-emerald-500 text-white text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {userProfile?.firstName} {userProfile?.lastName}
              </h2>
              <p className="text-slate-500">{userProfile?.jobTitle || "Utilisateur"}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
          <CardDescription>Mettez à jour vos informations de profil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                defaultValue={userProfile?.firstName || ""}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                defaultValue={userProfile?.lastName || ""}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobTitle">Fonction</Label>
              <Input
                id="jobTitle"
                defaultValue={userProfile?.jobTitle || ""}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="department">Département</Label>
              <Input
                id="department"
                defaultValue={userProfile?.department || ""}
                className="mt-2"
              />
            </div>
          </div>

          <Button className="bg-emerald-500 hover:bg-emerald-600">
            Sauvegarder les modifications
          </Button>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Coordonnées
          </CardTitle>
          <CardDescription>Vos informations de contact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.email || ""}
              disabled
              className="mt-2 bg-slate-50"
            />
            <p className="text-xs text-slate-500 mt-1">
              L'email ne peut pas être modifié directement
            </p>
          </div>

          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              defaultValue={userProfile?.phone || ""}
              placeholder="+213 xxx xxx xxx"
              className="mt-2"
            />
          </div>

          <Button className="bg-emerald-500 hover:bg-emerald-600">
            Sauvegarder les modifications
          </Button>
        </CardContent>
      </Card>

      {/* Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organisation
          </CardTitle>
          <CardDescription>Votre affiliation organisationnelle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="font-medium text-slate-900">Entreprise Demo</p>
            <p className="text-sm text-slate-500 mt-1">
              Rôle: {userProfile?.role === "admin" ? "Administrateur" : "Utilisateur"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

