// dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, catchError, combineLatest, finalize, takeUntil } from 'rxjs';
import { Category } from '../../models/category.model';
import { Investment } from '../../models/investment.model';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { CategoryService } from '../../services/category.service';
import { InvestmentService } from '../../services/investment.service';
import { TransactionService } from '../../services/transaction.service';

// Material Imports
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

// ApexCharts
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexOptions,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTheme,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
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
  stroke: ApexStroke;
  grid: ApexGrid;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  fill: ApexFill;
  title: ApexTitleSubtitle;
  theme: ApexTheme;
  colors: string[];
  labels?: string[];
  responsive?: ApexResponsive[];
};

interface PeriodOption {
  value: string;
  label: string;
  days: number;
}

interface SummaryTile {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  color: string;
  change: number;
  tooltip: string;
}

interface TopCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon?: string;
}

interface MonthlyData {
  month: string;
  expenses: number;
  income: number;
  balance: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatDividerModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatNativeDateModule,
    NgApexchartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild("expenseChart") expenseChart!: ChartComponent;
  @ViewChild("incomeChart") incomeChart!: ChartComponent;
  @ViewChild("balanceChart") balanceChart!: ChartComponent;
  @ViewChild("investmentChart") investmentChart!: ChartComponent;

  // UI State
  loading = true;
  error = '';
  private destroy$ = new Subject<void>();

  // Data collections
  transactions: Transaction[] = [];
  investments: Investment[] = [];
  categories: Category[] = [];

  // Period filter
  selectedPeriod = 'month';
  periodOptions: PeriodOption[] = [
    { value: 'week', label: '7 giorni', days: 7 },
    { value: 'month', label: 'Questo mese', days: 30 },
    { value: 'quarter', label: 'Trimestre', days: 90 },
    { value: 'year', label: 'Anno', days: 365 },
    { value: 'all', label: 'Tutti', days: 0 }
  ];

  // Dashboard stats
  summaryTiles: SummaryTile[] = [];
  topExpenseCategories: TopCategory[] = [];
  topIncomeCategories: TopCategory[] = [];
  recentTransactions: Transaction[] = [];
  topInvestments: Investment[] = [];
  monthlyData: MonthlyData[] = [];

  // Computed metrics
  totalExpenses = 0;
  totalIncome = 0;
  currentBalance = 0;
  totalInvestmentsValue = 0;
  totalInvestmentsGain = 0;
  avgDailyExpense = 0;
  avgMonthlyExpense = 0;
  largestExpense = 0;
  largestExpenseCategory = '';
  largestIncome = 0;
  largestIncomeCategory = '';

  // Charts - initialized with default values to avoid undefined errors
  expenseChartOptions: ApexOptions = {
    series: [] as ApexNonAxisChartSeries,
    chart: { type: "donut", height: 320 } as ApexChart,
    labels: [] as string[],
    colors: [] as string[],
    dataLabels: { enabled: false } as ApexDataLabels,
    plotOptions: {} as ApexPlotOptions,
    legend: {} as ApexLegend,
    tooltip: {} as ApexTooltip,
    stroke: {} as ApexStroke
  };

  incomeChartOptions: ApexOptions = {
    series: [] as ApexNonAxisChartSeries,
    chart: { type: "donut", height: 320 } as ApexChart,
    labels: [] as string[],
    colors: [] as string[],
    dataLabels: { enabled: false } as ApexDataLabels,
    plotOptions: {} as ApexPlotOptions,
    legend: {} as ApexLegend,
    tooltip: {} as ApexTooltip,
    stroke: {} as ApexStroke
  };

  balanceChartOptions: ApexOptions = {
    series: [{
      name: 'Entrate',
      type: 'column',
      data: [] as number[]
    }, {
      name: 'Spese',
      type: 'column',
      data: [] as number[]
    }, {
      name: 'Saldo',
      type: 'line',
      data: [] as number[]
    }] as ApexAxisChartSeries,
    chart: { type: "line", height: 350 } as ApexChart,
    xaxis: { categories: [] } as ApexXAxis,
    yaxis: {} as ApexYAxis,
    dataLabels: { enabled: false } as ApexDataLabels,
    plotOptions: {} as ApexPlotOptions,
    legend: {} as ApexLegend,
    tooltip: {} as ApexTooltip,
    stroke: {} as ApexStroke,
    fill: {} as ApexFill,
    colors: [] as string[],
    grid: {} as ApexGrid
  };

