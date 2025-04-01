export interface Budget {
  id?: number;
  name: string;
  amount: number;
  spent: number;
  categoryId?: number;
  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'yearly';
  notes?: string;
}
