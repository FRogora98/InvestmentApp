import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Investment } from '../../../models/investment.model';
import { InvestmentService } from '../../../services/investment.service';

@Component({
  selector: 'app-investment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './investment-form.component.html',
  styleUrls: ['./investment-form.component.scss']
})
export class InvestmentFormComponent implements OnInit {
  investmentForm!: FormGroup;
  isEditMode = false;
  investmentId?: number;
  loading = false;
  error = '';
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private investmentService: InvestmentService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.investmentId = +params['id'];
        this.loadInvestment(this.investmentId);
      }
    });
  }

  initForm(): void {
    this.investmentForm = this.fb.group({
      name: ['', Validators.required],
      initialAmount: [0, [Validators.required, Validators.min(0.01)]],
      purchaseDate: [new Date().toISOString().split('T')[0], Validators.required],
      currentValue: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadInvestment(id: number): void {
    this.loading = true;
    this.investmentService.getInvestment(id).subscribe({
      next: (investment) => {
        const formattedDate = investment.purchaseDate instanceof Date
          ? investment.purchaseDate.toISOString().split('T')[0]
          : new Date(investment.purchaseDate).toISOString().split('T')[0];

        this.investmentForm.patchValue({
          name: investment.name,
          initialAmount: investment.initialAmount,
          purchaseDate: formattedDate,
          currentValue: investment.currentValue
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento dell\'investimento';
        console.error(err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.investmentForm.invalid) {
      return;
    }

    this.loading = true;
    const investment: Investment = this.investmentForm.value;

    if (this.isEditMode && this.investmentId) {
      investment.id = this.investmentId;
      this.investmentService.updateInvestment(this.investmentId, investment).subscribe({
        next: () => {
          this.router.navigate(['/investments']);
        },
        error: (err) => {
          this.error = 'Errore nell\'aggiornamento dell\'investimento';
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      this.investmentService.createInvestment(investment).subscribe({
        next: () => {
          this.router.navigate(['/investments']);
        },
        error: (err) => {
          this.error = 'Errore nella creazione dell\'investimento';
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  get f() {
    return this.investmentForm.controls;
  }

  calculateReturn(): number {
    const initialAmount = this.investmentForm.get('initialAmount')?.value || 0;
    const currentValue = this.investmentForm.get('currentValue')?.value || 0;
    return currentValue - initialAmount;
  }

  calculateReturnPercentage(): number {
    const initialAmount = this.investmentForm.get('initialAmount')?.value || 0;
    if (initialAmount === 0) return 0;

    const currentValue = this.investmentForm.get('currentValue')?.value || 0;
    return ((currentValue - initialAmount) / initialAmount) * 100;
  }
}
