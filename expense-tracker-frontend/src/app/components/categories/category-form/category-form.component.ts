import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Category, CategoryType } from '../../../models/category.model';
import { CategoryService } from '../../../services/category.service';
import { CategoryIconSelectorComponent } from '../../shared/category-icon-selector/category-icon-selector.component';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    CategoryIconSelectorComponent
  ],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  isEditMode = false;
  categoryId?: number;
  loading = false;
  error = '';
  submitted = false;
  showIconSelector = false;

  CategoryType = CategoryType;

  categoryTypes = Object.keys(CategoryType)
    .filter(key => !isNaN(Number(CategoryType[key as keyof typeof CategoryType])))
    .map(key => ({
      id: CategoryType[key as keyof typeof CategoryType],
      name: key
    }));

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Verificare se siamo in modalità modifica
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.categoryId = +params['id'];
        this.loadCategory(this.categoryId);
      }
    });
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      type: [CategoryType.Essential, Validators.required],
      color: ['#3f51b5'],
      icon: ['category']
    });
  }

  loadCategory(id: number): void {
    this.loading = true;
    this.categoryService.getCategory(id).subscribe({
      next: (category) => {
        this.categoryForm.patchValue({
          name: category.name,
          type: category.type,
          color: category.color || '#3f51b5',
          icon: category.icon || 'category'
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento della categoria';
        console.error(err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.categoryForm.invalid) {
      return;
    }

    this.loading = true;
    const category: Category = this.categoryForm.value;

    if (this.isEditMode && this.categoryId) {
      category.id = this.categoryId;
      this.categoryService.updateCategory(this.categoryId, category).subscribe({
        next: () => {
          this.router.navigate(['/categories']);
        },
        error: (err) => {
          this.error = 'Errore nell\'aggiornamento della categoria';
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      this.categoryService.createCategory(category).subscribe({
        next: () => {
          this.router.navigate(['/categories']);
        },
        error: (err) => {
          this.error = 'Errore nella creazione della categoria';
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  updateColorValue(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.categoryForm.get('color')?.setValue(input.value);
  }

  openIconSelector(): void {
    this.showIconSelector = true;
  }

  closeIconSelector(): void {
    this.showIconSelector = false;
  }

  onIconSelected(iconName: string): void {
    this.categoryForm.get('icon')?.setValue(iconName);
    this.closeIconSelector();
  }

  get f() {
    return this.categoryForm.controls;
  }
}
