/**
 * Admin Page - Organization Administration
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, Shield, Settings, Plus, Loader2 } from "lucide-react";
import { getUsersByOrganization } from "@/services/userService";
import { getRolesByOrganization } from "@/services/roleService";
import { getDepartmentsByOrganization } from "@/services/organizationService";

export default function AdminPage() {
  const { userProfile, session } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    departments: 0,
    roles: 0,
    loading: true,
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!userProfile?.organizationId) return;
      
      try {
        const [usersResult, roles, departments] = await Promise.all([
          getUsersByOrganization(userProfile.organizationId),
          getRolesByOrganization(userProfile.organizationId),
          getDepartmentsByOrganization(userProfile.organizationId),
        ]);
        
        setStats({
          users: usersResult.items.filter(u => u.status === "active").length,
          departments: departments.length,
          roles: roles.length,
          loading: false,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    
    loadStats();
  }, [userProfile?.organizationId]);

  // Check if user can manage users
  const canManageUsers = session?.isOrgAdmin || session?.featurePermissions?.users?.create;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Administration</h1>
          <p className="text-slate-600 mt-1">Gérez votre organisation et vos utilisateurs</p>
        </div>
        {canManageUsers && (
          <Link to="/app/admin/users">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Inviter un utilisateur
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/app/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Utilisateurs
              </CardTitle>
              <CardDescription>Gérez les membres de votre équipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {stats.loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-slate-900">{stats.users}</p>
                      <p className="text-sm text-slate-500">utilisateurs actifs</p>
                    </>
                  )}
                </div>
                <Button variant="outline" size="sm">Gérer</Button>
              </div>
            </CardContent>
          </Card>
        </Link>

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
                {stats.loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                ) : (
                  <>
                    <p className="text-3xl font-bold text-slate-900">{stats.departments}</p>
                    <p className="text-sm text-slate-500">départements</p>
                  </>
                )}
              </div>
              <Button variant="outline" size="sm" disabled>Gérer</Button>
            </div>
          </CardContent>
        </Card>

        <Link to="/app/admin/roles">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
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
                  {stats.loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-slate-900">{stats.roles}</p>
                      <p className="text-sm text-slate-500">rôles définis</p>
                    </>
                  )}
                </div>
                <Button variant="outline" size="sm">Gérer</Button>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/settings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
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
        </Link>
      </div>
    </div>
  );
}

