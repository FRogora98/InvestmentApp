import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Transaction, TransactionType } from '../../../models/transaction.model';
import { TransactionService } from '../../../services/transaction.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  loading = false;
  error = '';
  TransactionType = TransactionType;

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento delle transazioni';
        console.error(err);
        this.loading = false;
      }
    });
  }

  deleteTransaction(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questa transazione?')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          this.transactions = this.transactions.filter(t => t.id !== id);
        },
        error: (err) => {
          this.error = 'Errore nell\'eliminazione della transazione';
          console.error(err);
        }
      });
    }
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('it-IT');
  }
}
