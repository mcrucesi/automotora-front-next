'use client';

import { useState, useEffect } from 'react';
import { Users, Car, HandCoins, DollarSign, TrendingUp, Instagram, Facebook, Globe, Phone, Mail, MessageCircle, Bell, Building2, MapPin } from 'lucide-react';
import { KPICard } from '@/components/dashboard';
import { Card, Button, Badge } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api/client';
import { isSuperAdmin } from '@/lib/permissions';
import type { ApiResponse } from '@/types/auth';
import type { SalesStats } from '@/types/sale';
import type { Customer, PaginatedCustomers } from '@/types/customer';
import type { Tenant, PlatformStats } from '@/types/tenant';

export default function DashboardPage() {
  const { user } = useAuth();

  // Business Dashboard State (for regular users)
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [recentLeads, setRecentLeads] = useState<Customer[]>([]);

  // Platform Dashboard State (for SUPERADMIN)
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSuperAdmin(user)) {
      fetchPlatformData();
    } else {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [salesRes, vehiclesRes, customersRes, newLeadsRes] = await Promise.all([
        apiClient.get<ApiResponse<SalesStats>>('/sales/stats').catch(() => ({ data: { totalSales: 0, totalRevenue: 0, averageSalePrice: 0 } })),
        apiClient.get<ApiResponse<{ data: any[] }>>('/vehicles').catch(() => ({ data: { data: [] } })),
        apiClient.get<ApiResponse<PaginatedCustomers>>('/customers', { params: { limit: '10' } }).catch(() => ({ data: { data: [], total: 0 } })),
        apiClient.get<ApiResponse<PaginatedCustomers>>('/customers', { params: { stage: 'new', limit: '5' } }).catch(() => ({ data: { data: [], total: 0 } })),
      ]);

      setSalesStats(salesRes.data);
      setVehicleCount(vehiclesRes.data.data?.length || 0);
      setCustomerCount(customersRes.data.total || 0);
      setNewLeadsCount(newLeadsRes.data.total || 0);
      setRecentLeads(newLeadsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlatformData = async () => {
    try {
      setIsLoading(true);
      const tenantsRes = await apiClient.get<ApiResponse<Tenant[]>>('/tenants');
      const tenantsData = tenantsRes.data || [];

      setTenants(tenantsData);

      // Calculate platform stats from tenants data
      const stats: PlatformStats = {
        totalTenants: tenantsData.length,
        activeTenants: tenantsData.filter(t => t.isActive).length,
        totalUsers: tenantsData.reduce((acc, t) => acc + (t._count?.users || 0), 0),
        totalLocations: tenantsData.reduce((acc, t) => acc + (t._count?.locations || 0), 0),
      };

      setPlatformStats(stats);
    } catch (err) {
      console.error('Error fetching platform data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSourceIcon = (source: string, sourceDetail?: string) => {
    if (source === 'social_media') {
      if (sourceDetail?.toLowerCase().includes('instagram')) {
        return <Instagram size={16} className="text-pink-500" />;
      }
      if (sourceDetail?.toLowerCase().includes('facebook')) {
        return <Facebook size={16} className="text-blue-600" />;
      }
      if (sourceDetail?.toLowerCase().includes('tiktok')) {
        return <MessageCircle size={16} className="text-black" />;
      }
      return <Globe size={16} className="text-purple-500" />;
    }
    if (source === 'web') return <Globe size={16} className="text-blue-500" />;
    if (source === 'phone') return <Phone size={16} className="text-green-500" />;
    if (source === 'email') return <Mail size={16} className="text-red-500" />;
    return null;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  // KPIs para SUPERADMIN (Platform)
  const platformKpis = [
    {
      title: 'Tenants',
      value: isLoading ? '...' : platformStats?.totalTenants || 0,
      unit: 'Total',
      icon: Building2,
      iconColor: 'text-blue-500'
    },
    {
      title: 'Tenants Activos',
      value: isLoading ? '...' : platformStats?.activeTenants || 0,
      unit: 'Operando',
      icon: Building2,
      iconColor: 'text-green-500'
    },
    {
      title: 'Usuarios',
      value: isLoading ? '...' : platformStats?.totalUsers || 0,
      unit: 'Total',
      icon: Users,
      iconColor: 'text-indigo-500'
    },
    {
      title: 'Ubicaciones',
      value: isLoading ? '...' : platformStats?.totalLocations || 0,
      unit: 'Total',
      icon: MapPin,
      iconColor: 'text-purple-500'
    },
  ];

  // KPIs para usuarios de negocio (ADMIN, SALES_LEADER, etc.)
  const businessKpis = [
    {
      title: 'Leads Nuevos',
      value: isLoading ? '...' : newLeadsCount,
      unit: 'Sin Contactar',
      icon: Bell,
      iconColor: 'text-orange-500'
    },
    {
      title: 'Total Leads',
      value: isLoading ? '...' : customerCount,
      unit: 'Registrados',
      icon: Users,
      iconColor: 'text-indigo-500'
    },
    {
      title: 'Vehículos',
      value: isLoading ? '...' : vehicleCount,
      unit: 'En Inventario',
      icon: Car,
      iconColor: 'text-sky-500'
    },
    {
      title: 'Ingresos',
      value: isLoading ? '...' : formatCurrency(salesStats?.totalRevenue || 0),
      unit: 'Total',
      icon: DollarSign,
      iconColor: 'text-success'
    },
  ];

  const kpis = isSuperAdmin(user) ? platformKpis : businessKpis;

  // Obtener el primer nombre del usuario
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  // Render SUPERADMIN Dashboard
  if (isSuperAdmin(user)) {
    return (
      <>
        {/* Welcome Card */}
        <Card className="mb-8 border-t-4 border-blue-500">
          <h1 className="text-3xl font-extrabold text-text-main mb-1">
            Bienvenido, {user ? getFirstName(user.fullName) : 'Usuario'} 👋
          </h1>
          <div className="flex justify-between items-center text-text-subtle text-sm">
            <span className="capitalize">{user?.role || 'Usuario'} · {user?.email || ''}</span>
            <Badge variant="primary">Platform Admin</Badge>
          </div>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {kpis.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        {/* Main Content - Tenants List */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary-500" />
                <h2 className="text-xl font-bold text-text-main">
                  Tenants Registrados
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/tenants'}
              >
                Ver Todos
              </Button>
            </div>

            {isLoading ? (
              <p className="text-text-subtle text-center py-8">Cargando tenants...</p>
            ) : tenants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-subtle mb-2">No hay tenants registrados</p>
                <p className="text-sm text-text-subtle">Crea el primer tenant para comenzar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuarios
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ubicaciones
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tenants.slice(0, 10).map((tenant) => (
                      <tr
                        key={tenant.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => window.location.href = `/tenants/${tenant.id}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {tenant.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {tenant.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="accent" className="capitalize">
                            {tenant.plan}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={tenant.isActive ? 'success' : 'gray'}>
                            {tenant.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tenant._count?.users || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tenant._count?.locations || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(tenant.createdAt).toLocaleDateString('es-ES')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </>
    );
  }

  // Render Business Dashboard (for ADMIN, SALES_LEADER, SELLER, AUDITOR)
  return (
    <>
      {/* Welcome Card */}
      <Card className="mb-8 border-t-4 border-primary-500">
        <h1 className="text-3xl font-extrabold text-text-main mb-1">
          Bienvenido, {user ? getFirstName(user.fullName) : 'Usuario'} 👋
        </h1>
        <div className="flex justify-between items-center text-text-subtle text-sm">
          <span className="capitalize">{user?.role || 'Usuario'} · {user?.email || ''}</span>
          <span className="font-medium text-gray-500 hidden sm:block">
            🗓 Noviembre 2025
          </span>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary-500" />
                <h2 className="text-xl font-bold text-text-main">
                  Leads Nuevos
                </h2>
                {newLeadsCount > 0 && (
                  <Badge variant="error">
                    {newLeadsCount}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/crm?stage=new'}
              >
                Ver Todos
              </Button>
            </div>

            {isLoading ? (
              <p className="text-text-subtle text-center py-8">Cargando leads...</p>
            ) : recentLeads.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-subtle mb-2">No hay leads nuevos</p>
                <p className="text-sm text-text-subtle">Todos los leads han sido contactados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => {
                  const tags = lead.tags as { source_detail?: string; campaign?: string } | null;
                  return (
                    <div
                      key={lead.id}
                      className="flex items-start gap-3 p-3 bg-surface-main rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => window.location.href = '/crm'}
                    >
                      {/* Avatar */}
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 font-bold text-sm">
                          {lead.firstName[0]}{lead.lastName[0]}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-text-main truncate">
                            {lead.fullName}
                          </p>
                          {lead.source === 'social_media' && (
                            <Badge variant="accent" className="flex items-center gap-1">
                              {getSourceIcon(lead.source, tags?.source_detail)}
                              <span className="capitalize">{tags?.source_detail || 'Social'}</span>
                            </Badge>
                          )}
                          {tags?.campaign && (
                            <Badge variant="gray" className="text-xs">
                              {tags.campaign}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-text-subtle">
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {lead.phone}
                          </span>
                          {lead.email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail size={14} />
                              {lead.email}
                            </span>
                          )}
                        </div>
                        {lead.notes && (
                          <p className="text-xs text-text-subtle mt-1 line-clamp-2">
                            {lead.notes}
                          </p>
                        )}
                      </div>

                      {/* Time */}
                      <div className="text-xs text-text-subtle flex-shrink-0">
                        {formatTimeAgo(lead.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-bold text-text-main mb-4">
              Estadísticas de Fuentes
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Instagram size={18} className="text-pink-500" />
                  <span className="text-sm text-text-main">Instagram</span>
                </div>
                <Badge variant="primary">
                  {recentLeads.filter(l => {
                    const tags = l.tags as { source_detail?: string } | null;
                    return tags?.source_detail?.toLowerCase().includes('instagram');
                  }).length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Facebook size={18} className="text-blue-600" />
                  <span className="text-sm text-text-main">Facebook</span>
                </div>
                <Badge variant="primary">
                  {recentLeads.filter(l => {
                    const tags = l.tags as { source_detail?: string } | null;
                    return tags?.source_detail?.toLowerCase().includes('facebook');
                  }).length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageCircle size={18} className="text-black" />
                  <span className="text-sm text-text-main">TikTok</span>
                </div>
                <Badge variant="primary">
                  {recentLeads.filter(l => {
                    const tags = l.tags as { source_detail?: string } | null;
                    return tags?.source_detail?.toLowerCase().includes('tiktok');
                  }).length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-blue-500" />
                  <span className="text-sm text-text-main">Landing Page</span>
                </div>
                <Badge variant="primary">
                  {recentLeads.filter(l => {
                    const tags = l.tags as { source_detail?: string } | null;
                    return tags?.source_detail?.toLowerCase().includes('landing');
                  }).length}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
