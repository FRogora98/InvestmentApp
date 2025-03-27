import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

interface IconCategory {
  id: string;
  name: string;
  icon: string;
}

interface IconItem {
  name: string;
  label: string;
  category: string;
}

@Component({
  selector: 'app-category-icon-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule
  ],
  templateUrl: './category-icon-selector.component.html',
  styleUrls: ['./category-icon-selector.component.scss']
})
export class CategoryIconSelectorComponent implements OnInit {
  @Input() initialIcon: string = 'category';
  @Input() selectedColor: string = '#3f51b5';
  @Output() iconSelected = new EventEmitter<string>();
  @Output() canceled = new EventEmitter<void>();

  searchTerm = '';
  selectedIcon = '';
  selectedIconName = '';
  selectedCategory = 'all';

  // Icon categories
  iconCategories: IconCategory[] = [
    { id: 'finance', name: 'Finanza', icon: 'account_balance' },
    { id: 'shopping', name: 'Acquisti', icon: 'shopping_cart' },
    { id: 'transport', name: 'Trasporti', icon: 'directions_car' },
    { id: 'food', name: 'Cibo', icon: 'restaurant' },
    { id: 'home', name: 'Casa', icon: 'home' },
    { id: 'leisure', name: 'Svago', icon: 'movie' }
  ];

  // All available icons grouped by category
  allIcons: IconItem[] = [
    // Finance
    { name: 'account_balance', label: 'Banca', category: 'finance' },
    { name: 'account_balance_wallet', label: 'Portafoglio', category: 'finance' },
    { name: 'credit_card', label: 'Carta di Credito', category: 'finance' },
    { name: 'savings', label: 'Risparmi', category: 'finance' },
    { name: 'paid', label: 'Pagamento', category: 'finance' },
    { name: 'currency_exchange', label: 'Cambio Valuta', category: 'finance' },
    { name: 'trending_up', label: 'Trend Positivo', category: 'finance' },
    { name: 'trending_down', label: 'Trend Negativo', category: 'finance' },
    { name: 'receipt_long', label: 'Ricevuta', category: 'finance' },
    { name: 'receipt', label: 'Scontrino', category: 'finance' },
    { name: 'attach_money', label: 'Denaro', category: 'finance' },

    // Shopping
    { name: 'shopping_cart', label: 'Carrello', category: 'shopping' },
    { name: 'shopping_bag', label: 'Borsa', category: 'shopping' },
    { name: 'store', label: 'Negozio', category: 'shopping' },
    { name: 'local_mall', label: 'Centro Commerciale', category: 'shopping' },
    { name: 'local_offer', label: 'Offerta', category: 'shopping' },
    { name: 'redeem', label: 'Regalo', category: 'shopping' },
    { name: 'loyalty', label: 'Fedeltà', category: 'shopping' },
    { name: 'work', label: 'Lavoro', category: 'shopping' },

    // Transport
    { name: 'directions_car', label: 'Auto', category: 'transport' },
    { name: 'local_gas_station', label: 'Benzina', category: 'transport' },
    { name: 'directions_bus', label: 'Autobus', category: 'transport' },
    { name: 'directions_railway', label: 'Treno', category: 'transport' },
    { name: 'flight', label: 'Aereo', category: 'transport' },
    { name: 'directions_bike', label: 'Bicicletta', category: 'transport' },
    { name: 'directions_walk', label: 'Camminata', category: 'transport' },
    { name: 'local_taxi', label: 'Taxi', category: 'transport' },

    // Food
    { name: 'restaurant', label: 'Ristorante', category: 'food' },
    { name: 'fastfood', label: 'Fast Food', category: 'food' },
    { name: 'local_cafe', label: 'Caffè', category: 'food' },
    { name: 'local_bar', label: 'Bar', category: 'food' },
    { name: 'local_grocery_store', label: 'Supermercato', category: 'food' },
    { name: 'bakery_dining', label: 'Panetteria', category: 'food' },
    { name: 'liquor', label: 'Bevande', category: 'food' },
    { name: 'lunch_dining', label: 'Pranzo', category: 'food' },
    { name: 'dinner_dining', label: 'Cena', category: 'food' },

    // Home
    { name: 'home', label: 'Casa', category: 'home' },
    { name: 'house', label: 'Abitazione', category: 'home' },
    { name: 'apartment', label: 'Appartamento', category: 'home' },
    { name: 'chair', label: 'Arredamento', category: 'home' },
    { name: 'cleaning_services', label: 'Pulizie', category: 'home' },
    { name: 'electric_bolt', label: 'Elettricità', category: 'home' },
    { name: 'water_drop', label: 'Acqua', category: 'home' },
    { name: 'local_laundry_service', label: 'Lavanderia', category: 'home' },
    { name: 'wifi', label: 'Internet', category: 'home' },
    { name: 'tv', label: 'Televisione', category: 'home' },

    // Leisure
    { name: 'movie', label: 'Cinema', category: 'leisure' },
    { name: 'sports_soccer', label: 'Sport', category: 'leisure' },
    { name: 'sports_esports', label: 'Videogiochi', category: 'leisure' },
    { name: 'spa', label: 'Benessere', category: 'leisure' },
    { name: 'fitness_center', label: 'Palestra', category: 'leisure' },
    { name: 'flight_takeoff', label: 'Viaggio', category: 'leisure' },
    { name: 'beach_access', label: 'Spiaggia', category: 'leisure' },
    { name: 'theater_comedy', label: 'Teatro', category: 'leisure' },
    { name: 'music_note', label: 'Musica', category: 'leisure' },
    { name: 'nightlife', label: 'Vita Notturna', category: 'leisure' },

    // Others
    { name: 'category', label: 'Categoria', category: 'other' },
    { name: 'medical_services', label: 'Medico', category: 'other' },
    { name: 'school', label: 'Scuola', category: 'other' },
    { name: 'pets', label: 'Animali', category: 'other' },
    { name: 'local_library', label: 'Biblioteca', category: 'other' },
    { name: 'phone', label: 'Telefono', category: 'other' },
    { name: 'child_care', label: 'Bambini', category: 'other' },
    { name: 'person', label: 'Persona', category: 'other' },
    { name: 'cloud', label: 'Cloud', category: 'other' },
    { name: 'work', label: 'Lavoro', category: 'other' },
    { name: 'lightbulb', label: 'Idea', category: 'other' }
  ];

