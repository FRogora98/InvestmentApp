import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, take } from 'rxjs';
import { Budget } from '../../../models/budget.model';
import { Category } from '../../../models/category.model';
import { CategoryService } from '../../../services/category.service';
import { BudgetStore } from '../../../store/budget.store';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'app-budget-list',
  templateUrl: './budget-list.component.html',
  styleUrls: ['./budget-list.component.scss'],
  providers: [BudgetStore],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatError
  ]
})
export class BudgetListComponent implements OnInit {
  budgets$: Observable<Budget[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  budgetSummary$: Observable<{
    total: number;
    spent: number;
    remaining: number;
    percentUsed: number;
    count: number;
  }>;
  categories: Category[] = [];
  displayedColumns: string[] = ['name', 'amount', 'spent', 'remaining', 'progress', 'actions'];

  constructor(
    private budgetStore: BudgetStore,
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.budgets$ = this.budgetStore.budgets$;
    this.loading$ = this.budgetStore.loading$;
    this.error$ = this.budgetStore.error$;
    this.budgetSummary$ = this.budgetStore.budgetSummary$;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.budgetStore.loadBudgets();
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().pipe(take(1))
      .subscribe(categories => this.categories = categories);
  }

  getCategoryName(categoryId?: number): string {
    if (!categoryId) return 'None';
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  calculateRemaining(budget: Budget): number {
    return budget.amount - budget.spent;
  }

  calculatePercentage(budget: Budget): number {
    return (budget.spent / budget.amount) * 100;
  }

  getProgressColor(percentage: number): string {
    if (percentage < 70) return 'primary';
    if (percentage < 90) return 'accent';
    return 'warn';
  }

  onEdit(budget: Budget): void {
    this.router.navigate(['/budgets/edit', budget.id]);
  }

  onDelete(id?: number): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this budget?')) {
      this.budgetStore.deleteBudget(id);
    }
  }

  onAdd(): void {
    this.router.navigate(['/budgets/new']);
  }
}
