import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Investment } from "../../../models/investment.model";
import { InvestmentService } from "../../../services/investment.service";

@Component({
  selector: 'app-investment-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './investment-list.component.html',
  styleUrl: './investment-list.component.scss'
})

export class InvestmentListComponent implements OnInit {
  investments: Investment[] = [];
  loading = false;
  error = '';

  constructor(private investmentService: InvestmentService) {}

  ngOnInit(): void {
    this.loadInvestments();
  }

  loadInvestments(): void {
    this.loading = true;
    this.investmentService.getInvestments().subscribe({
      next: (data) => {
        this.investments = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento degli investimenti';
        console.error(err);
        this.loading = false;
      }
    });
  }

  deleteInvestment(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questo investimento?')) {
      this.investmentService.deleteInvestment(id).subscribe({
        next: () => {
          this.investments = this.investments.filter(i => i.id !== id);
        },
        error: (err) => {
          this.error = 'Errore nell\'eliminazione dell\'investimento';
          console.error(err);
        }
      });
    }
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('it-IT');
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
