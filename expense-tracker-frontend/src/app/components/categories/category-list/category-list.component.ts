// category-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category, CategoryType } from '../../../models/category.model';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  error = '';

  CategoryType = CategoryType;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore nel caricamento delle categorie';
        console.error(err);
        this.loading = false;
      }
    });
  }

  deleteCategory(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questa categoria?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.id !== id);
        },
        error: (err) => {
          this.error = 'Errore nell\'eliminazione della categoria';
          console.error(err);
        }
      });
    }
  }

  getCategoryTypeText(type: CategoryType): string {
    switch (type) {
      case CategoryType.Essential: return 'Essenziale';
      case CategoryType.Extra: return 'Extra';
      case CategoryType.Income: return 'Entrata';
      case CategoryType.Investment: return 'Investimento';
      default: return 'Sconosciuto';
    }
  }

  getCategoryTypeClass(type: CategoryType): string {
    switch (type) {
      case CategoryType.Essential: return 'badge bg-primary';
      case CategoryType.Extra: return 'badge bg-warning';
      case CategoryType.Income: return 'badge bg-success';
      case CategoryType.Investment: return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  }
}
