import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://localhost:5094/api/Transactions';

  constructor(private http: HttpClient) { }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  createTransaction(transaction: Transaction): Observable<Transaction> {
    const { categoryObject, ...transactionToSend } = transaction as any;
    return this.http.post<Transaction>(this.apiUrl, transactionToSend);
  }

  updateTransaction(id: number, transaction: Transaction): Observable<void> {
    const { categoryObject, ...transactionToSend } = transaction as any;
    return this.http.put<void>(`${this.apiUrl}/${id}`, transactionToSend);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
