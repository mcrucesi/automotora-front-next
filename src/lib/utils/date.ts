/**
 * Format a date string or Date object to a localized string
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  console.log(date);

  const dateObj = typeof date === "string" ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return dateObj.toLocaleDateString("es-CL", defaultOptions);
}

/**
 * Format a date to include time
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get relative time string (e.g., "hace 2 días", "hace 1 hora")
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Ahora";
  if (diffInMinutes === 1) return "Hace 1 minuto";
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
  if (diffInHours === 1) return "Hace 1 hora";
  if (diffInHours < 24) return `Hace ${diffInHours} horas`;
  if (diffInDays === 1) return "Hace 1 día";
  if (diffInDays < 30) return `Hace ${diffInDays} días`;

  return formatDate(dateObj);
}
