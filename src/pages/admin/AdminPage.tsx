/**
 * Admin Page - Organization Administration
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, Shield, Settings, Plus } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Administration</h1>
          <p className="text-slate-600 mt-1">Gérez votre organisation et vos utilisateurs</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="mr-2 h-4 w-4" />
          Inviter un utilisateur
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Utilisateurs
            </CardTitle>
            <CardDescription>Gérez les membres de votre équipe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">12</p>
                <p className="text-sm text-slate-500">utilisateurs actifs</p>
              </div>
              <Button variant="outline" size="sm">Gérer</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Départements
            </CardTitle>
            <CardDescription>Structure organisationnelle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">5</p>
                <p className="text-sm text-slate-500">départements</p>
              </div>
              <Button variant="outline" size="sm">Gérer</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Rôles et permissions
            </CardTitle>
            <CardDescription>Configurez les niveaux d'accès</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">4</p>
                <p className="text-sm text-slate-500">rôles définis</p>
              </div>
              <Button variant="outline" size="sm">Gérer</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-600" />
              Paramètres organisation
            </CardTitle>
            <CardDescription>Configuration générale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Configurez les paramètres de votre organisation</p>
              <Button variant="outline" size="sm">Configurer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

