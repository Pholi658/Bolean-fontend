export function formatMaloti(amount: number): string {
  return `M ${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/** Compact axis-label form, e.g. "M2.5k" / "M400" — for tight chart ticks. */
export function compactMaloti(amount: number): string {
  if (Math.abs(amount) >= 1000) {
    return `M${(amount / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })}k`;
  }
  return `M${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDaysRemaining(days: number): string {
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "Due today";
  return `Due in ${days} day${days === 1 ? "" : "s"}`;
}

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  cash_loan: "Cash Loan",
  goods_on_credit: "Goods on Credit",
  service_on_credit: "Service on Credit",
  deposit_to: "Deposit To",
};

export function formatTransactionType(type: string): string {
  return TRANSACTION_TYPE_LABELS[type] ?? type;
}

/** "Today, 10:45 AM" / "Yesterday" / "3 days ago" — for recent-searches timestamps. */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000);

  if (diffDays <= 0) {
    return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  }
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
