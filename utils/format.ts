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
 * Helper to get status badge color and Indonesian label
 */
export function getOrderStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return { color: 'amber' as const, label: 'Menunggu' }
    case 'processing':
      return { color: 'blue' as const, label: 'Diproses' }
    case 'completed':
      return { color: 'emerald' as const, label: 'Selesai' }
    case 'cancelled':
      return { color: 'rose' as const, label: 'Dibatalkan' }
    default:
      return { color: 'gray' as const, label: status }
  }
}

