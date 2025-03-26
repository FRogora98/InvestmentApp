import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Investment } from '../models/investment.model';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private apiUrl = 'http://localhost:5094/api/Investments';

  constructor(private http: HttpClient) { }

  getInvestments(): Observable<Investment[]> {
    return this.http.get<Investment[]>(this.apiUrl);
  }

  getInvestment(id: number): Observable<Investment> {
    return this.http.get<Investment>(`${this.apiUrl}/${id}`);
  }

  createInvestment(investment: Investment): Observable<Investment> {
    return this.http.post<Investment>(this.apiUrl, investment);
  }

  updateInvestment(id: number, investment: Investment): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, investment);
  }

  deleteInvestment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
