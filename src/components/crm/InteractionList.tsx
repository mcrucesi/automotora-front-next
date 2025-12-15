"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui';
import { apiClient } from '@/lib/api/client';
import {
  Phone,
  Mail,
  Users,
  MessageCircle,
  Car,
  MoreHorizontal,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import type { Interaction, InteractionType } from '@/types/customer';
import type { ApiResponse } from '@/types/auth';
import { interactionTypeLabels } from '@/lib/validations';

interface InteractionListProps {
  customerId: string;
  refreshTrigger?: number;
}

export const InteractionList = ({ customerId, refreshTrigger = 0 }: InteractionListProps) => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInteractions();
  }, [customerId, refreshTrigger]);

  const fetchInteractions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // El endpoint GET /customers/:id incluye las interacciones
      // pero si hay un endpoint específico para interacciones, se puede usar
      const response = await apiClient.get<ApiResponse<{ interactions: Interaction[] }>>(
        `/customers/${customerId}/interactions`
      );
      setInteractions(response.data.interactions || []);
    } catch (err: any) {
      console.error('Error fetching interactions:', err);
      // Si el endpoint no existe aún, mostrar mensaje apropiado
      if (err.response?.status === 404) {
        setInteractions([]);
      } else {
        const errorMessage = err.response?.data?.error?.message || 'Error al cargar las interacciones';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInteractionIcon = (type: InteractionType) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'call':
        return <Phone className={iconClass} />;
      case 'email':
        return <Mail className={iconClass} />;
      case 'meeting':
        return <Users className={iconClass} />;
      case 'whatsapp':
        return <MessageCircle className={iconClass} />;
      case 'test_drive':
        return <Car className={iconClass} />;
      default:
        return <MoreHorizontal className={iconClass} />;
    }
  };

  const getInteractionColor = (type: InteractionType) => {
    const colors: Record<InteractionType, string> = {
      call: 'bg-blue-100 text-blue-700',
      email: 'bg-purple-100 text-purple-700',
      meeting: 'bg-green-100 text-green-700',
      whatsapp: 'bg-green-100 text-green-700',
      test_drive: 'bg-accent-100 text-accent-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || colors.other;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return `Hoy ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays === 1) {
      return `Ayer ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-text-subtle">Cargando interacciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="text-center py-8 bg-surface-main rounded-lg border border-border-subtle">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-text-subtle" />
        <p className="text-text-subtle">No hay interacciones registradas</p>
        <p className="text-sm text-text-subtle mt-1">
          Registra la primera interacción con este cliente
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-text-main">
          {interactions.length} {interactions.length === 1 ? 'interacción' : 'interacciones'}
        </p>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        {/* Línea vertical del timeline */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border-subtle"></div>

        {interactions.map((interaction, index) => (
          <div key={interaction.id} className="relative pl-14">
            {/* Icono del tipo de interacción */}
            <div
              className={`absolute left-0 top-0 w-12 h-12 rounded-full flex items-center justify-center ${getInteractionColor(
                interaction.type
              )}`}
            >
              {getInteractionIcon(interaction.type)}
            </div>

            {/* Contenido de la interacción */}
            <div className="bg-surface-main border border-border-subtle rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="primary" className="text-xs">
                      {interactionTypeLabels[interaction.type] || interaction.type}
                    </Badge>
                    {interaction.scheduledAt && !interaction.completedAt && (
                      <Badge variant="warning" className="text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Programada
                      </Badge>
                    )}
                    {interaction.completedAt && (
                      <Badge variant="success" className="text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Completada
                      </Badge>
                    )}
                  </div>

                  {interaction.subject && (
                    <h4 className="font-semibold text-text-main">{interaction.subject}</h4>
                  )}
                </div>

                <span className="text-xs text-text-subtle whitespace-nowrap">
                  {formatDate(interaction.createdAt)}
                </span>
              </div>

              {/* Notas */}
              <p className="text-sm text-text-main whitespace-pre-wrap mb-3">
                {interaction.notes}
              </p>

              {/* Fecha programada */}
              {interaction.scheduledAt && (
                <div className="flex items-center gap-2 text-xs text-text-subtle mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Programado para:{' '}
                    {new Date(interaction.scheduledAt).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}

              {/* Resultado */}
              {interaction.outcome && (
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <p className="text-xs font-medium text-text-subtle mb-1">Resultado:</p>
                  <p className="text-sm text-text-main">{interaction.outcome}</p>
                </div>
              )}

              {/* Siguiente acción */}
              {interaction.nextAction && (
                <div className="mt-3 pt-3 border-t border-border-subtle bg-primary-light rounded p-2">
                  <p className="text-xs font-medium text-primary-main mb-1">
                    📌 Siguiente acción:
                  </p>
                  <p className="text-sm text-text-main">{interaction.nextAction}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
