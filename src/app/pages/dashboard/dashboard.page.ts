import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe],
  template: `
    <div class="container py-4">
      <div class="row mb-4">
        <div class="col">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h1>Dashboard</h1>
              <p class="text-muted mb-0">
                Welcome back, {{ authService.userDisplayName() }}
                @if (customerService.isBusinessCustomer()) {
                  <span class="badge bg-info ms-2">Business Account</span>
                }
              </p>
              @if (customerService.customer(); as customer) {
                @if (customer.type === 'BUSINESS') {
                  <p class="text-muted mb-0">{{ customer.businessName }}</p>
                }
              }
            </div>
          </div>
        </div>
      </div>

      @if (customerService.isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (customerService.error(); as error) {
        <div class="alert alert-danger">
          <h5 class="alert-heading">Error Loading Data</h5>
          <p class="mb-0">{{ error }}</p>
        </div>
      } @else if (customerService.customerSummary(); as summary) {
        <!-- Summary Cards -->
        <div class="row g-4 mb-4">
          <!-- Account Overview -->
          <div class="col-md-6 col-lg-3">
            <div class="card h-100 border-primary">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">Total Balance Due</h6>
                <div class="display-6 text-primary">{{ summary.totalDueAmount | currency }}</div>
                @if (summary.nextDueDate) {
                  <small class="text-muted">Due by {{ summary.nextDueDate | date:'MMM d, y' }}</small>
                }
              </div>
              <div class="card-footer bg-transparent border-0">
                <button class="btn btn-primary btn-sm">Pay Now</button>
              </div>
            </div>
          </div>

          <!-- Accounts Count -->
          <div class="col-md-6 col-lg-3">
            <div class="card h-100">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">Accounts</h6>
                <div class="display-6">{{ summary.totalAccounts }}</div>
                <small class="text-muted">
                  {{ summary.totalPremises }} {{ summary.totalPremises === 1 ? 'premise' : 'premises' }}
                </small>
              </div>
              <div class="card-footer bg-transparent border-0">
                <a routerLink="/account" class="btn btn-outline-primary btn-sm">View Details</a>
              </div>
            </div>
          </div>

          <!-- Meters -->
          <div class="col-md-6 col-lg-3">
            <div class="card h-100">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">Active Meters</h6>
                <div class="display-6">{{ summary.totalMeters }}</div>
                <small class="text-muted">Across all locations</small>
              </div>
              <div class="card-footer bg-transparent border-0">
                <a routerLink="/account" class="btn btn-outline-primary btn-sm">View Meters</a>
              </div>
            </div>
          </div>

          <!-- Usage Summary -->
          <div class="col-md-6 col-lg-3">
            <div class="card h-100">
              <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">This Period Usage</h6>
                @for (entry of getUsageEntries(summary.totalUsageThisPeriod); track entry.type) {
                  <div class="mb-1">
                    <span class="badge me-1" [class]="getMeterTypeBadgeClass(entry.type)">
                      {{ getMeterTypeIcon(entry.type) }}
                    </span>
                    <strong>{{ entry.usage | number:'1.0-0' }}</strong> {{ entry.unit }}
                  </div>
                }
              </div>
              <div class="card-footer bg-transparent border-0">
                <button class="btn btn-outline-primary btn-sm">View Usage</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Accounts List (for business) or Account Details (for individual) -->
        @if (customerService.customer(); as customer) {
          @if (customer.type === 'BUSINESS') {
            <!-- Business: Show all accounts -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="card-title mb-0">Accounts Overview</h5>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Account</th>
                        <th>Locations</th>
                        <th>Meters</th>
                        <th class="text-end">Balance</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (account of customer.accounts; track account.accountId) {
                        <tr>
                          <td>
                            <div>
                              <strong>{{ account.nickname || 'Account' }}</strong>
                            </div>
                            <small class="text-muted">{{ account.accountNumber }}</small>
                          </td>
                          <td>{{ account.premises.length }}</td>
                          <td>{{ getTotalMeters(account) }}</td>
                          <td class="text-end">{{ account.currentBalance | currency }}</td>
                          <td>
                            <span class="badge" [class]="getStatusBadgeClass(account.status)">
                              {{ account.status | titlecase }}
                            </span>
                          </td>
                          <td class="text-end">
                            <a routerLink="/account" class="btn btn-sm btn-outline-primary">View</a>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          } @else {
            <!-- Individual: Show account summary card -->
            @if (customer.accounts[0]; as account) {
              <div class="row g-4 mb-4">
                <div class="col-lg-6">
                  <div class="card h-100">
                    <div class="card-header">
                      <h5 class="card-title mb-0">Account Summary</h5>
                    </div>
                    <div class="card-body">
                      <dl class="mb-0">
                        <dt>Account Number</dt>
                        <dd class="text-muted">{{ account.accountNumber }}</dd>
                        <dt>Premises</dt>
                        <dd class="text-muted">{{ account.premises.length }} location(s)</dd>
                        <dt>Account Status</dt>
                        <dd>
                          <span class="badge" [class]="getStatusBadgeClass(account.status)">
                            {{ account.status | titlecase }}
                          </span>
                        </dd>
                        @if (account.lastPaymentDate) {
                          <dt>Last Payment</dt>
                          <dd class="text-muted">
                            {{ account.lastPaymentAmount | currency }} on {{ account.lastPaymentDate | date:'MMM d, y' }}
                          </dd>
                        }
                      </dl>
                    </div>
                    <div class="card-footer bg-transparent">
                      <a routerLink="/account" class="btn btn-outline-primary btn-sm">View Account</a>
                    </div>
                  </div>
                </div>

                <div class="col-lg-6">
                  <div class="card h-100">
                    <div class="card-header">
                      <h5 class="card-title mb-0">Premises</h5>
                    </div>
                    <div class="list-group list-group-flush">
                      @for (premise of account.premises; track premise.premiseId) {
                        <div class="list-group-item">
                          <div class="d-flex justify-content-between align-items-start">
                            <div>
                              <div>
                                {{ premise.street }}
                                @if (premise.unit) {
                                  , {{ premise.unit }}
                                }
                                @if (premise.isPrimary) {
                                  <span class="badge bg-secondary ms-1">Primary</span>
                                }
                              </div>
                              <small class="text-muted">{{ premise.city }}, {{ premise.state }} {{ premise.zip }}</small>
                            </div>
                            <div class="text-end">
                              <small class="text-muted">{{ premise.meters.length }} meter(s)</small>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          }
        }

        <!-- Recent Bills -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Recent Bills</h5>
            <button class="btn btn-sm btn-outline-primary">View All</button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    @if (customerService.isBusinessCustomer()) {
                      <th>Account</th>
                    }
                    <th>Billing Period</th>
                    <th class="text-end">Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (bill of customerService.bills().slice(0, 5); track bill.billId) {
                    <tr>
                      @if (customerService.isBusinessCustomer()) {
                        <td>
                          <small class="text-muted">{{ getAccountNickname(bill.accountId) }}</small>
                        </td>
                      }
                      <td>{{ bill.billingPeriodStart | date:'MMM d' }} - {{ bill.billingPeriodEnd | date:'MMM d, y' }}</td>
                      <td class="text-end">{{ bill.amount | currency }}</td>
                      <td>{{ bill.dueDate | date:'MMM d, y' }}</td>
                      <td>
                        <span class="badge" [class]="getBillStatusBadgeClass(bill.status)">
                          {{ bill.status | titlecase }}
                        </span>
                      </td>
                      <td class="text-end">
                        @if (bill.status === 'unpaid' || bill.status === 'overdue') {
                          <button class="btn btn-sm btn-primary">Pay</button>
                        } @else {
                          <button class="btn btn-sm btn-outline-secondary">View</button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
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
                <a routerLink="/account" class="btn btn-outline-primary w-100 py-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="d-block mx-auto mb-2" viewBox="0 0 16 16">
                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                  </svg>
                  Account Settings
                </a>
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
      }
    </div>
  `
})
export class DashboardPage {
  authService = inject(AuthService);
  customerService = inject(CustomerService);

  getTotalMeters(account: { premises: { meters: unknown[] }[] }): number {
    return account.premises.reduce((sum, p) => sum + p.meters.length, 0);
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'bg-success';
      case 'INACTIVE': return 'bg-secondary';
      case 'PENDING': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  getBillStatusBadgeClass(status: string): string {
    switch (status) {
      case 'paid': return 'bg-success';
      case 'unpaid': return 'bg-warning text-dark';
      case 'overdue': return 'bg-danger';
      case 'pending': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getMeterTypeBadgeClass(type: string): string {
    switch (type.toUpperCase()) {
      case 'ELECTRIC': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  getMeterTypeIcon(type: string): string {
    switch (type.toUpperCase()) {
      case 'ELECTRIC': return '⚡';
      default: return '📊';
    }
  }

  getUsageEntries(usage: { [key: string]: { usage: number; unit: string } } | undefined): Array<{ type: string; usage: number; unit: string }> {
    if (!usage) return [];
    return Object.entries(usage).map(([type, data]) => ({
      type,
      usage: data.usage,
      unit: data.unit
    }));
  }

  getAccountNickname(accountId: number): string {
    const account = this.customerService.getAccountById(accountId);
    return account?.nickname || account?.accountNumber || '';
  }
}
