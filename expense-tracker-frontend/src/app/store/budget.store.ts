import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { EMPTY, Observable, catchError, switchMap, tap } from 'rxjs';
import { Budget } from '../models/budget.model';
import { BudgetService } from '../services/budget.service';

export interface BudgetState {
  budgets: Budget[];
  selectedBudget: Budget | null;
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  selectedBudget: null,
  loading: false,
  error: null,
};

@Injectable()
export class BudgetStore extends ComponentStore<BudgetState> {
  constructor(private budgetService: BudgetService) {
    super(initialState);
  }

  // Selectors
  readonly budgets$ = this.select(state => state.budgets);
  readonly selectedBudget$ = this.select(state => state.selectedBudget);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);

  // Combined selectors
  readonly budgetSummary$ = this.select(
    this.budgets$,
    (budgets) => {
      const total = budgets.reduce((sum, budget) => sum + budget.amount, 0);
      const spent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
      const remaining = total - spent;
      const percentUsed = total > 0 ? (spent / total) * 100 : 0;
      
      return {
        total,
        spent,
        remaining,
        percentUsed,
        count: budgets.length
      };
    }
  );

  // Updaters
  readonly setLoading = this.updater((state, loading: boolean) => ({
    ...state,
    loading,
    error: loading ? null : state.error
  }));

  readonly setError = this.updater((state, error: string | null) => ({
    ...state,
    error,
    loading: false
  }));

  readonly setBudgets = this.updater((state, budgets: Budget[]) => ({
    ...state,
    budgets,
    loading: false,
    error: null
  }));

  readonly setSelectedBudget = this.updater((state, budget: Budget | null) => ({
    ...state,
    selectedBudget: budget
  }));

  readonly addBudget = this.updater((state, budget: Budget) => ({
    ...state,
    budgets: [...state.budgets, budget],
    loading: false
  }));

  readonly updateBudgetInList = this.updater((state, updatedBudget: Budget) => ({
    ...state,
    budgets: state.budgets.map(b => 
      b.id === updatedBudget.id ? updatedBudget : b
    ),
    selectedBudget: state.selectedBudget?.id === updatedBudget.id 
      ? updatedBudget 
      : state.selectedBudget,
    loading: false
  }));

  readonly removeBudget = this.updater((state, id: number) => ({
    ...state,
    budgets: state.budgets.filter(b => b.id !== id),
    selectedBudget: state.selectedBudget?.id === id ? null : state.selectedBudget,
    loading: false
  }));

  // Effects
  readonly loadBudgets = this.effect(trigger$ => {
    return trigger$.pipe(
      tap(() => this.setLoading(true)),
      switchMap(() => this.budgetService.getBudgets().pipe(
        tap({
          next: (budgets) => this.setBudgets(budgets),
          error: (err) => this.setError(err.message || 'Failed to load budgets')
        }),
        catchError(() => EMPTY)
      ))
    );
  });

  readonly loadBudget = this.effect((id$: Observable<number>) => {
    return id$.pipe(
      tap(() => this.setLoading(true)),
      switchMap((id) => this.budgetService.getBudget(id).pipe(
        tap({
          next: (budget) => this.setSelectedBudget(budget),
          error: (err) => this.setError(err.message || `Failed to load budget with ID ${id}`)
        }),
        catchError(() => EMPTY)
      ))
    );
  });

  readonly createBudget = this.effect((budget$: Observable<Budget>) => {
    return budget$.pipe(
      tap(() => this.setLoading(true)),
      switchMap((budget) => this.budgetService.createBudget(budget).pipe(
        tap({
          next: (newBudget) => this.addBudget(newBudget),
          error: (err) => this.setError(err.message || 'Failed to create budget')
        }),
        catchError(() => EMPTY)
      ))
    );
  });

  readonly updateBudget = this.effect((budget$: Observable<Budget>) => {
    return budget$.pipe(
      tap(() => this.setLoading(true)),
      switchMap((budget) => this.budgetService.updateBudget(budget).pipe(
        tap({
          next: (updatedBudget) => this.updateBudgetInList(updatedBudget),
          error: (err) => this.setError(err.message || `Failed to update budget with ID ${budget.id}`)
        }),
        catchError(() => EMPTY)
      ))
    );
  });

  readonly deleteBudget = this.effect((id$: Observable<number>) => {
    return id$.pipe(
      tap(() => this.setLoading(true)),
      switchMap((id) => this.budgetService.deleteBudget(id).pipe(
        tap({
          next: () => this.removeBudget(id),
          error: (err) => this.setError(err.message || `Failed to delete budget with ID ${id}`)
        }),
        catchError(() => EMPTY)
      ))
    );
  });
}