import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow">
            <div class="card-body p-4">
              <h2 class="card-title text-center mb-4">Sign In</h2>
              
              @if (authService.isLoading()) {
                <div class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-3 text-muted">Checking authentication...</p>
                </div>
              } @else {
                @if (authService.initError()) {
                  <div class="alert alert-danger" role="alert">
                    <strong>Connection Error</strong>
                    <p class="mb-0 small">{{ authService.initError() }}</p>
                  </div>
                }
                <p class="text-muted text-center mb-4">
                  Sign in to access your energy account and manage your services.
                </p>
                <div class="d-grid">
                  <button class="btn btn-primary btn-lg" (click)="authService.login()">
                    Sign in with SSO
                  </button>
                </div>
                <hr class="my-4">
                <p class="text-center text-muted small mb-0">
                  By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginPage implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }
}