  investmentChartOptions: ApexOptions = {
    series: [{
      name: 'Rendimento %',
      data: [] as number[]
    }] as ApexAxisChartSeries,
    chart: { type: "bar", height: 280 } as ApexChart,
    xaxis: { categories: [] } as ApexXAxis,
    yaxis: {} as ApexYAxis,
    colors: [] as string[],
    dataLabels: { enabled: true } as ApexDataLabels,
    plotOptions: {} as ApexPlotOptions,
    legend: { show: false } as ApexLegend,
    tooltip: {} as ApexTooltip
  };

  isChartsReady = false;

  // Category colors
  categoryColorMap: { [key: string]: string } = {};

  // Dashboard customization
  dashboardSections = [
    { id: 'summary', title: 'Riepilogo', visible: true, order: 1 },
    { id: 'expenses', title: 'Spese', visible: true, order: 2 },
    { id: 'income', title: 'Entrate', visible: true, order: 3 },
    { id: 'investments', title: 'Investimenti', visible: true, order: 4 },
    { id: 'recent', title: 'Transazioni Recenti', visible: true, order: 5 },
    { id: 'trends', title: 'Trend Mensile', visible: true, order: 6 }
  ];

  constructor(
    private transactionService: TransactionService,
    private investmentService: InvestmentService,
    private categoryService: CategoryService
  ) {
    this.initializeChartOptions();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeChartOptions(): void {
    // Expense Chart Options
    this.expenseChartOptions = {
      series: [] as ApexNonAxisChartSeries,
      chart: {
        type: "donut" as const,
        height: 320,
        fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          }
        },
        dropShadow: {
          enabled: true,
          top: 5,
          left: 5,
          blur: 8,
          opacity: 0.2
        }
      },
      legend: {
        position: "bottom" as const,
        horizontalAlign: "center" as const,
        fontSize: '13px',
        fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
        offsetY: 8,
        itemMargin: {
          horizontal: 10,
          vertical: 5
        }
      },
      dataLabels: {
        enabled: false
      },
      colors: [] as string[],
      labels: [] as string[],
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
                offsetY: -10
              },
              value: {
                show: true,
                fontSize: '16px',
                fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
                formatter: function(val: any): string {
                  return '€' + Number(val).toFixed(2);
                }
              },
              total: {
                show: true,
                label: 'Totale',
                fontSize: '14px',
                fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
                formatter: function(w: any): string {
                  return '€' + w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toFixed(2);
                }
              }
            }
          }
        }
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: function(val: any): string {
            return '€' + Number(val).toFixed(2);
          }
        }
      },
      stroke: {
        width: 2
      },
      fill: {
        opacity: 1
      }
    };

    // Income Chart Options - similar to expense but with different colors
    this.incomeChartOptions = {
      ...this.expenseChartOptions,
      colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107'] as string[]
    };

    // Balance Chart Options
    this.balanceChartOptions = {
      series: [{
        name: 'Entrate',
        type: 'column',
        data: [] as number[]
      }, {
        name: 'Spese',
        type: 'column',
        data: [] as number[]
      }, {
        name: 'Saldo',
        type: 'line',
        data: [] as number[]
      }] as ApexAxisChartSeries,
      chart: {
        height: 350,
        type: 'line' as const,
        fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      colors: ['#4CAF50', '#F44336', '#3F51B5'],
      stroke: {
        width: [0, 0, 3],
        curve: 'smooth' as const
      },
      dataLabels: {
        enabled: false
      },
      plotOptions: {
        bar: {
          columnWidth: '60%',
          borderRadius: 4
        }
      },
      fill: {
        opacity: [0.85, 0.85, 1],
        gradient: {
          inverseColors: false,
          shade: 'light' as const,
          type: "vertical" as const,
          opacityFrom: 0.85,
          opacityTo: 0.55,
        }
      },
      xaxis: {
        categories: [] as string[],
        labels: {
          style: {
            fontSize: '12px',
            fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
          }
        }
      },
      yaxis: {
        title: {
          text: 'Importo (€)',
          style: {
            fontSize: '12px',
            fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
          }
        },
        labels: {
          formatter: function(val: any): string {
            return '€' + Number(val).toFixed(0);
          },
          style: {
            fontSize: '12px',
            fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
          }
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function(val: any): string {
            return '€' + Number(val).toFixed(2);
          }
        }
      },
      legend: {
        position: 'top' as const,
        horizontalAlign: 'center' as const,
        fontSize: '13px',
        fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
        offsetY: 0
      },
      grid: {
        borderColor: '#e0e0e0',
        strokeDashArray: 5,
        position: 'back' as const
      }
    };

    // Investment Chart Options
    this.investmentChartOptions = {
      series: [{
        name: 'Rendimento %',
        data: [] as number[]
      }] as ApexAxisChartSeries,
      chart: {
        type: 'bar' as const,
        height: 280,
        fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          dataLabels: {
            position: 'top' as const
          }
        }
      },
      colors: ['#9C27B0'],
      dataLabels: {
        enabled: true,
        formatter: function(val: any): string {
          return Number(val).toFixed(1) + '%';
        },
        offsetX: 30,
        style: {
          fontSize: '12px',
          colors: ['#fff']
        }
      },
      xaxis: {
        categories: [] as string[],
        labels: {
          formatter: function(val: any): string {
            return Number(val).toFixed(1) + '%';
          },
          style: {
            fontSize: '12px',
            fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '12px',
            fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
          }
        }
      },
      tooltip: {
        y: {
          formatter: function(val: any): string {
            return Number(val).toFixed(2) + '%';
          }
        }
      },
      legend: {
        show: false
      },
      grid: {
        borderColor: '#e0e0e0',
        strokeDashArray: 5,
        position: 'back' as const
      }
    };
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    // Use combineLatest for parallel API calls
    combineLatest([
      this.categoryService.getCategories(),
      this.transactionService.getTransactions(),
      this.investmentService.getInvestments()
    ]).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.error = 'Si è verificato un errore durante il caricamento dei dati. Riprova più tardi.';
        console.error('Error loading dashboard data:', err);
        throw err; // Re-throw to reach the finalize operator
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: ([categories, transactions, investments]) => {
        this.categories = categories;
        this.transactions = this.filterTransactionsByPeriod(transactions);
        this.investments = investments;

        // Update dashboard data
        this.updateCategoryColors();
        this.calculateDashboardMetrics();
        this.prepareChartData();
        this.prepareSummaryTiles();
        this.prepareTopCategories();
        this.prepareRecentTransactions();
        this.prepareTopInvestments();
        this.prepareMonthlyData();

        this.isChartsReady = true;
      },
      error: (err) => {
        // Error is already handled in the catchError operator
        console.error('Subscription error handler:', err);
      }
    });
  }

  filterTransactionsByPeriod(transactions: Transaction[]): Transaction[] {
    const selectedPeriodOption = this.periodOptions.find(p => p.value === this.selectedPeriod);
    if (!selectedPeriodOption || selectedPeriodOption.value === 'all') {
      return transactions;
    }

    const today = new Date();
    const startDate = new Date();

    if (selectedPeriodOption.value === 'month') {
      startDate.setDate(1); // Start of current month
    } else {
      startDate.setDate(today.getDate() - selectedPeriodOption.days);
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

  calculateDashboardMetrics(): void {
    // Reset values
    this.totalExpenses = 0;
    this.totalIncome = 0;
    this.largestExpense = 0;
    this.largestIncome = 0;
    this.largestExpenseCategory = '';
    this.largestIncomeCategory = '';

    // Group transactions by category
    const expensesByCategory: {[key: string]: number} = {};
    const incomesByCategory: {[key: string]: number} = {};

    // Calculate metrics
    this.transactions.forEach(transaction => {
      if (transaction.type === TransactionType.Expense) {
        this.totalExpenses += transaction.amount;

        const categoryName = transaction.categoryObject
          ? transaction.categoryObject.name
          : transaction.category || 'Altro';

        expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + transaction.amount;

        if (transaction.amount > this.largestExpense) {
          this.largestExpense = transaction.amount;
          this.largestExpenseCategory = categoryName;
        }
      }
      else if (transaction.type === TransactionType.Income) {
        this.totalIncome += transaction.amount;

        const categoryName = transaction.categoryObject
          ? transaction.categoryObject.name
          : transaction.category || 'Altro';

        incomesByCategory[categoryName] = (incomesByCategory[categoryName] || 0) + transaction.amount;

        if (transaction.amount > this.largestIncome) {
          this.largestIncome = transaction.amount;
          this.largestIncomeCategory = categoryName;
        }
      }
    });

    // Calculate balance
    this.currentBalance = this.totalIncome - this.totalExpenses;

    // Calculate daily and monthly averages
    const selectedPeriodOption = this.periodOptions.find(p => p.value === this.selectedPeriod);
    if (selectedPeriodOption && selectedPeriodOption.days > 0) {
      this.avgDailyExpense = this.totalExpenses / selectedPeriodOption.days;
      this.avgMonthlyExpense = this.avgDailyExpense * 30;
    } else {
      // Default to 30 days if no period is selected
      this.avgDailyExpense = this.totalExpenses / 30;
      this.avgMonthlyExpense = this.totalExpenses;
    }

    // Calculate investment metrics
    this.calculateInvestmentMetrics();
  }

  calculateInvestmentMetrics(): void {
    let totalInitial = 0;
    let totalCurrent = 0;

    this.investments.forEach(investment => {
      totalInitial += investment.initialAmount;
      totalCurrent += investment.currentValue;
    });

    this.totalInvestmentsValue = totalCurrent;
    this.totalInvestmentsGain = totalCurrent - totalInitial;
  }

  prepareChartData(): void {
    this.prepareExpenseChartData();
    this.prepareIncomeChartData();
    this.prepareBalanceChartData();
    this.prepareInvestmentChartData();
  }

  prepareExpenseChartData(): void {
    // Group expenses by category
    const expenseCategories: {[key: string]: number} = {};

    this.transactions
      .filter(t => t.type === TransactionType.Expense)
      .forEach(t => {
        const categoryName = t.categoryObject
          ? t.categoryObject.name
          : t.category || 'Altro';

        expenseCategories[categoryName] = (expenseCategories[categoryName] || 0) + t.amount;
      });

    // Convert to series data
    const series: number[] = [];
    const labels: string[] = [];
    const colors: string[] = [];

    Object.entries(expenseCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6) // Top 6 categories
      .forEach(([category, amount]) => {
        labels.push(category);
        series.push(parseFloat(amount.toFixed(2)));
        colors.push(this.getCategoryColor(category));
      });

    // Update chart options
    this.expenseChartOptions.series = series;
    this.expenseChartOptions.labels = labels;
    this.expenseChartOptions.colors = colors;
  }

  prepareIncomeChartData(): void {
    // Group income by category
    const incomeCategories: {[key: string]: number} = {};

    this.transactions
      .filter(t => t.type === TransactionType.Income)
      .forEach(t => {
        const categoryName = t.categoryObject
          ? t.categoryObject.name
          : t.category || 'Altro';

        incomeCategories[categoryName] = (incomeCategories[categoryName] || 0) + t.amount;
      });

    // Convert to series data
    const series: number[] = [];
    const labels: string[] = [];
    const colors: string[] = [
      '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800'
    ];

    Object.entries(incomeCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6) // Top 6 categories
      .forEach(([category, amount], index) => {
        labels.push(category);
        series.push(parseFloat(amount.toFixed(2)));
      });

    // Update chart options
    this.incomeChartOptions.series = series;
    this.incomeChartOptions.labels = labels;
    this.incomeChartOptions.colors = colors.slice(0, series.length);
  }

  prepareBalanceChartData(): void {
    // Prepare monthly data
    const monthlyData = this.prepareMonthlyData();

    // Extract data for chart
    const months: string[] = [];
    const income: number[] = [];
    const expenses: number[] = [];
    const balance: number[] = [];

    monthlyData.forEach(data => {
      months.push(data.month);
      income.push(parseFloat(data.income.toFixed(2)));
      expenses.push(parseFloat(data.expenses.toFixed(2)));
      balance.push(parseFloat(data.balance.toFixed(2)));
    });

    // Update chart options
    if (this.balanceChartOptions.xaxis) {
      this.balanceChartOptions.xaxis.categories = months;
    }

    const series = [
      {
        name: 'Entrate',
        type: 'column',
        data: income
      },
      {
        name: 'Spese',
        type: 'column',
        data: expenses
      },
      {
        name: 'Saldo',
        type: 'line',
        data: balance
      }
    ];

    this.balanceChartOptions.series = series;
  }

  prepareInvestmentChartData(): void {
    if (this.investments.length === 0) {
      return;
    }

    // Calculate return percentage
    const investmentsWithReturn = this.investments.map(inv => {
      const returnPct = inv.initialAmount > 0
        ? ((inv.currentValue - inv.initialAmount) / inv.initialAmount) * 100
        : 0;
      return {
        ...inv,
        returnPct: parseFloat(returnPct.toFixed(2))
      };
    });

    // Sort by return percentage (descending)
    investmentsWithReturn.sort((a, b) => b.returnPct - a.returnPct);

    // Take top 5
    const topInvestments = investmentsWithReturn.slice(0, 5);

    // Extract data for chart
    const names: string[] = [];
    const returns: number[] = [];

    topInvestments.forEach(inv => {
      names.push(inv.name);
      returns.push(inv.returnPct);
    });

    // Update chart options
    if (this.investmentChartOptions.xaxis) {
      this.investmentChartOptions.xaxis.categories = names;
    }

    this.investmentChartOptions.series = [{
      name: 'Rendimento %',
      data: returns
    }];

    // Use different colors based on positive/negative return
    this.investmentChartOptions.colors = topInvestments.map(inv =>
      inv.returnPct >= 0 ? '#9C27B0' : '#F44336'
    );
  }

  prepareSummaryTiles(): void {
    // Calculate metrics for summary tiles

    // Month-over-month change (this would normally come from comparing data)
    // For now we'll use placeholder values
    const expenseChange = -3.2;  // 3.2% decrease from previous month
    const incomeChange = 5.7;    // 5.7% increase from previous month
    const balanceChange = 14.3;  // 14.3% increase in balance
    const investmentChange = 2.8; // 2.8% increase in investments

    // Create summary tiles
    this.summaryTiles = [
      {
        title: 'Spese Totali',
        value: this.totalExpenses,
        subtitle: 'Questo periodo',
        icon: 'shopping_cart',
        color: '#F44336',
        change: expenseChange,
        tooltip: expenseChange < 0
          ? `Riduzione del ${Math.abs(expenseChange).toFixed(1)}% rispetto al periodo precedente`
          : `Aumento del ${expenseChange.toFixed(1)}% rispetto al periodo precedente`
      },
      {
        title: 'Entrate Totali',
        value: this.totalIncome,
        subtitle: 'Questo periodo',
        icon: 'account_balance_wallet',
        color: '#4CAF50',
        change: incomeChange,
        tooltip: incomeChange > 0
          ? `Aumento del ${incomeChange.toFixed(1)}% rispetto al periodo precedente`
          : `Riduzione del ${Math.abs(incomeChange).toFixed(1)}% rispetto al periodo precedente`
      },
      {
        title: 'Saldo Attuale',
        value: this.currentBalance,
        subtitle: 'Entrate - Spese',
        icon: 'account_balance',
        color: this.currentBalance >= 0 ? '#3F51B5' : '#FF9800',
        change: balanceChange,
        tooltip: balanceChange > 0
          ? `Miglioramento del ${balanceChange.toFixed(1)}% rispetto al periodo precedente`
          : `Peggioramento del ${Math.abs(balanceChange).toFixed(1)}% rispetto al periodo precedente`
      },
      {
        title: 'Valore Investimenti',
        value: this.totalInvestmentsValue,
        subtitle: `${this.totalInvestmentsGain >= 0 ? '+' : ''}${this.totalInvestmentsGain.toFixed(2)}€ (${this.investments.length} investimenti)`,
        icon: 'trending_up',
        color: '#9C27B0',
        change: investmentChange,
        tooltip: investmentChange > 0
          ? `Crescita del ${investmentChange.toFixed(1)}% rispetto al periodo precedente`
          : `Perdita del ${Math.abs(investmentChange).toFixed(1)}% rispetto al periodo precedente`
      }
    ];
  }

  prepareTopCategories(): void {
    // Top expense categories
    const expenseCategories: {[key: string]: number} = {};

    this.transactions
      .filter(t => t.type === TransactionType.Expense)
      .forEach(t => {
        const categoryName = t.categoryObject
          ? t.categoryObject.name
          : t.category || 'Altro';

        expenseCategories[categoryName] = (expenseCategories[categoryName] || 0) + t.amount;
      });

    this.topExpenseCategories = Object.entries(expenseCategories)
      .map(([name, amount]) => {
        const category = this.categories.find(c => c.name === name);
        return {
          name,
          amount,
          percentage: this.totalExpenses > 0 ? (amount / this.totalExpenses) * 100 : 0,
          color: this.getCategoryColor(name),
          icon: category?.icon
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Top income categories
    const incomeCategories: {[key: string]: number} = {};

    this.transactions
      .filter(t => t.type === TransactionType.Income)
      .forEach(t => {
        const categoryName = t.categoryObject
          ? t.categoryObject.name
          : t.category || 'Altro';

        incomeCategories[categoryName] = (incomeCategories[categoryName] || 0) + t.amount;
      });

      this.topIncomeCategories = Object.entries(incomeCategories)
      .map(([name, amount]) => {
        const category = this.categories.find(c => c.name === name);
        return {
          name,
          amount,
          percentage: this.totalIncome > 0 ? (amount / this.totalIncome) * 100 : 0,
          color: category?.color || '#4CAF50',
          icon: category?.icon
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  prepareRecentTransactions(): void {
    // Get recent transactions, sorted by date
    this.recentTransactions = [...this.transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }

  prepareTopInvestments(): void {
    if (this.investments.length === 0) {
      this.topInvestments = [];
      return;
    }

    // Calculate return percentage and sort
    this.topInvestments = this.investments
      .map(inv => {
        const returnPct = inv.initialAmount > 0
          ? ((inv.currentValue - inv.initialAmount) / inv.initialAmount) * 100
          : 0;
        return {
          ...inv,
          return: inv.currentValue - inv.initialAmount,
          returnPercentage: returnPct
        };
      })
      .sort((a, b) => (b.returnPercentage || 0) - (a.returnPercentage || 0))
      .slice(0, 5);
  }

  prepareMonthlyData(): MonthlyData[] {
    // Group transactions by month
    const monthlyData: {[key: string]: MonthlyData} = {};

    this.transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: this.formatMonthYear(date),
          expenses: 0,
          income: 0,
          balance: 0
        };
      }

      if (transaction.type === TransactionType.Expense) {
        monthlyData[monthYear].expenses += transaction.amount;
      }
      else if (transaction.type === TransactionType.Income) {
        monthlyData[monthYear].income += transaction.amount;
      }

      monthlyData[monthYear].balance =
        monthlyData[monthYear].income - monthlyData[monthYear].expenses;
    });

    // Convert to array and sort by date
    this.monthlyData = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month));

    return this.monthlyData;
  }

  formatMonthYear(date: Date): string {
    const months = [
      'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
      'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
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
    return this.categoryColorMap[category] || '#607D8B'; // Default color
  }

  getTransactionTypeIcon(type: TransactionType): string {
    switch (type) {
      case TransactionType.Expense:
        return 'shopping_cart';
      case TransactionType.Income:
        return 'account_balance_wallet';
      case TransactionType.Investment:
        return 'trending_up';
      default:
        return 'receipt';
    }
  }

  getTransactionTypeClass(type: TransactionType): string {
    switch (type) {
      case TransactionType.Expense:
        return 'expense-bg';
      case TransactionType.Income:
        return 'income-bg';
      case TransactionType.Investment:
        return 'investment-bg';
      default:
        return 'default-bg';
    }
  }

  getTransactionTypeText(type: TransactionType): string {
    switch (type) {
      case TransactionType.Expense:
        return 'Spesa';
      case TransactionType.Income:
        return 'Entrata';
      case TransactionType.Investment:
        return 'Investimento';
      default:
        return 'Sconosciuto';
    }
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadDashboardData();
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  toggleSectionVisibility(sectionId: string): void {
    const section = this.dashboardSections.find(s => s.id === sectionId);
    if (section) {
      section.visible = !section.visible;
    }
  }

  exportDashboardData(): void {
    // This would typically trigger an export to CSV/PDF
    console.log('Exporting dashboard data...');
    // Implementation would go here
  }

  // Helper function to determine if a number is positive
  isPositive(value: number): boolean {
    return value >= 0;
  }
}
