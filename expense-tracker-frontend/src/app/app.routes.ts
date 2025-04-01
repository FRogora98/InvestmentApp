import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./components/transactions/transaction-list/transaction-list.component').then(m => m.TransactionListComponent)
      },
      {
        path: 'transactions/add',
        loadComponent: () => import('./components/transactions/transaction-form/transaction-form.component').then(m => m.TransactionFormComponent)
      },
      {
        path: 'transactions/edit/:id',
        loadComponent: () => import('./components/transactions/transaction-form/transaction-form.component').then(m => m.TransactionFormComponent)
      },
      {
        path: 'investments',
        loadComponent: () => import('./components/investments/investment-list/investment-list.component').then(m => m.InvestmentListComponent)
      },
      {
        path: 'investments/add',
        loadComponent: () => import('./components/investments/investment-form/investment-form.component').then(m => m.InvestmentFormComponent)
      },
      {
        path: 'investments/edit/:id',
        loadComponent: () => import('./components/investments/investment-form/investment-form.component').then(m => m.InvestmentFormComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./components/categories/category-list/category-list.component').then(m => m.CategoryListComponent)
      },
      {
        path: 'categories/add',
        loadComponent: () => import('./components/categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
      },
      {
        path: 'categories/edit/:id',
        loadComponent: () => import('./components/categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
      },
      {
        path: 'budgets',
        loadComponent: () => import('./components/budgets/budget-list/budget-list.component').then(m => m.BudgetListComponent)
      },
      {
        path: 'budgets/new',
        loadComponent: () => import('./components/budgets/budget-form/budget-form.component').then(m => m.BudgetFormComponent)
      },
      {
        path: 'budgets/edit/:id',
        loadComponent: () => import('./components/budgets/budget-form/budget-form.component').then(m => m.BudgetFormComponent)
      }
    ]
  }
];
