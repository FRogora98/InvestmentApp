import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, of, startWith, switchMap, take, tap } from 'rxjs';
import { Budget } from '../../../models/budget.model';
import { Category } from '../../../models/category.model';
import { CategoryService } from '../../../services/category.service';
import { BudgetStore } from '../../../store/budget.store';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-budget-form',
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.scss'],
  providers: [BudgetStore],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ]
})
export class BudgetFormComponent implements OnInit {
  budgetForm: FormGroup;
  isEditMode = false;
  budgetId?: number;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  categories$: Observable<Category[]>;
  recurringFrequencies = ['monthly', 'quarterly', 'yearly'];
  formErrors: {[key: string]: string} = {};
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private budgetStore: BudgetStore,
    private categoryService: CategoryService
  ) {
    this.budgetForm = this.createForm();
    this.loading$ = this.budgetStore.loading$;
    this.error$ = this.budgetStore.error$;
    this.categories$ = this.categoryService.getCategories();
  }

  ngOnInit(): void {
    this.setupFormValidation();
    
    this.route.params.pipe(
      take(1),
      map(params => params['id']),
      tap(id => {
        this.budgetId = id ? +id : undefined;
        this.isEditMode = !!id;
      }),
      switchMap(id => {
        if (id) {
          this.budgetStore.loadBudget(+id);
          return this.budgetStore.selectedBudget$;
        }
        return of(null);
      })
    ).subscribe(budget => {
      if (budget) {
        this.patchForm(budget);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      amount: [0, [Validators.required, Validators.min(0)]],
      spent: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null],
      startDate: [new Date(), Validators.required],
      endDate: [this.getDefaultEndDate(), Validators.required],
      isRecurring: [false],
      recurringFrequency: [{value: 'monthly', disabled: true}],
      notes: ['', Validators.maxLength(500)]
    });
  }

  setupFormValidation(): void {
    // Dynamic validation for recurring frequency
    this.budgetForm.get('isRecurring')?.valueChanges.subscribe(isRecurring => {
      const recurringFrequencyControl = this.budgetForm.get('recurringFrequency');
      if (isRecurring) {
        recurringFrequencyControl?.enable();
        recurringFrequencyControl?.setValidators(Validators.required);
      } else {
        recurringFrequencyControl?.disable();
        recurringFrequencyControl?.clearValidators();
      }
      recurringFrequencyControl?.updateValueAndValidity();
    });

    // Date validation
    const startDateControl = this.budgetForm.get('startDate');
    const endDateControl = this.budgetForm.get('endDate');

    if (startDateControl && endDateControl) {
      combineLatest([
        startDateControl.valueChanges.pipe(startWith(startDateControl.value)),
        endDateControl.valueChanges.pipe(startWith(endDateControl.value))
      ]).subscribe(([startDate, endDate]) => {
        if (startDate && endDate && 
            new Date(endDate).getTime() < new Date(startDate).getTime()) {
          endDateControl.setErrors({ invalidEndDate: true });
          this.formErrors['endDate'] = 'End date must be after start date';
        } else {
          if (endDateControl.hasError('invalidEndDate')) {
            delete this.formErrors['endDate'];
            const errors = endDateControl.errors ? { ...endDateControl.errors } : null;
            if (errors) {
              delete errors['invalidEndDate'];
              endDateControl.setErrors(Object.keys(errors).length ? errors : null);
            }
          }
        }
      });
    }
  }

  patchForm(budget: Budget): void {
    this.budgetForm.patchValue({
      name: budget.name,
      amount: budget.amount,
      spent: budget.spent,
      categoryId: budget.categoryId || null,
      startDate: new Date(budget.startDate),
      endDate: new Date(budget.endDate),
      isRecurring: budget.isRecurring,
      recurringFrequency: budget.recurringFrequency || 'monthly',
      notes: budget.notes || ''
    });

    // Update form control states based on isRecurring
    if (budget.isRecurring) {
      this.budgetForm.get('recurringFrequency')?.enable();
    }
  }

  getDefaultEndDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }

  onSubmit(): void {
    if (this.budgetForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.budgetForm.controls).forEach(key => {
        const control = this.budgetForm.get(key);
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });
      return;
    }

    const formValue = this.budgetForm.getRawValue();
    const budget: Budget = {
      name: formValue.name,
      amount: formValue.amount,
      spent: formValue.spent,
      categoryId: formValue.categoryId || undefined,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      isRecurring: formValue.isRecurring,
      recurringFrequency: formValue.isRecurring ? formValue.recurringFrequency : undefined,
      notes: formValue.notes || undefined
    };

    if (this.isEditMode && this.budgetId) {
      budget.id = this.budgetId;
      this.budgetStore.updateBudget(budget);
    } else {
      this.budgetStore.createBudget(budget);
    }

    this.subscribeToStoreForNavigation();
  }

  subscribeToStoreForNavigation(): void {
    // Navigate away after successful save
    this.loading$.pipe(
      take(2), // Take initial loading state (false) and the next one (true when saving starts)
      switchMap(loading => {
        if (loading) {
          // During loading, start watching error state
          return this.error$.pipe(
            take(1),
            tap(error => {
              if (!error) {
                // If no error after save, navigate to list
                this.router.navigate(['/budgets']);
              }
            })
          );
        }
        return of(null); // On initial load, don't do anything
      })
    ).subscribe();
  }

  onCancel(): void {
    this.router.navigate(['/budgets']);
  }
}
