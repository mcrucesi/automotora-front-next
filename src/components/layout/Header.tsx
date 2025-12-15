"use client";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  Car,
  Users,
  LogOut,
  User as UserIcon,
  DollarSign,
  MapPin,
  Handshake,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { RoleBadge } from "@/components/common/RoleBadge";
import { canViewModule } from "@/lib/permissions";

interface NavItem {
  name: string;
  icon: any;
  href: string;
  module?: string; // Para verificar permisos
}

const navItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Inventario", icon: Car, href: "/inventory", module: "vehicles" },
  { name: "Sucursales", icon: MapPin, href: "/locations", module: "locations" },
  { name: "Consignaciones", icon: Handshake, href: "/consignments", module: "consignments" },
  { name: "CRM", icon: Users, href: "/crm", module: "customers" },
  { name: "Ventas", icon: DollarSign, href: "/sales", module: "sales" },
  { name: "Usuarios", icon: UserCog, href: "/users", module: "users" },
];

export const Header = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Obtener iniciales del nombre completo
  const getInitials = (fullName: string) => {
    const names = fullName.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 text-white text-xl font-extrabold"
        >
          <Car size={32} />
          AutoDealer
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-8">
          {navItems
            .filter((item) => !item.module || canViewModule(user, item.module))
            .map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setActiveTab(item.name)}
                className={`
                  flex items-center text-sm font-semibold transition-colors duration-200 pb-1
                  ${
                    activeTab === item.name
                      ? "text-white border-b-2 border-white"
                      : "text-white/70 hover:text-white/90"
                  }
                `}
              >
                <item.icon size={18} className="mr-1" />
                {item.name}
              </Link>
            ))}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <button
            aria-label="Notificaciones"
            className="p-2 relative rounded-full bg-primary-700 text-white hover:bg-accent-500 transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 bg-error rounded-full border-2 border-primary-500"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-white cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-full bg-accent-500 flex items-center justify-center font-bold text-sm">
                {user ? getInitials(user.fullName) : "U"}
              </div>
              <span className="hidden sm:inline text-sm font-medium">
                {user?.fullName || "Usuario"}
              </span>
              <ChevronDown
                size={16}
                className={`hidden sm:inline transition-transform ${
                  showUserMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl-custom py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-text-main">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-text-subtle">{user?.email}</p>
                  {user?.location && (
                    <p className="text-xs text-text-subtle mt-1">
                      {user.location.name}
                    </p>
                  )}
                  <div className="mt-2">
                    <RoleBadge role={user?.role || ''} size="sm" />
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-text-main hover:bg-gray-100 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay to close menu when clicking outside */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};
