import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';

interface UserProfile {
  name: string;
  email?: string;
  avatar?: string;
  accountType?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  isSmallScreen = false;
  isSidenavOpen = true;

  user: UserProfile = {
    name: 'Federico Rogora',
    email: 'federico.rogora@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Federico+Rogora&background=3f51b5&color=fff',
    accountType: 'Premium'
  };

  menuItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'receipt_long', label: 'Transazioni', route: '/transactions' },
    { icon: 'trending_up', label: 'Investimenti', route: '/investments' },
    { icon: 'category', label: 'Categorie', route: '/categories' },
    { icon: 'account_balance', label: 'Conti', route: '/accounts' },
    { icon: 'pie_chart', label: 'Budget', route: '/budgets' }
  ];
  
  notifications = [
    {
      id: 1,
      title: 'Nuova entrata registrata',
      message: 'Hai ricevuto un pagamento di €120.00',
      type: 'success',
      icon: 'payments',
      time: '10 minuti fa',
      read: false
    },
    {
      id: 2,
      title: 'Nuova funzionalità disponibile',
      message: 'Prova le nuove statistiche avanzate',
      type: 'info',
      icon: 'info',
      time: '2 ore fa',
      read: false
    },
    {
      id: 3,
      title: 'Soglia di budget raggiunta',
      message: 'Hai superato il budget per la categoria "Alimentari"',
      type: 'warning',
      icon: 'warning',
      time: 'Ieri',
      read: true
    }
  ];

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(result => {
        this.isSmallScreen = result.matches;
        this.isSidenavOpen = !result.matches;
      });
  }
  
  ngOnInit(): void {
    // Initialize any needed data
  }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
  
  getUnreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
  
  markAllNotificationsAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }
}