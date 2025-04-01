import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Investment } from "../../../models/investment.model";
import { InvestmentService } from "../../../services/investment.service";

// Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-investment-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    MatButtonModule, 
    MatCardModule, 
    MatIconModule, 
    MatTableModule, 
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './investment-list.component.html',
  styleUrl: './investment-list.component.scss'
})

export class InvestmentListComponent implements OnInit {
  investments: Investment[] = [];
  loading = false;
  error = '';
  
  // Total calculations
  totalInvested = 0;
  totalCurrentValue = 0;
  totalReturn = 0;
  totalReturnPercentage = 0;
  
  // Table configuration
  displayedColumns: string[] = ['name', 'initialAmount', 'purchaseDate', 'currentValue', 'return', 'returnPercentage', 'actions'];

  constructor(private investmentService: InvestmentService) {}

  ngOnInit(): void {
    this.loadInvestments();
  }

  loadInvestments(): void {
    this.loading = true;
    this.error = '';
    
    this.investmentService.getInvestments().subscribe({
      next: (data) => {
        this.investments = data;
        this.calculateTotals();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento degli investimenti';
        console.error(err);
        this.loading = false;
      }
    });
  }
  
  calculateTotals(): void {
    this.totalInvested = this.investments.reduce((sum, inv) => sum + inv.initialAmount, 0);
    this.totalCurrentValue = this.investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    this.totalReturn = this.totalCurrentValue - this.totalInvested;
    
    // Calculate total return percentage
    if (this.totalInvested > 0) {
      this.totalReturnPercentage = (this.totalReturn / this.totalInvested) * 100;
    } else {
      this.totalReturnPercentage = 0;
    }
  }

  deleteInvestment(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questo investimento?')) {
      this.investmentService.deleteInvestment(id).subscribe({
        next: () => {
          this.investments = this.investments.filter(i => i.id !== id);
          this.calculateTotals();
        },
        error: (err) => {
          this.error = 'Errore nell\'eliminazione dell\'investimento';
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

  calculateReturn(investment: Investment): number {
    return investment.currentValue - investment.initialAmount;
  }

  calculateReturnPercentage(investment: Investment): number {
    if (investment.initialAmount === 0) {
      return 0;
    }
    return (investment.currentValue - investment.initialAmount) / investment.initialAmount * 100;
  }
}