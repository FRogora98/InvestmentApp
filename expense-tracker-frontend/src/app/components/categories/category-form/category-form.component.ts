import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Category, CategoryType } from '../../../models/category.model';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  isEditMode = false;
  categoryId?: number;
  loading = false;
  error = '';
  submitted = false;

  CategoryType = CategoryType;

  categoryTypes = Object.keys(CategoryType)
    .filter(key => !isNaN(Number(CategoryType[key as keyof typeof CategoryType])))
    .map(key => ({
      id: CategoryType[key as keyof typeof CategoryType],
      name: key
    }));

  availableIcons = [
    'bi-house', 'bi-cart', 'bi-cash', 'bi-credit-card',
    'bi-basket', 'bi-car-front', 'bi-airplane', 'bi-bus-front',
    'bi-hospital', 'bi-heart-pulse', 'bi-cup-hot', 'bi-shop',
    'bi-bag', 'bi-gift', 'bi-bank', 'bi-building', 'bi-globe',
    'bi-laptop', 'bi-phone', 'bi-lightbulb', 'bi-droplet',
    'bi-fuel-pump', 'bi-wrench', 'bi-tools', 'bi-book',
    'bi-mortarboard', 'bi-camera', 'bi-music-note', 'bi-film',
    'bi-piggy-bank', 'bi-graph-up-arrow'
  ];

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
      color: ['#3498db'],
      icon: ['bi-tag']
    });
  }

  loadCategory(id: number): void {
    this.loading = true;
    this.categoryService.getCategory(id).subscribe({
      next: (category) => {
        this.categoryForm.patchValue({
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon
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

  selectIcon(icon: string): void {
    this.categoryForm.get('icon')?.setValue(icon);
  }

  get f() {
    return this.categoryForm.controls;
  }
}
