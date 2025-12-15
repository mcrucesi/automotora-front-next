"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui';
import { interactionFormSchema, interactionTypeLabels, type InteractionFormData } from '@/lib/validations';
import { apiClient } from '@/lib/api/client';
import type { InteractionType } from '@/types/customer';
import type { ApiResponse } from '@/types/auth';

interface InteractionFormProps {
  customerId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const InteractionForm = ({ customerId, onSuccess, onCancel }: InteractionFormProps) => {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<InteractionFormData>({
    resolver: zodResolver(interactionFormSchema),
    defaultValues: {
      type: 'call',
      subject: '',
      notes: '',
      scheduledAt: '',
      outcome: '',
      nextAction: '',
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: InteractionFormData) => {
    try {
      setError(null);

      // Preparar datos - eliminar campos vacíos
      const submitData: any = {
        type: data.type,
        notes: data.notes,
      };

      if (data.subject && data.subject.trim() !== '') {
        submitData.subject = data.subject;
      }

      if (data.scheduledAt && data.scheduledAt.trim() !== '') {
        submitData.scheduledAt = new Date(data.scheduledAt).toISOString();
      }

      if (data.outcome && data.outcome.trim() !== '') {
        submitData.outcome = data.outcome;
      }

      if (data.nextAction && data.nextAction.trim() !== '') {
        submitData.nextAction = data.nextAction;
      }

      await apiClient.post(`/customers/${customerId}/interactions`, submitData);
      onSuccess();
    } catch (err: any) {
      console.error('Error al guardar la interacción:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error al guardar la interacción';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tipo de Interacción */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">
          Tipo de Interacción <span className="text-red-500">*</span>
        </label>
        <select
          {...register('type')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
            errors.type ? 'border-red-500' : 'border-border-subtle'
          }`}
        >
          {Object.entries(interactionTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* Asunto */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">
          Asunto
        </label>
        <input
          type="text"
          {...register('subject')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
            errors.subject ? 'border-red-500' : 'border-border-subtle'
          }`}
          placeholder="Ej: Seguimiento de cotización"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">
          Notas <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('notes')}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
            errors.notes ? 'border-red-500' : 'border-border-subtle'
          }`}
          placeholder="Describe los detalles de la interacción..."
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
        <p className="mt-1 text-xs text-text-subtle">
          Mínimo 10 caracteres, máximo 1000
        </p>
      </div>

      {/* Fecha Programada (opcional) */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">
          Fecha/Hora Programada
        </label>
        <input
          type="datetime-local"
          {...register('scheduledAt')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
            errors.scheduledAt ? 'border-red-500' : 'border-border-subtle'
          }`}
        />
        {errors.scheduledAt && (
          <p className="mt-1 text-sm text-red-600">{errors.scheduledAt.message}</p>
        )}
        <p className="mt-1 text-xs text-text-subtle">
          Opcional: Para programar una interacción futura
        </p>
      </div>

      {/* Resultado */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">
          Resultado
        </label>
        <textarea
          {...register('outcome')}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
            errors.outcome ? 'border-red-500' : 'border-border-subtle'
          }`}
          placeholder="¿Cuál fue el resultado de esta interacción?"
        />
        {errors.outcome && (
          <p className="mt-1 text-sm text-red-600">{errors.outcome.message}</p>
        )}
        <p className="mt-1 text-xs text-text-subtle">
          Opcional: Registra el resultado de la interacción
        </p>
      </div>

      {/* Siguiente Acción */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">
          Siguiente Acción
        </label>
        <textarea
          {...register('nextAction')}
          rows={2}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main ${
            errors.nextAction ? 'border-red-500' : 'border-border-subtle'
          }`}
          placeholder="¿Qué acción de seguimiento se debe realizar?"
        />
        {errors.nextAction && (
          <p className="mt-1 text-sm text-red-600">{errors.nextAction.message}</p>
        )}
        <p className="mt-1 text-xs text-text-subtle">
          Opcional: Define qué hacer a continuación
        </p>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Registrar Interacción'}
        </Button>
      </div>
    </form>
  );
};
