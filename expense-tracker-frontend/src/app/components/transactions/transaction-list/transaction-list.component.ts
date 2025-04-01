import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Transaction, TransactionType } from '../../../models/transaction.model';
import { TransactionService } from '../../../services/transaction.service';

// Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormsModule,
    MatButtonModule, 
    MatCardModule, 
    MatIconModule, 
    MatTableModule, 
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  loading = false;
  error = '';
  TransactionType = TransactionType;
  
  // Filtering options
  activeFilter: string = 'all';
  selectedPeriod: string = 'all';
  searchText: string = '';
  
  // Pagination
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalTransactions = 0;
  currentPage = 0;
  
  // Table configuration
  displayedColumns: string[] = ['type', 'date', 'category', 'description', 'amount', 'actions'];

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = '';
    
    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento delle transazioni';
        console.error(err);
        this.loading = false;
      }
    });
  }
  
  applyFilter(): void {
    // Filter by type
    let result = [...this.transactions];
    
    if (this.activeFilter !== 'all') {
      const typeFilter = parseInt(this.activeFilter);
      result = result.filter(t => t.type === typeFilter);
    }
    
    // Filter by period
    if (this.selectedPeriod !== 'all') {
      const today = new Date();
      let fromDate = new Date();
      
      switch (this.selectedPeriod) {
        case 'today':
          fromDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          fromDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          fromDate.setMonth(today.getMonth() - 1);
          break;
        case 'year':
          fromDate.setFullYear(today.getFullYear() - 1);
          break;
      }
      
      result = result.filter(t => new Date(t.date) >= fromDate);
    }
    
    // Apply search filter (todo: implement if needed)
    
    // Update filtered transactions
    this.filteredTransactions = result;
    this.totalTransactions = this.filteredTransactions.length;
  }
  
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
  }

  deleteTransaction(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questa transazione?')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          this.transactions = this.transactions.filter(t => t.id !== id);
          this.applyFilter();
        },
        error: (err) => {
          this.error = 'Errore nell\'eliminazione della transazione';
          console.error(err);
        }
      });
    }
  }

  formatDate(date: string | Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return new Date(date).toLocaleDateString('it-IT', options);
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
}