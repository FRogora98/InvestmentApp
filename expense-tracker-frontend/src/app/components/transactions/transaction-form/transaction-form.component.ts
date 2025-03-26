import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Category, CategoryType } from '../../../models/category.model';
import { Transaction, TransactionType } from '../../../models/transaction.model';
import { CategoryService } from '../../../services/category.service';
import { TransactionService } from '../../../services/transaction.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent implements OnInit {
  transactionForm!: FormGroup;
  isEditMode = false;
  transactionId?: number;
  loading = false;
  error = '';
  submitted = false;
  categories: Category[] = [];

  TransactionType = TransactionType;
  transactionTypes = Object.keys(TransactionType)
    .filter(key => !isNaN(Number(TransactionType[key as keyof typeof TransactionType])))
    .map(key => ({
      id: TransactionType[key as keyof typeof TransactionType],
      name: key
    }));

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.initForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.transactionId = +params['id'];
        this.loadTransaction(this.transactionId);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Errore nel caricamento delle categorie', err);
      }
    });
  }

  getFilteredCategories(): Category[] {
    const type = this.transactionForm?.get('type')?.value;

    if (type === TransactionType.Expense) {
      return this.categories.filter(c => c.type === CategoryType.Essential || c.type === CategoryType.Extra);
    } else if (type === TransactionType.Income) {
      return this.categories.filter(c => c.type === CategoryType.Income);
    } else if (type === TransactionType.Investment) {
      return this.categories.filter(c => c.type === CategoryType.Investment);
    }

    return this.categories;
  }

  initForm(): void {
    this.transactionForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      category: [''],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      type: [TransactionType.Expense, Validators.required],
      categoryId: [null]
    });

    this.transactionForm.get('type')?.valueChanges.subscribe(value => {
      this.transactionForm.get('categoryId')?.setValue(null);
    });
  }

  loadTransaction(id: number): void {
    this.loading = true;
    this.transactionService.getTransaction(id).subscribe({
      next: (transaction) => {
        const formattedDate = transaction.date instanceof Date
          ? transaction.date.toISOString().split('T')[0]
          : new Date(transaction.date).toISOString().split('T')[0];

        this.transactionForm.patchValue({
          amount: transaction.amount,
          category: transaction.category,
          date: formattedDate,
          type: transaction.type,
          categoryId: transaction.categoryId
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento della transazione';
        console.error(err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.transactionForm.invalid) {
      return;
    }

    this.loading = true;
    // Crea un nuovo oggetto per la transazione, selezionando solo i campi necessari
    const transaction: Transaction = {
      amount: this.transactionForm.get('amount')?.value,
      category: this.transactionForm.get('category')?.value,
      date: this.transactionForm.get('date')?.value,
      type: this.transactionForm.get('type')?.value,
      categoryId: this.transactionForm.get('categoryId')?.value || null
    };

    if (this.isEditMode && this.transactionId) {
      transaction.id = this.transactionId;
      this.transactionService.updateTransaction(this.transactionId, transaction).subscribe({
        next: () => {
          this.router.navigate(['/transactions']);
        },
        error: (err) => {
          this.error = 'Errore nell\'aggiornamento della transazione';
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      this.transactionService.createTransaction(transaction).subscribe({
        next: () => {
          this.router.navigate(['/transactions']);
        },
        error: (err) => {
          this.error = 'Errore nella creazione della transazione: ' + JSON.stringify(err.error);
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  get f() {
    return this.transactionForm.controls;
  }
}
