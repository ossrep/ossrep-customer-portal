import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="container py-4">
      <div class="row mb-4">
        <div class="col">
          <h1>Dashboard</h1>
          <p class="text-muted">Welcome back, {{ authService.userDisplayName() }}</p>
        </div>
      </div>

      <div class="row g-4">
        <!-- Account Summary -->
        <div class="col-md-6 col-lg-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">Account Summary</h5>
            </div>
            <div class="card-body">
              <dl class="mb-0">
                <dt>Account Number</dt>
                <dd class="text-muted">1234567890</dd>
                <dt>Service Address</dt>
                <dd class="text-muted">123 Main Street, Anytown, TX 12345</dd>
                <dt>Account Status</dt>
                <dd><span class="badge bg-success">Active</span></dd>
              </dl>
            </div>
            <div class="card-footer bg-transparent">
              <a href="#" class="btn btn-outline-primary btn-sm">View Account</a>
            </div>
          </div>
        </div>

        <!-- Current Bill -->
        <div class="col-md-6 col-lg-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">Current Bill</h5>
            </div>
            <div class="card-body">
              <div class="display-6 text-primary mb-2">$142.50</div>
              <p class="text-muted mb-2">Due: January 28, 2026</p>
              <div class="progress mb-3" style="height: 8px;">
                <div class="progress-bar" role="progressbar" style="width: 0%"></div>
              </div>
              <small class="text-muted">No payment made yet</small>
            </div>
            <div class="card-footer bg-transparent">
              <a href="#" class="btn btn-primary btn-sm">Pay Now</a>
              <a href="#" class="btn btn-outline-secondary btn-sm ms-2">View Bill</a>
            </div>
          </div>
        </div>

        <!-- Usage Summary -->
        <div class="col-md-6 col-lg-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">This Month's Usage</h5>
            </div>
            <div class="card-body">
              <div class="display-6 text-primary mb-2">1,245 kWh</div>
              <p class="text-muted mb-2">December 2025</p>
              <div class="d-flex align-items-center">
                <span class="badge bg-warning text-dark me-2">↑ 8%</span>
                <small class="text-muted">vs last month</small>
              </div>
            </div>
            <div class="card-footer bg-transparent">
              <a href="#" class="btn btn-outline-primary btn-sm">View Usage</a>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-6 col-md-3">
                  <button class="btn btn-outline-primary w-100 py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="d-block mx-auto mb-2" viewBox="0 0 16 16">
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/>
                    </svg>
                    Make Payment
                  </button>
                </div>
                <div class="col-6 col-md-3">
                  <button class="btn btn-outline-primary w-100 py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="d-block mx-auto mb-2" viewBox="0 0 16 16">
                      <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                    </svg>
                    View Statements
                  </button>
                </div>
                <div class="col-6 col-md-3">
                  <button class="btn btn-outline-primary w-100 py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="d-block mx-auto mb-2" viewBox="0 0 16 16">
                      <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                      <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                    </svg>
                    Account Settings
                  </button>
                </div>
                <div class="col-6 col-md-3">
                  <button class="btn btn-outline-primary w-100 py-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="d-block mx-auto mb-2" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                    </svg>
                    Get Help
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardPage {
  authService = inject(AuthService);
}
