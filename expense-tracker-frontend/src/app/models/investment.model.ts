import { Category } from './category.model';

export interface Investment {
  id?: number;
  name: string;
  initialAmount: number;
  purchaseDate: Date | string;
  currentValue: number;
  return?: number;
  returnPercentage?: number;
  categoryId?: number;
  categoryObject?: Category;
}
