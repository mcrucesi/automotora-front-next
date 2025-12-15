"use client";

import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { Phone, Mail, MessageSquare, CheckCircle, Car, DollarSign } from 'lucide-react';

interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  budgetRange: string;
  sourceDetail: string;
  campaign?: string;
}

export default function LeadsPage() {
  const [formData, setFormData] = useState<LeadFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    budgetRange: '',
    sourceDetail: 'landing_page',
    campaign: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Obtener el tenant ID del env o URL
      const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'default-tenant-id';

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/public/lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar el formulario');
      }

      setIsSuccess(true);

      // Limpiar formulario
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
        budgetRange: '',
        sourceDetail: 'landing_page',
        campaign: '',
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el formulario');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text-main mb-2">
            ¡Gracias por tu interés!
          </h2>
          <p className="text-text-subtle mb-6">
            Hemos recibido tu información. Un asesor se pondrá en contacto contigo muy pronto.
          </p>
          <Button
            variant="primary"
            onClick={() => setIsSuccess(false)}
            className="w-full"
          >
            Enviar otra consulta
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Car className="h-8 w-8 text-primary-500" />
            <h1 className="text-2xl font-bold text-text-main">AutoDealer</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-text-main mb-4">
            Encuentra tu Auto Ideal
          </h2>
          <p className="text-xl text-text-subtle">
            Déjanos tus datos y te ayudaremos a encontrar el vehículo perfecto para ti
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-text-main mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={50}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Juan"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-text-main mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={50}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Pérez"
                />
              </div>
            </div>

            {/* Email y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-main mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="juan@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-main mb-2">
                  Teléfono *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    minLength={7}
                    maxLength={20}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="+57 301 234 5678"
                  />
                </div>
              </div>
            </div>

            {/* Presupuesto */}
            <div>
              <label htmlFor="budgetRange" className="block text-sm font-medium text-text-main mb-2">
                Presupuesto aproximado
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  id="budgetRange"
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecciona un rango</option>
                  <option value="menos_10k">Menos de $10,000</option>
                  <option value="10k_20k">$10,000 - $20,000</option>
                  <option value="20k_30k">$20,000 - $30,000</option>
                  <option value="30k_50k">$30,000 - $50,000</option>
                  <option value="mas_50k">Más de $50,000</option>
                </select>
              </div>
            </div>

            {/* Mensaje */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-text-main mb-2">
                Mensaje / Consulta
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400" size={20} />
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Cuéntanos qué tipo de vehículo estás buscando..."
                />
              </div>
              <p className="mt-1 text-xs text-text-subtle">
                {formData.message.length}/500 caracteres
              </p>
            </div>

            {/* Source Detail (hidden) - se puede llenar automáticamente según UTM params */}
            <input type="hidden" name="sourceDetail" value={formData.sourceDetail} />

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Consulta'}
            </Button>

            <p className="text-xs text-center text-text-subtle">
              Al enviar este formulario, aceptas que nos pongamos en contacto contigo para brindarte información sobre nuestros vehículos.
            </p>
          </form>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center p-6">
            <div className="h-12 w-12 rounded-full bg-primary-100 mx-auto mb-4 flex items-center justify-center">
              <Car className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-bold text-text-main mb-2">Amplio Inventario</h3>
            <p className="text-sm text-text-subtle">
              Vehículos nuevos y usados de todas las marcas
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="h-12 w-12 rounded-full bg-accent-100 mx-auto mb-4 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-accent-600" />
            </div>
            <h3 className="font-bold text-text-main mb-2">Financiamiento</h3>
            <p className="text-sm text-text-subtle">
              Te ayudamos con opciones de financiamiento flexibles
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="h-12 w-12 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold text-text-main mb-2">Garantía</h3>
            <p className="text-sm text-text-subtle">
              Todos nuestros vehículos incluyen garantía
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
