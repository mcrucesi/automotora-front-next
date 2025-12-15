'use client';

import { useState } from 'react';
import { LayoutDashboard, Car, Users, DollarSign, MapPin, Handshake, UserCog, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { canViewModule } from '@/lib/permissions';

interface NavItem {
  name: string;
  icon: any;
  href: string;
  module?: string; // Para verificar permisos
}

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Tenants', icon: Building2, href: '/tenants', module: 'tenants' },
  { name: 'Inventario', icon: Car, href: '/inventory', module: 'vehicles' },
  { name: 'Consignaciones', icon: Handshake, href: '/consignments', module: 'consignments' },
  { name: 'CRM', icon: Users, href: '/crm', module: 'customers' },
  { name: 'Ventas', icon: DollarSign, href: '/sales', module: 'sales' },
  { name: 'Usuarios', icon: UserCog, href: '/users', module: 'users' },
];

export const BottomNav = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { user } = useAuth();

  // Filtrar items según permisos
  const visibleItems = navItems.filter((item) => {
    // Dashboard siempre visible
    if (!item.module) return true;
    // Verificar permisos del módulo
    return canViewModule(user, item.module);
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 shadow-xl-custom z-20">
      <div className="flex justify-around items-center h-14">
        {visibleItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setActiveTab(item.name)}
            className={`flex flex-col items-center text-xs font-medium pt-1
              ${
                activeTab === item.name
                  ? 'text-primary-500'
                  : 'text-text-subtle hover:text-primary-700'
              }
            `}
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};
