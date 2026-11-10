/**
 * Formats a number to Indonesian Rupiah currency string (e.g. Rp 45.000)
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Rp 0'
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value)
}

/**
 * Formats a date string or Date object to Indonesian formatted string (e.g. 10 Nov 2026, 12.30)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(d)
  } catch {
    return '-'
  }
}

/**
 * Helper to get shadcn/ui status badge styling and Indonesian label
 */
export function getOrderStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return {
        color: 'amber' as const,
        label: 'Menunggu',
        bgClass: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
        dotClass: 'bg-amber-500'
      }
    case 'processing':
      return {
        color: 'blue' as const,
        label: 'Diproses',
        bgClass: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
        dotClass: 'bg-blue-500'
      }
    case 'completed':
      return {
        color: 'emerald' as const,
        label: 'Selesai',
        bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
        dotClass: 'bg-emerald-500'
      }
    case 'cancelled':
      return {
        color: 'rose' as const,
        label: 'Dibatalkan',
        bgClass: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
        dotClass: 'bg-rose-500'
      }
    default:
      return {
        color: 'gray' as const,
        label: status,
        bgClass: 'bg-zinc-100 text-zinc-600 border-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800',
        dotClass: 'bg-zinc-400'
      }
  }
}
