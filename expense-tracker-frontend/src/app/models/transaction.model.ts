import { Category } from "./category.model";

export enum TransactionType {
  Expense = 0,
  Income = 1,
  Investment = 2
}

export interface Transaction {
  id?: number;
  amount: number;
  category?: string;
  date: Date | string;
  type: TransactionType;
  categoryId?: number;
  categoryObject?: Category;
}
