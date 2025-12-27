/**
 * AppLayout - Main application layout with sidebar navigation
 */

import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AgentProvider } from "@/contexts/AgentContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  AlertTriangle,
  FileWarning,
  GraduationCap,
  CheckCircle2,
  HeartPulse,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Bell,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeatureModule } from "@/types/organization";
import { SafetyBot } from "@/components/safetybot";
import { AgentActiveOverlay } from "@/components/agent/AgentActiveOverlay";
import { AgentStopButton } from "@/components/agent/AgentStopButton";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  /** Feature module for permission checking. If undefined, item is always visible */
  feature?: FeatureModule;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { label: "Tableau de bord", icon: LayoutDashboard, path: "/app/dashboard", feature: "dashboard" },
  { label: "Incidents", icon: AlertTriangle, path: "/app/incidents", feature: "incidents", badge: 3 },
  { label: "CAPA", icon: FileWarning, path: "/app/capa", feature: "capa", badge: 5 },
  { label: "Formations", icon: GraduationCap, path: "/app/training", feature: "training" },
  { label: "Conformité", icon: CheckCircle2, path: "/app/compliance", feature: "compliance" },
  { label: "Santé", icon: HeartPulse, path: "/app/health", feature: "health" },
  { label: "Analytiques", icon: BarChart3, path: "/app/analytics", feature: "analytics" },
];

const adminNavItems: NavItem[] = [
  { label: "Administration", icon: Users, path: "/app/admin", feature: "users" },
  { label: "Paramètres", icon: Settings, path: "/app/settings", feature: "settings" },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { user, userProfile, signOut, canAccessFeature } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Filter nav items based on user permissions
  const visibleMainNavItems = mainNavItems.filter(
    (item) => !item.feature || canAccessFeature(item.feature)
  );
  const visibleAdminNavItems = adminNavItems.filter(
    (item) => !item.feature || canAccessFeature(item.feature)
  );

  // Track desktop breakpoint for sidebar margin
  React.useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = userProfile
    ? `${userProfile.firstName?.[0] || ""}${userProfile.lastName?.[0] || ""}`
    : user?.email?.[0]?.toUpperCase() || "U";

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      to={item.path}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
        "hover:bg-slate-100 group",
        collapsed && "justify-center",
        isActive(item.path)
          ? "bg-emerald-50 text-emerald-700 font-medium"
          : "text-slate-600"
      )}
      onClick={() => setMobileMenuOpen(false)}
      title={collapsed ? item.label : undefined}
    >
      <item.icon
        className={cn(
          "h-5 w-5 flex-shrink-0",
          isActive(item.path)
            ? "text-emerald-600"
            : "text-slate-400 group-hover:text-slate-600"
        )}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && item.badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full text-[10px]">
          {item.badge}
        </span>
      )}
    </Link>
  );

  return (
    <AgentProvider>
    <div className="min-h-screen bg-slate-50">
      {/* Agent Mode Overlay */}
      <AgentActiveOverlay />
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-sm">
              S
            </div>
            <span className="font-bold text-slate-900">SAHTEE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="bg-emerald-500 text-white text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{userProfile?.firstName} {userProfile?.lastName}</span>
                  <span className="text-xs font-normal text-slate-500">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/app/profile">
                  <User className="mr-2 h-4 w-4" />
                  Mon profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col",
          collapsed ? "w-20" : "w-64",
          "hidden lg:flex",
          mobileMenuOpen && "!flex"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "h-16 flex items-center border-b border-slate-200 px-4 relative",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <Link to="/app/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30 flex-shrink-0">
              S
            </div>
            {!collapsed && (
              <span className="font-bold text-xl text-slate-900">SAHTEE</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hidden lg:flex transition-all",
              collapsed
                ? "absolute -right-3 top-1/2 -translate-y-1/2 bg-white border shadow-sm rounded-full h-6 w-6 hover:bg-slate-50"
                : ""
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {visibleMainNavItems.length > 0 && (
            <div className="space-y-1">
              {!collapsed && (
                <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Principal
                </p>
              )}
              {collapsed && <div className="h-2" />}
              {visibleMainNavItems.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>
          )}

          {visibleAdminNavItems.length > 0 && (
            <div className="pt-4 space-y-1">
              {!collapsed && (
                <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Configuration
                </p>
              )}
              {collapsed && <div className="h-2 border-t border-slate-100 my-2" />}
              {visibleAdminNavItems.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className={cn(
          "border-t border-slate-200 p-3",
          collapsed && "flex justify-center"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-auto py-2",
                  collapsed && "w-auto p-2 justify-center"
                )}
              >
                <Avatar className={cn("flex-shrink-0", collapsed ? "h-8 w-8" : "h-9 w-9")}>
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="bg-emerald-500 text-white text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {userProfile?.firstName} {userProfile?.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/app/profile">
                  <User className="mr-2 h-4 w-4" />
                  Mon profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content - offset by sidebar width on desktop */}
      <main
        className="min-h-screen pt-16 lg:pt-0 transition-all duration-300"
        style={{ marginLeft: isDesktop ? (collapsed ? 80 : 256) : 0 }}
      >
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {/* Dynamic title based on current page */}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback className="bg-emerald-500 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{userProfile?.firstName} {userProfile?.lastName}</span>
                    <span className="text-xs font-normal text-slate-500">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/profile">
                    <User className="mr-2 h-4 w-4" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* SafetyBot AI Assistant */}
      <SafetyBot />

      {/* Agent Stop Button */}
      <AgentStopButton />
    </div>
    </AgentProvider>
  );
}
