import toast from 'react-hot-toast';

/**
 * Utilidades para mostrar notificaciones toast en la aplicación
 */
export const showToast = {
  /**
   * Muestra un toast de éxito
   */
  success: (message: string) => {
    return toast.success(message);
  },

  /**
   * Muestra un toast de error
   */
  error: (message: string) => {
    return toast.error(message);
  },

  /**
   * Muestra un toast de carga
   */
  loading: (message: string) => {
    return toast.loading(message);
  },

  /**
   * Muestra un toast para una promesa
   * Automáticamente muestra loading, success o error según el resultado
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },

  /**
   * Cierra un toast específico
   */
  dismiss: (toastId?: string) => {
    return toast.dismiss(toastId);
  },

  /**
   * Cierra todos los toasts
   */
  dismissAll: () => {
    return toast.dismiss();
  },
};
