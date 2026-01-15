import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CustomerService } from '../../services/customer.service';
import { Account, Premise, Meter } from '../../models/customer.model';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe],
  template: `
    <div class="container py-4">
      <div class="row mb-4">
        <div class="col">
          <h1>Account Settings</h1>
          <p class="text-muted">Manage your accounts, premises, and preferences</p>
        </div>
      </div>

      @if (customerService.isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (customerService.customer(); as customer) {
        <!-- Navigation Tabs -->
        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <button class="nav-link" [class.active]="activeTab() === 'accounts'" (click)="activeTab.set('accounts')">
              Accounts & Locations
              <span class="badge bg-secondary ms-1">{{ customer.accounts.length }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" [class.active]="activeTab() === 'profile'" (click)="activeTab.set('profile')">
              Profile
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" [class.active]="activeTab() === 'preferences'" (click)="activeTab.set('preferences')">
              Preferences
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" [class.active]="activeTab() === 'security'" (click)="activeTab.set('security')">
              Security
            </button>
          </li>
        </ul>

        <!-- Accounts & Locations Tab -->
        @if (activeTab() === 'accounts') {
          <div class="row g-4">
            @for (account of customer.accounts; track account.accountId) {
              <div class="col-12">
                <div class="card">
                  <div class="card-header bg-light">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 class="mb-0">
                          @if (account.nickname) {
                            {{ account.nickname }}
                            <small class="text-muted ms-2">#{{ account.accountNumber }}</small>
                          } @else {
                            Account #{{ account.accountNumber }}
                          }
                        </h5>
                      </div>
                      <div class="d-flex align-items-center gap-3">
                        <span class="badge" [class]="getStatusBadgeClass(account.status)">
                          {{ account.status | titlecase }}
                        </span>
                        <span class="text-muted">
                          Balance: <strong>{{ account.currentBalance | currency }}</strong>
                        </span>
                        <button class="btn btn-sm btn-outline-primary" (click)="editAccount(account)">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="card-body p-0">
                    <!-- Premises -->
                    @for (premise of account.premises; track premise.premiseId; let isLast = $last) {
                      <div class="p-3" [class.border-bottom]="!isLast">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h6 class="mb-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="me-2" viewBox="0 0 16 16">
                                <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
                              </svg>
                              {{ premise.street }}
                              @if (premise.unit) {
                                , {{ premise.unit }}
                              }
                              @if (premise.isPrimary) {
                                <span class="badge bg-info ms-2">Primary</span>
                              }
                            </h6>
                            <small class="text-muted">{{ premise.city }}, {{ premise.state }} {{ premise.zip }}</small>
                          </div>
                          <button class="btn btn-sm btn-outline-secondary" (click)="editPremise(premise)">
                            Edit Premise
                          </button>
                        </div>

                        <!-- Meters Table -->
                        <div class="table-responsive">
                          <table class="table table-sm table-hover mb-0">
                            <thead class="table-light">
                              <tr>
                                <th>Meter</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Last Reading</th>
                                <th>Reading Date</th>
                                <th>Install Date</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              @for (meter of premise.meters; track meter.meterId) {
                                <tr>
                                  <td>
                                    <code>{{ meter.meterNumber }}</code>
                                  </td>
                                  <td>
                                    <span class="badge" [class]="getMeterTypeBadgeClass(meter.type)">
                                      {{ getMeterTypeIcon(meter.type) }} {{ meter.type | titlecase }}
                                    </span>
                                  </td>
                                  <td>
                                    <span class="badge" [class]="meter.status === 'active' ? 'bg-success' : 'bg-secondary'">
                                      {{ meter.status | titlecase }}
                                    </span>
                                  </td>
                                  <td>{{ meter.lastReading | number }} {{ meter.unit }}</td>
                                  <td>{{ meter.lastReadingDate | date:'MMM d, y' }}</td>
                                  <td>{{ meter.installDate | date:'MMM d, y' }}</td>
                                  <td class="text-end">
                                    <button class="btn btn-sm btn-link" (click)="viewMeterDetails(meter)">
                                      Details
                                    </button>
                                  </td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Profile Tab -->
        @if (activeTab() === 'profile') {
          <div class="row g-4">
            <div class="col-lg-6">
              <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">
                    @if (customer.type === 'business') {
                      Business Information
                    } @else {
                      Personal Information
                    }
                  </h5>
                  @if (!editingProfile()) {
                    <button class="btn btn-sm btn-outline-primary" (click)="editingProfile.set(true)">
                      Edit
                    </button>
                  }
                </div>
                <div class="card-body">
                  @if (editingProfile()) {
                    <form (ngSubmit)="saveProfile()">
                      @if (customer.type === 'business') {
                        <div class="mb-3">
                          <label for="businessName" class="form-label">Business Name</label>
                          <input type="text" class="form-control" id="businessName" 
                                 [(ngModel)]="profileForm.businessName" name="businessName">
                        </div>
                      } @else {
                        <div class="mb-3">
                          <label for="firstName" class="form-label">First Name</label>
                          <input type="text" class="form-control" id="firstName" 
                                 [(ngModel)]="profileForm.firstName" name="firstName">
                        </div>
                        <div class="mb-3">
                          <label for="lastName" class="form-label">Last Name</label>
                          <input type="text" class="form-control" id="lastName" 
                                 [(ngModel)]="profileForm.lastName" name="lastName">
                        </div>
                      }
                      <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control" id="email" 
                               [(ngModel)]="profileForm.email" name="email">
                      </div>
                      <div class="mb-3">
                        <label for="phone" class="form-label">Phone Number</label>
                        <input type="tel" class="form-control" id="phone" 
                               [(ngModel)]="profileForm.phone" name="phone">
                      </div>
                      <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                        <button type="button" class="btn btn-outline-secondary" (click)="cancelProfileEdit()">
                          Cancel
                        </button>
                      </div>
                    </form>
                  } @else {
                    <dl class="mb-0">
                      @if (customer.type === 'business') {
                        <dt>Business Name</dt>
                        <dd class="text-muted">{{ customer.businessName }}</dd>
                      } @else {
                        <dt>Name</dt>
                        <dd class="text-muted">{{ customer.firstName }} {{ customer.lastName }}</dd>
                      }
                      <dt>Email</dt>
                      <dd class="text-muted">{{ profileForm.email }}</dd>
                      <dt>Phone</dt>
                      <dd class="text-muted">{{ profileForm.phone || 'Not provided' }}</dd>
                      <dt>Username</dt>
                      <dd class="text-muted">{{ authService.userProfile()?.preferredUsername }}</dd>
                      <dt>Customer ID</dt>
                      <dd class="text-muted">{{ customer.customerId }}</dd>
                    </dl>
                  }
                </div>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">Mailing Address</h5>
                  @if (!editingMailing()) {
                    <button class="btn btn-sm btn-outline-primary" (click)="editingMailing.set(true)">
                      Edit
                    </button>
                  }
                </div>
                <div class="card-body">
                  @if (editingMailing()) {
                    <form (ngSubmit)="saveMailing()">
                      <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="sameAsService" 
                               [(ngModel)]="mailingForm.sameAsService" name="sameAsService"
                               (change)="onSameAsServiceChange()">
                        <label class="form-check-label" for="sameAsService">
                          Same as primary premise
                        </label>
                      </div>
                      @if (!mailingForm.sameAsService) {
                        <div class="mb-3">
                          <label for="mailingStreet" class="form-label">Street Address</label>
                          <input type="text" class="form-control" id="mailingStreet" 
                                 [(ngModel)]="mailingForm.street" name="mailingStreet">
                        </div>
                        <div class="mb-3">
                          <label for="mailingUnit" class="form-label">Apt/Unit (Optional)</label>
                          <input type="text" class="form-control" id="mailingUnit" 
                                 [(ngModel)]="mailingForm.unit" name="mailingUnit">
                        </div>
                        <div class="row mb-3">
                          <div class="col-md-6">
                            <label for="mailingCity" class="form-label">City</label>
                            <input type="text" class="form-control" id="mailingCity" 
                                   [(ngModel)]="mailingForm.city" name="mailingCity">
                          </div>
                          <div class="col-md-3">
                            <label for="mailingState" class="form-label">State</label>
                            <input type="text" class="form-control" id="mailingState" 
                                   [(ngModel)]="mailingForm.state" name="mailingState">
                          </div>
                          <div class="col-md-3">
                            <label for="mailingZip" class="form-label">ZIP</label>
                            <input type="text" class="form-control" id="mailingZip" 
                                   [(ngModel)]="mailingForm.zip" name="mailingZip">
                          </div>
                        </div>
                      }
                      <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                        <button type="button" class="btn btn-outline-secondary" (click)="cancelMailingEdit()">
                          Cancel
                        </button>
                      </div>
                    </form>
                  } @else {
                    @if (mailingForm.sameAsService) {
                      <p class="text-muted mb-0">Same as primary premise</p>
                    } @else {
                      <dl class="mb-0">
                        <dt>Street</dt>
                        <dd class="text-muted">
                          {{ mailingForm.street }}
                          @if (mailingForm.unit) {
                            , {{ mailingForm.unit }}
                          }
                        </dd>
                        <dt>City, State ZIP</dt>
                        <dd class="text-muted">{{ mailingForm.city }}, {{ mailingForm.state }} {{ mailingForm.zip }}</dd>
                      </dl>
                    }
                  }
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Preferences Tab -->
        @if (activeTab() === 'preferences') {
          <div class="row g-4">
            <div class="col-lg-6">
              <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">Communication Preferences</h5>
                  @if (!editingPreferences()) {
                    <button class="btn btn-sm btn-outline-primary" (click)="editingPreferences.set(true)">
                      Edit
                    </button>
                  }
                </div>
                <div class="card-body">
                  @if (editingPreferences()) {
                    <form (ngSubmit)="savePreferences()">
                      <div class="mb-3">
                        <label class="form-label">Bill Delivery Method</label>
                        <div class="form-check">
                          <input class="form-check-input" type="radio" name="billDelivery" 
                                 id="billEmail" value="email" [(ngModel)]="preferencesForm.billDelivery">
                          <label class="form-check-label" for="billEmail">Email (Paperless)</label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="radio" name="billDelivery" 
                                 id="billMail" value="mail" [(ngModel)]="preferencesForm.billDelivery">
                          <label class="form-check-label" for="billMail">Mail</label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="radio" name="billDelivery" 
                                 id="billBoth" value="both" [(ngModel)]="preferencesForm.billDelivery">
                          <label class="form-check-label" for="billBoth">Both Email and Mail</label>
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Notification Preferences</label>
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="notifyBillReady" 
                                 [(ngModel)]="preferencesForm.notifyBillReady" name="notifyBillReady">
                          <label class="form-check-label" for="notifyBillReady">Bill ready notifications</label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="notifyPaymentDue" 
                                 [(ngModel)]="preferencesForm.notifyPaymentDue" name="notifyPaymentDue">
                          <label class="form-check-label" for="notifyPaymentDue">Payment due reminders</label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="notifyOutage" 
                                 [(ngModel)]="preferencesForm.notifyOutage" name="notifyOutage">
                          <label class="form-check-label" for="notifyOutage">Outage alerts</label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="notifyUsage" 
                                 [(ngModel)]="preferencesForm.notifyUsage" name="notifyUsage">
                          <label class="form-check-label" for="notifyUsage">High usage alerts</label>
                        </div>
                      </div>
                      <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                        <button type="button" class="btn btn-outline-secondary" (click)="cancelPreferencesEdit()">
                          Cancel
                        </button>
                      </div>
                    </form>
                  } @else {
                    <dl class="mb-0">
                      <dt>Bill Delivery</dt>
                      <dd class="text-muted">{{ getBillDeliveryLabel() }}</dd>
                      <dt>Notifications</dt>
                      <dd class="text-muted mb-0">
                        <ul class="list-unstyled mb-0">
                          @if (preferencesForm.notifyBillReady) {
                            <li><span class="badge bg-success me-1">On</span> Bill ready</li>
                          }
                          @if (preferencesForm.notifyPaymentDue) {
                            <li><span class="badge bg-success me-1">On</span> Payment reminders</li>
                          }
                          @if (preferencesForm.notifyOutage) {
                            <li><span class="badge bg-success me-1">On</span> Outage alerts</li>
                          }
                          @if (preferencesForm.notifyUsage) {
                            <li><span class="badge bg-success me-1">On</span> High usage alerts</li>
                          }
                          @if (!preferencesForm.notifyBillReady && !preferencesForm.notifyPaymentDue && 
                               !preferencesForm.notifyOutage && !preferencesForm.notifyUsage) {
                            <li class="text-muted">No notifications enabled</li>
                          }
                        </ul>
                      </dd>
                    </dl>
                  }
                </div>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="card h-100">
                <div class="card-header">
                  <h5 class="card-title mb-0">Auto Pay</h5>
                </div>
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 class="mb-1">Automatic Payments</h6>
                      <p class="text-muted mb-0">Automatically pay your bills when they're due</p>
                    </div>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="autoPay" 
                             [(ngModel)]="preferencesForm.autoPay" (change)="savePreferences()">
                    </div>
                  </div>
                  @if (preferencesForm.autoPay) {
                    <div class="alert alert-info mb-0">
                      <small>
                        <strong>Auto Pay is enabled.</strong> Your default payment method will be charged 
                        automatically when bills are due.
                      </small>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Security Tab -->
        @if (activeTab() === 'security') {
          <div class="row g-4">
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h5 class="card-title mb-0">Security Settings</h5>
                </div>
                <div class="card-body">
                  <div class="row align-items-center py-3 border-bottom">
                    <div class="col-md-8">
                      <h6>Password</h6>
                      <p class="text-muted mb-md-0">
                        Change your password to keep your account secure. We recommend using a strong, 
                        unique password that you don't use for other accounts.
                      </p>
                    </div>
                    <div class="col-md-4 text-md-end">
                      <button class="btn btn-outline-primary" (click)="changePassword()">
                        Change Password
                      </button>
                    </div>
                  </div>
                  <div class="row align-items-center py-3 border-bottom">
                    <div class="col-md-8">
                      <h6>Two-Factor Authentication</h6>
                      <p class="text-muted mb-md-0">
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </p>
                    </div>
                    <div class="col-md-4 text-md-end">
                      <button class="btn btn-outline-secondary" disabled>
                        Coming Soon
                      </button>
                    </div>
                  </div>
                  <div class="row align-items-center py-3">
                    <div class="col-md-8">
                      <h6>Login History</h6>
                      <p class="text-muted mb-md-0">
                        Review recent login activity for your account.
                      </p>
                    </div>
                    <div class="col-md-4 text-md-end">
                      <button class="btn btn-outline-secondary" disabled>
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      }

      <!-- Success Toast -->
      @if (showSuccessMessage()) {
        <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1050">
          <div class="toast show" role="alert">
            <div class="toast-header bg-success text-white">
              <strong class="me-auto">Success</strong>
              <button type="button" class="btn-close btn-close-white" (click)="showSuccessMessage.set(false)"></button>
            </div>
            <div class="toast-body">
              {{ successMessage() }}
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AccountPage {
  authService = inject(AuthService);
  customerService = inject(CustomerService);

  // Tab navigation
  activeTab = signal<'accounts' | 'profile' | 'preferences' | 'security'>('accounts');

  // Edit mode signals
  editingProfile = signal(false);
  editingMailing = signal(false);
  editingPreferences = signal(false);

  // Toast messages
  showSuccessMessage = signal(false);
  successMessage = signal('');

  // Form data
  profileForm = {
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '(555) 123-4567'
  };

  mailingForm = {
    sameAsService: true,
    street: '',
    unit: '',
    city: '',
    state: '',
    zip: ''
  };

  preferencesForm = {
    billDelivery: 'email' as 'email' | 'mail' | 'both',
    notifyBillReady: true,
    notifyPaymentDue: true,
    notifyOutage: true,
    notifyUsage: false,
    autoPay: false
  };

  // Backup data for cancel operations
  private profileBackup = { ...this.profileForm };
  private mailingBackup = { ...this.mailingForm };
  private preferencesBackup = { ...this.preferencesForm };

  constructor() {
    // Initialize profile from auth service and customer data
    const profile = this.authService.userProfile();
    const customer = this.customerService.customer();

    if (profile) {
      this.profileForm.email = profile.email || '';
    }
    if (customer) {
      this.profileForm.firstName = customer.firstName || '';
      this.profileForm.lastName = customer.lastName || '';
      this.profileForm.businessName = customer.businessName || '';
    }
    this.profileBackup = { ...this.profileForm };
  }

  // Helper methods
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-success';
      case 'inactive': return 'bg-secondary';
      case 'pending': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  getMeterTypeBadgeClass(type: string): string {
    switch (type) {
      case 'electric': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  getMeterTypeIcon(type: string): string {
    switch (type) {
      case 'electric': return '⚡';
      default: return '📊';
    }
  }

  getBillDeliveryLabel(): string {
    switch (this.preferencesForm.billDelivery) {
      case 'email': return 'Email (Paperless)';
      case 'mail': return 'Mail';
      case 'both': return 'Both Email and Mail';
      default: return '';
    }
  }

  // Action methods
  editAccount(account: Account): void {
    // In a real app, this would open a modal or navigate to an edit page
    alert(`Edit account: ${account.accountNumber}`);
  }

  editPremise(premise: Premise): void {
    // In a real app, this would open a modal or navigate to an edit page
    alert(`Edit premise: ${premise.street}`);
  }

  viewMeterDetails(meter: Meter): void {
    // In a real app, this would open a modal or navigate to meter details
    alert(`View meter: ${meter.meterNumber}\nType: ${meter.type}\nLast Reading: ${meter.lastReading} ${meter.unit}`);
  }

  // Profile methods
  saveProfile(): void {
    this.profileBackup = { ...this.profileForm };
    this.editingProfile.set(false);
    this.showSuccess('Profile information updated successfully.');
  }

  cancelProfileEdit(): void {
    this.profileForm = { ...this.profileBackup };
    this.editingProfile.set(false);
  }

  // Mailing address methods
  saveMailing(): void {
    this.mailingBackup = { ...this.mailingForm };
    this.editingMailing.set(false);
    this.showSuccess('Mailing address updated successfully.');
  }

  cancelMailingEdit(): void {
    this.mailingForm = { ...this.mailingBackup };
    this.editingMailing.set(false);
  }

  onSameAsServiceChange(): void {
    if (this.mailingForm.sameAsService) {
      this.mailingForm.street = '';
      this.mailingForm.unit = '';
      this.mailingForm.city = '';
      this.mailingForm.state = '';
      this.mailingForm.zip = '';
    }
  }

  // Preferences methods
  savePreferences(): void {
    this.preferencesBackup = { ...this.preferencesForm };
    this.editingPreferences.set(false);
    this.showSuccess('Preferences updated successfully.');
  }

  cancelPreferencesEdit(): void {
    this.preferencesForm = { ...this.preferencesBackup };
    this.editingPreferences.set(false);
  }

  // Security methods
  changePassword(): void {
    // In a real app, this would redirect to the identity provider's password change page
    alert('This would redirect to the password change page in Keycloak.');
  }

  // Toast helper
  private showSuccess(message: string): void {
    this.successMessage.set(message);
    this.showSuccessMessage.set(true);
    setTimeout(() => this.showSuccessMessage.set(false), 3000);
  }
}
