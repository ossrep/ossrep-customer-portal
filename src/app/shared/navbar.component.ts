import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgbCollapseModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" [routerLink]="brandLink()">
          <strong>ossrep</strong>
        </a>
        <button
          class="navbar-toggler"
          type="button"
          (click)="isCollapsed = !isCollapsed"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" [ngbCollapse]="isCollapsed" id="navbarNav">
          <ul class="navbar-nav me-auto">
            @if (authService.isAuthenticated()) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                  Dashboard
                </a>
              </li>
            }
          </ul>
          <ul class="navbar-nav">
            @if (authService.isAuthenticated()) {
              <li class="nav-item">
                <span class="nav-link text-light">
                  {{ authService.userDisplayName() }}
                </span>
              </li>
              <li class="nav-item">
                <button class="btn btn-outline-light" (click)="authService.logout()">
                  Logout
                </button>
              </li>
            } @else {
              <li class="nav-item">
                <a class="nav-link" routerLink="/login" routerLinkActive="active">
                  Login
                </a>
              </li>
            }
          </ul>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  isCollapsed = true;

  brandLink = computed(() => this.authService.isAuthenticated() ? '/dashboard' : '/');
}
