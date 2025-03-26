import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements AfterViewInit {
  user = {
    name: 'Federico Rogora',
    avatar: 'assets/avatar.png'
  };

  menuItems = [
    { icon: 'bi bi-speedometer2', label: 'Dashboard', route: '/dashboard' },
    { icon: 'bi bi-cash-coin', label: 'Transazioni', route: '/transactions' },
    { icon: 'bi bi-graph-up-arrow', label: 'Investimenti', route: '/investments' },
    { icon: 'bi bi-bank', label: 'Conti', route: '/accounts' },
    { icon: 'bi bi-pie-chart', label: 'Budget', route: '/budget' },
    { icon: 'bi bi-tag', label: 'Categorie', route: '/categories' }
  ];

  isSidebarOpen = true;
  isSmallScreen = false;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.checkScreenSize();
    this.initMobileNav();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isSmallScreen = window.innerWidth < 992;
    if (this.isSmallScreen) {
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
    }
    this.updateSidebarState();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.updateSidebarState();
  }

  updateSidebarState() {
    const sidebar = this.el.nativeElement.querySelector('.sidebar');
    if (sidebar) {
      if (this.isSidebarOpen) {
        sidebar.classList.add('show');
      } else {
        sidebar.classList.remove('show');
      }
    }
  }

  initMobileNav() {
    const menuToggleBtns = this.el.nativeElement.querySelectorAll('.menu-toggle, .sidebar-toggle');
    menuToggleBtns.forEach((btn: HTMLElement) => {
      btn.addEventListener('click', () => {
        this.toggleSidebar();
      });
    });

    const navLinks = this.el.nativeElement.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach((link: HTMLElement) => {
      link.addEventListener('click', () => {
        if (this.isSmallScreen && this.isSidebarOpen) {
          this.toggleSidebar();
        }
      });
    });
  }
}
