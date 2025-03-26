import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../models/category.model';
import { Investment } from '../../models/investment.model';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { CategoryService } from '../../services/category.service';
import { InvestmentService } from '../../services/investment.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  investments: Investment[] = [];
  categories: Category[] = [];
  loading = false;
  error = '';

  totalExpenses = 0;
  totalIncome = 0;
  totalInvestmentsAmount = 0;
  currentBalance = 0;
  totalInvestmentValue = 0;
  totalInvestmentReturn = 0;

  expenseCategories: { [key: string]: number } = {};
  expenseCategoriesArray: {category: string, amount: number, percentage: number}[] = [];

  recentTransactions: Transaction[] = [];
  topInvestments: Investment[] = [];

  categoryColorMap: { [key: string]: string } = {
    'Alimentari': '#4CAF50',
    'Trasporti': '#2196F3',
    'Utenze': '#FF9800',
    'Affitto': '#F44336',
    'Svago': '#9C27B0',
    'Salute': '#00BCD4',
    'Altro': '#607D8B'
  };

  constructor(
    private transactionService: TransactionService,
    private investmentService: InvestmentService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;

        this.categories.forEach(category => {
          if (category.color) {
            this.categoryColorMap[category.name] = category.color;
          }
        });
      },
      error: (err) => {
        console.error('Errore nel caricamento delle categorie', err);
      }
    });

    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.calculateTransactionStats();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento delle transazioni';
        console.error(err);
        this.loading = false;
      }
    });

    this.investmentService.getInvestments().subscribe({
      next: (investments) => {
        this.investments = investments;
        this.calculateInvestmentStats();
      },
      error: (err) => {
        this.error = 'Errore nel caricamento degli investimenti';
        console.error(err);
      }
    });
  }

  calculateTransactionStats(): void {
    this.totalExpenses = 0;
    this.totalIncome = 0;
    this.expenseCategories = {};

    this.transactions.forEach(transaction => {
      if (transaction.type === TransactionType.Expense) {
        this.totalExpenses += transaction.amount;

        const categoryName = transaction.categoryObject
                            ? transaction.categoryObject.name
                            : transaction.category || 'Altro';

        this.expenseCategories[categoryName] = (this.expenseCategories[categoryName] || 0) + transaction.amount;
      } else if (transaction.type === TransactionType.Income) {
        this.totalIncome += transaction.amount;
      }
    });

    this.currentBalance = this.totalIncome - this.totalExpenses;

    this.expenseCategoriesArray = Object.keys(this.expenseCategories)
      .map(category => ({
        category: category,
        amount: this.expenseCategories[category],
        percentage: this.totalExpenses > 0 ? (this.expenseCategories[category] / this.totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    this.recentTransactions = [...this.transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  calculateInvestmentStats(): void {
    this.totalInvestmentsAmount = 0;
    this.totalInvestmentValue = 0;
    this.totalInvestmentReturn = 0;

    this.investments.forEach(investment => {
      this.totalInvestmentsAmount += investment.initialAmount;
      this.totalInvestmentValue += investment.currentValue;
    });

    this.totalInvestmentReturn = this.totalInvestmentValue - this.totalInvestmentsAmount;

    this.topInvestments = [...this.investments]
      .map(investment => ({
        ...investment,
        returnPercentage: investment.initialAmount > 0
          ? ((investment.currentValue - investment.initialAmount) / investment.initialAmount) * 100
          : 0
      }))
      .sort((a, b) => b.returnPercentage! - a.returnPercentage!)
      .slice(0, 5);
  }

  formatDate(date: string | Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return new Date(date).toLocaleDateString('it-IT', options);
  }

  getTransactionTypeText(type: TransactionType): string {
    switch (type) {
      case TransactionType.Expense: return 'Spesa';
      case TransactionType.Income: return 'Entrata';
      case TransactionType.Investment: return 'Investimento';
      default: return 'Sconosciuto';
    }
  }

  getTransactionTypeClass(type: TransactionType): string {
    switch (type) {
      case TransactionType.Expense: return 'badge bg-danger';
      case TransactionType.Income: return 'badge bg-success';
      case TransactionType.Investment: return 'badge bg-primary';
      default: return 'badge bg-secondary';
    }
  }

  getCategoryColor(category: string): string {
    return this.categoryColorMap[category] || '#607D8B';
  }

  getProgressWidth(percentage: number): number {
    const absPercentage = Math.abs(percentage);

    if (absPercentage > 30) return 100;

    return Math.max(absPercentage * 3, 5);
  }
}
