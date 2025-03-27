import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Category } from '../../models/category.model';
import { Investment } from '../../models/investment.model';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { CategoryService } from '../../services/category.service';
import { InvestmentService } from '../../services/investment.service';
import { TransactionService } from '../../services/transaction.service';

// Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

// ApexCharts
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexTooltip,
  ChartComponent,
  NgApexchartsModule
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  colors: string[];
  labels?: string[];
  responsive?: ApexResponsive[];
  xaxis?: {
    categories?: string[];
  };
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatDividerModule,
    NgApexchartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild("expenseChart") expenseChart!: ChartComponent;
  @ViewChild("investmentChart") investmentChart!: ChartComponent;

  // Data
  transactions: Transaction[] = [];
  investments: Investment[] = [];
  categories: Category[] = [];
  loading = false;
  error = '';

  // Period selector
  selectedPeriod = 'month';

  // Statistics
  totalExpenses = 0;
  totalIncome = 0;
  totalInvestmentsAmount = 0;
  currentBalance = 0;
  totalInvestmentValue = 0;
  totalInvestmentReturn = 0;
  balanceRatio = 0;
  monthOverMonthExpenseChange = -3.2; // Example data
  monthOverMonthIncomeChange = 5.7;   // Example data

  // Derived data
  expenseCategories: { [key: string]: number } = {};
  expenseCategoriesArray: {category: string, amount: number, percentage: number}[] = [];
  recentTransactions: Transaction[] = [];
  topInvestments: Investment[] = [];

  // Chart options
  expenseChartOptions!: Partial<ChartOptions>;
  investmentChartOptions!: Partial<ChartOptions>;

  // Category colors
  categoryColorMap: { [key: string]: string } = {};

  constructor(
    private transactionService: TransactionService,
    private investmentService: InvestmentService,
    private categoryService: CategoryService
  ) {
    this.initChartOptions();
  }

  ngOnInit(): void {
    this.loadData();
  }

  initChartOptions(): void {
    // Initialize expense chart options
    this.expenseChartOptions = {
      series: [],
      chart: {
        height: 300,
        type: "donut",
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center"
      },
      colors: [],
      tooltip: {
        y: {
          formatter: function(val) {
            return "€ " + val.toFixed(2);
          }
        }
      }
    };

    // Initialize investment chart options
    this.investmentChartOptions = {
      series: [],
      chart: {
        height: 300,
        type: "bar",
      },
      dataLabels: {
        enabled: false
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4
        }
      },
      colors: ["#3f51b5"],
      legend: {
        show: false
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return val.toFixed(2) + "%";
          }
        }
      }
    };
  }

  loadData(): void {
    this.loading = true;

    // Use forkJoin to make parallel API calls
    forkJoin({
      categories: this.categoryService.getCategories(),
      transactions: this.transactionService.getTransactions(),
      investments: this.investmentService.getInvestments()
    }).subscribe({
      next: results => {
        this.categories = results.categories;
        this.transactions = this.filterTransactionsByPeriod(results.transactions);
        this.investments = results.investments;

        // Update category colors
        this.updateCategoryColors();

        // Calculate statistics
        this.calculateTransactionStats();
        this.calculateInvestmentStats();

        // Update charts
        this.updateCharts();

        this.loading = false;
      },
      error: err => {
        this.error = 'Errore nel caricamento dei dati';
        console.error(err);
        this.loading = false;
      }
    });
  }

  filterTransactionsByPeriod(transactions: Transaction[]): Transaction[] {
    const today = new Date();
    let startDate = new Date();

    switch (this.selectedPeriod) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'quarter':
        const currentMonth = today.getMonth();
        startDate = new Date(today.getFullYear(), currentMonth - (currentMonth % 3), 1);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
    }

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= today;
    });
  }

  updateCategoryColors(): void {
    this.categories.forEach(category => {
      if (category.color) {
        this.categoryColorMap[category.name] = category.color;
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

    // Calculate balance ratio for progress bar
    const total = this.totalIncome + this.totalExpenses;
    this.balanceRatio = total > 0 ? (this.totalIncome / total) * 100 : 50;

    // Prepare expense categories array for chart and table
    this.expenseCategoriesArray = Object.keys(this.expenseCategories)
      .map(category => ({
        category: category,
        amount: this.expenseCategories[category],
        percentage: this.totalExpenses > 0 ? (this.expenseCategories[category] / this.totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Get recent transactions
    this.recentTransactions = [...this.transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  calculateInvestmentStats(): void {
    this.totalInvestmentsAmount = 0;
    this.totalInvestmentValue = 0;

    this.investments.forEach(investment => {
      this.totalInvestmentsAmount += investment.initialAmount;
      this.totalInvestmentValue += investment.currentValue;
    });

    this.totalInvestmentReturn = this.totalInvestmentValue - this.totalInvestmentsAmount;

    // Get top investments by return percentage
    this.topInvestments = [...this.investments]
      .map(investment => {
        const returnPercentage = investment.initialAmount > 0
          ? ((investment.currentValue - investment.initialAmount) / investment.initialAmount) * 100
          : 0;

        return {
          ...investment,
          returnPercentage
        };
      })
      .sort((a, b) => (b.returnPercentage || 0) - (a.returnPercentage || 0))
      .slice(0, 5);
  }

  updateCharts(): void {
    // Update expense chart
    if (this.expenseCategoriesArray.length > 0) {
      const series = this.expenseCategoriesArray.map(item => item.amount);
      const labels = this.expenseCategoriesArray.map(item => item.category);
      const colors = this.expenseCategoriesArray.map(item => this.getCategoryColor(item.category));

      this.expenseChartOptions.series = series;
      this.expenseChartOptions.labels = labels;
      this.expenseChartOptions.colors = colors;
    }

    if (this.topInvestments.length > 0) {
      this.investmentChartOptions.series = [{
        name: "Rendimento %",
        data: this.topInvestments.map(inv => inv.returnPercentage || 0)
      }];

      // Corretto per impostare le categorie nell'asse X
      if (this.investmentChartOptions.chart) {
        this.investmentChartOptions.chart = {
          ...this.investmentChartOptions.chart,
          type: "bar"
        };
      }

      this.investmentChartOptions.xaxis = {
        categories: this.topInvestments.map(inv => inv.name)
      };
    }
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadData();
  }

  formatDate(date: string | Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return new Date(date).toLocaleDateString('it-IT', options);
  }

  getCategoryColor(category: string): string {
    return this.categoryColorMap[category] || '#607D8B';
  }

  getProgressWidth(percentage: number): number {
    return Math.min(Math.max(percentage, 0), 100);
  }
}
