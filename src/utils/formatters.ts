export function formatCurrency(amount: number, currency = 'NGN'): string {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString('en-NG')}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatOrdinationCode(regNumber: string): string {
  return regNumber.toUpperCase().trim();
}

export function calculateGrade(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Distinction (A+)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (score >= 80) return { label: 'Very Good (A)', color: 'text-teal-700 bg-teal-50 border-teal-200' };
  if (score >= 70) return { label: 'Credit (B)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  if (score >= 60) return { label: 'Pass (C)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { label: 'Fail / Retake', color: 'text-rose-700 bg-rose-50 border-rose-200' };
}

