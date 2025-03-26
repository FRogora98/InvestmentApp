export enum CategoryType {
  Essential = 0,
  Extra = 1,
  Income = 2,
  Investment = 3
}

export interface Category {
  id?: number;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
}