  filteredIcons: IconItem[] = [];

  ngOnInit(): void {
    this.selectedIcon = this.initialIcon || 'category';
    this.updateSelectedIconName();
    this.filteredIcons = [...this.allIcons];
  }

  updateSelectedIconName(): void {
    const iconItem = this.allIcons.find(icon => icon.name === this.selectedIcon);
    this.selectedIconName = iconItem ? iconItem.label : this.selectedIcon;
  }

  filterIcons(): void {
    const term = this.searchTerm.toLowerCase();

    if (!term && this.selectedCategory === 'all') {
      this.filteredIcons = [...this.allIcons];
      return;
    }

    this.filteredIcons = this.allIcons.filter(icon => {
      const matchesTerm = !term ||
                         icon.name.toLowerCase().includes(term) ||
                         icon.label.toLowerCase().includes(term);

      const matchesCategory = this.selectedCategory === 'all' ||
                             icon.category === this.selectedCategory;

      return matchesTerm && matchesCategory;
    });
  }

  filterIconsByCategory(category: string): void {
    this.selectedCategory = category;
    this.filterIcons();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterIcons();
  }

  selectIcon(iconName: string): void {
    this.selectedIcon = iconName;
    this.updateSelectedIconName();
  }

  confirm(): void {
    this.iconSelected.emit(this.selectedIcon);
  }

  cancel(): void {
    this.canceled.emit();
  }
}
