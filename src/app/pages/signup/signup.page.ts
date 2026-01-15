import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { CustomerType } from '../../models/customer.model';

interface AvailableMeter {
  meterId: number;
  meterNumber: string;
  type: 'electric';
  status: string;
  selected: boolean;
}

interface Plan {
  planId: number;
  name: string;
  description: string;
  ratePerKwh: number;
  termMonths: number;
  earlyTerminationFee: number;
  baseCharge: number;
  renewablePercent: number;
  planType: 'fixed' | 'variable' | 'indexed';
  features: string[];
  eflUrl: string;
  tosUrl: string;
  yracUrl: string;
}

interface SignupForm {
  // Step 1: Customer Type
  customerType: CustomerType | null;

  // Step 2: Contact Information
  firstName: string;
  lastName: string;
  businessName: string;
  businessType: string;
  taxId: string;
  email: string;
  phone: string;
  contactFirstName: string;
  contactLastName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;

  // Step 3: Service Address (Premise)
  serviceStreet: string;
  serviceUnit: string;
  serviceCity: string;
  serviceState: string;
  serviceZip: string;
  serviceStartDate: string;

  // Step 4: Plan Selection
  selectedPlanId: number | null;

  // Step 5: Meter Selection
  selectedMeterIds: number[];

  // Step 6: Mailing Address
  mailingIsSameAsService: boolean;
  mailingStreet: string;
  mailingUnit: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;

  // Step 7: Account Preferences
  billDelivery: 'email' | 'mail' | 'both';
  paperlessBilling: boolean;
  marketingOptIn: boolean;
  acceptTerms: boolean;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe, DecimalPipe],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Header -->
          <div class="text-center mb-4">
            <h1 class="display-6">Start Your Service</h1>
            <p class="text-muted">Complete the enrollment form to begin your electricity service</p>
          </div>

          <!-- Progress Steps -->
          <div class="mb-4">
            <div class="d-flex justify-content-between position-relative">
              @for (step of steps; track step.number) {
                <div class="text-center" style="z-index: 1;">
                  <div 
                    class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                    [class.bg-primary]="currentStep() >= step.number"
                    [class.text-white]="currentStep() >= step.number"
                    [class.bg-light]="currentStep() < step.number"
                    [class.border]="currentStep() < step.number"
                    style="width: 36px; height: 36px; font-size: 0.875rem;">
                    @if (currentStep() > step.number) {
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                      </svg>
                    } @else {
                      {{ step.number }}
                    }
                  </div>
                  <small class="d-none d-lg-block" [class.text-primary]="currentStep() >= step.number" [class.text-muted]="currentStep() < step.number" style="font-size: 0.7rem;">
                    {{ step.label }}
                  </small>
                </div>
              }
              <!-- Progress line -->
              <div class="position-absolute" style="top: 18px; left: 7%; right: 7%; height: 2px; z-index: 0;">
                <div class="bg-light h-100 w-100"></div>
                <div class="bg-primary h-100 position-absolute top-0 start-0 transition-all"
                     [style.width.%]="progressWidth()"></div>
              </div>
            </div>
          </div>

          <!-- Form Card -->
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <form (ngSubmit)="handleSubmit()">
                
                <!-- Step 1: Customer Type -->
                @if (currentStep() === 1) {
                  <h4 class="mb-4">What type of customer are you?</h4>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="card h-100 cursor-pointer"
                           [class.border-primary]="form.customerType === 'individual'"
                           [class.border-2]="form.customerType === 'individual'"
                           (click)="form.customerType = 'individual'">
                        <div class="card-body text-center py-4">
                          <div class="mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="text-primary" viewBox="0 0 16 16">
                              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
                            </svg>
                          </div>
                          <h5 class="card-title">Individual / Residential</h5>
                          <p class="card-text text-muted small">For homeowners and renters setting up personal electricity service</p>
                          <div class="form-check d-flex justify-content-center">
                            <input class="form-check-input" type="radio" name="customerType" 
                                   [(ngModel)]="form.customerType" value="individual">
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card h-100 cursor-pointer"
                           [class.border-primary]="form.customerType === 'business'"
                           [class.border-2]="form.customerType === 'business'"
                           (click)="form.customerType = 'business'">
                        <div class="card-body text-center py-4">
                          <div class="mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="text-primary" viewBox="0 0 16 16">
                              <path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-6 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm-6 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Z"/>
                              <path d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V1Zm11 0H3v14h10V1Z"/>
                            </svg>
                          </div>
                          <h5 class="card-title">Business / Commercial</h5>
                          <p class="card-text text-muted small">For businesses, organizations, and commercial properties</p>
                          <div class="form-check d-flex justify-content-center">
                            <input class="form-check-input" type="radio" name="customerType" 
                                   [(ngModel)]="form.customerType" value="business">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- Step 2: Contact Information -->
                @if (currentStep() === 2) {
                  @if (form.customerType === 'individual') {
                    <h4 class="mb-4">Your Information</h4>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label for="firstName" class="form-label">First Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="firstName" [(ngModel)]="form.firstName" name="firstName" required>
                      </div>
                      <div class="col-md-6">
                        <label for="lastName" class="form-label">Last Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="lastName" [(ngModel)]="form.lastName" name="lastName" required>
                      </div>
                      <div class="col-md-6">
                        <label for="email" class="form-label">Email Address <span class="text-danger">*</span></label>
                        <input type="email" class="form-control" id="email" [(ngModel)]="form.email" name="email" required>
                        <div class="form-text">We'll use this to create your account</div>
                      </div>
                      <div class="col-md-6">
                        <label for="phone" class="form-label">Phone Number <span class="text-danger">*</span></label>
                        <input type="tel" class="form-control" id="phone" [(ngModel)]="form.phone" name="phone" placeholder="(555) 555-5555" required>
                      </div>
                    </div>
                  } @else {
                    <h4 class="mb-4">Business Information</h4>
                    <div class="row g-3">
                      <div class="col-12">
                        <label for="businessName" class="form-label">Legal Business Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="businessName" [(ngModel)]="form.businessName" name="businessName" required>
                      </div>
                      <div class="col-md-6">
                        <label for="businessType" class="form-label">Business Type <span class="text-danger">*</span></label>
                        <select class="form-select" id="businessType" [(ngModel)]="form.businessType" name="businessType" required>
                          <option value="">Select business type...</option>
                          <option value="sole_proprietorship">Sole Proprietorship</option>
                          <option value="partnership">Partnership</option>
                          <option value="llc">LLC</option>
                          <option value="corporation">Corporation</option>
                          <option value="nonprofit">Non-Profit Organization</option>
                          <option value="government">Government Agency</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div class="col-md-6">
                        <label for="taxId" class="form-label">Tax ID / EIN <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="taxId" [(ngModel)]="form.taxId" name="taxId" placeholder="XX-XXXXXXX" required>
                      </div>
                      <div class="col-md-6">
                        <label for="bizEmail" class="form-label">Business Email <span class="text-danger">*</span></label>
                        <input type="email" class="form-control" id="bizEmail" [(ngModel)]="form.email" name="bizEmail" required>
                      </div>
                      <div class="col-md-6">
                        <label for="bizPhone" class="form-label">Business Phone <span class="text-danger">*</span></label>
                        <input type="tel" class="form-control" id="bizPhone" [(ngModel)]="form.phone" name="bizPhone" placeholder="(555) 555-5555" required>
                      </div>
                      <div class="col-12"><hr class="my-3"><h5 class="mb-3">Primary Contact Person</h5></div>
                      <div class="col-md-6">
                        <label for="contactFirstName" class="form-label">First Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="contactFirstName" [(ngModel)]="form.contactFirstName" name="contactFirstName" required>
                      </div>
                      <div class="col-md-6">
                        <label for="contactLastName" class="form-label">Last Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="contactLastName" [(ngModel)]="form.contactLastName" name="contactLastName" required>
                      </div>
                      <div class="col-md-4">
                        <label for="contactTitle" class="form-label">Title</label>
                        <input type="text" class="form-control" id="contactTitle" [(ngModel)]="form.contactTitle" name="contactTitle" placeholder="e.g. Office Manager">
                      </div>
                      <div class="col-md-4">
                        <label for="contactEmail" class="form-label">Email <span class="text-danger">*</span></label>
                        <input type="email" class="form-control" id="contactEmail" [(ngModel)]="form.contactEmail" name="contactEmail" required>
                      </div>
                      <div class="col-md-4">
                        <label for="contactPhone" class="form-label">Phone <span class="text-danger">*</span></label>
                        <input type="tel" class="form-control" id="contactPhone" [(ngModel)]="form.contactPhone" name="contactPhone" required>
                      </div>
                    </div>
                  }
                }

                <!-- Step 3: Service Address -->
                @if (currentStep() === 3) {
                  <h4 class="mb-4">Service Address</h4>
                  <p class="text-muted mb-4">Enter the address where you need electricity service</p>
                  <div class="row g-3">
                    <div class="col-12">
                      <label for="serviceStreet" class="form-label">Street Address <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="serviceStreet" [(ngModel)]="form.serviceStreet" name="serviceStreet" placeholder="123 Main Street" required>
                    </div>
                    <div class="col-md-4">
                      <label for="serviceUnit" class="form-label">Apt / Suite / Unit</label>
                      <input type="text" class="form-control" id="serviceUnit" [(ngModel)]="form.serviceUnit" name="serviceUnit" placeholder="Optional">
                    </div>
                    <div class="col-md-8">
                      <label for="serviceCity" class="form-label">City <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="serviceCity" [(ngModel)]="form.serviceCity" name="serviceCity" required>
                    </div>
                    <div class="col-md-6">
                      <label for="serviceState" class="form-label">State <span class="text-danger">*</span></label>
                      <select class="form-select" id="serviceState" [(ngModel)]="form.serviceState" name="serviceState" required>
                        <option value="">Select state...</option>
                        <option value="TX">Texas</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label for="serviceZip" class="form-label">ZIP Code <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="serviceZip" [(ngModel)]="form.serviceZip" name="serviceZip" pattern="[0-9]{5}" maxlength="5" required>
                    </div>
                    
                    <div class="col-12"><hr class="my-2"></div>
                    
                    <div class="col-md-6">
                      <label for="serviceStartDate" class="form-label">Requested Start Date <span class="text-danger">*</span></label>
                      <input type="date" class="form-control" id="serviceStartDate" 
                             [(ngModel)]="form.serviceStartDate" name="serviceStartDate" 
                             [min]="minStartDate" required>
                      <div class="form-text">When would you like your service to begin?</div>
                    </div>
                    <div class="col-md-6 d-flex align-items-end">
                      <div class="alert alert-info mb-0 w-100 py-2">
                        <small>
                          <strong>Note:</strong> Service typically starts within 1-3 business days of your requested date. 
                          We'll confirm your actual start date via email.
                        </small>
                      </div>
                    </div>
                  </div>
                }

                <!-- Step 4: Plan Selection -->
                @if (currentStep() === 4) {
                  <h4 class="mb-4">Choose Your Plan</h4>
                  
                  @if (isLoadingPlans()) {
                    <div class="text-center py-5">
                      <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <p class="text-muted">Finding plans available at your address...</p>
                    </div>
                  } @else if (availablePlans().length === 0) {
                    <div class="alert alert-warning">
                      <h5 class="alert-heading">No Plans Available</h5>
                      <p class="mb-0">We couldn't find any plans for your area. Please contact customer service at <a href="tel:1-800-555-0123">1-800-555-0123</a>.</p>
                    </div>
                  } @else {
                    <p class="text-muted mb-4">Select a plan that works best for you. All plans include TDSP delivery charges.</p>
                    
                    <div class="row g-3">
                      @for (plan of availablePlans(); track plan.planId) {
                        <div class="col-12">
                          <div class="card cursor-pointer plan-card"
                               [class.plan-selected]="form.selectedPlanId === plan.planId"
                               (click)="selectPlan(plan.planId)">
                            <div class="card-body">
                              <div class="row align-items-center">
                                <div class="col-md-7">
                                  <div class="d-flex align-items-start">
                                    <input class="form-check-input me-3 mt-1" type="radio" 
                                           name="selectedPlan" [value]="plan.planId"
                                           [checked]="form.selectedPlanId === plan.planId"
                                           (click)="$event.stopPropagation()">
                                    <div>
                                      <h5 class="mb-1">
                                        {{ plan.name }}
                                        @if (plan.renewablePercent === 100) {
                                          <span class="badge bg-success ms-2">100% Renewable</span>
                                        } @else if (plan.renewablePercent > 0) {
                                          <span class="badge bg-info ms-2">{{ plan.renewablePercent }}% Renewable</span>
                                        }
                                      </h5>
                                      <p class="text-muted mb-2 small">{{ plan.description }}</p>
                                      <div class="d-flex flex-wrap gap-2">
                                        @for (feature of plan.features; track feature) {
                                          <span class="badge bg-light text-dark">{{ feature }}</span>
                                        }
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="col-md-5 text-md-end mt-3 mt-md-0">
                                  <div class="d-flex flex-column align-items-md-end">
                                    <div class="mb-2">
                                      <span class="h3 mb-0 text-primary">{{ plan.ratePerKwh | number:'1.1-1' }}¢</span>
                                      <span class="text-muted">/kWh</span>
                                    </div>
                                    <div class="small text-muted">
                                      <span class="me-3">{{ plan.termMonths }} month term</span>
                                      <span>{{ plan.baseCharge | currency }}/mo base</span>
                                    </div>
                                    <div class="mt-2">
                                      <a [href]="plan.eflUrl" target="_blank" class="small me-2" (click)="$event.stopPropagation()">EFL</a>
                                      <a [href]="plan.tosUrl" target="_blank" class="small me-2" (click)="$event.stopPropagation()">TOS</a>
                                      <a [href]="plan.yracUrl" target="_blank" class="small" (click)="$event.stopPropagation()">YRAC</a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              @if (plan.earlyTerminationFee > 0) {
                                <div class="mt-3 pt-3 border-top small text-muted">
                                  Early termination fee: {{ plan.earlyTerminationFee | currency }} if cancelled before term ends
                                </div>
                              }
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  }
                }

                <!-- Step 5: Meter Selection -->
                @if (currentStep() === 5) {
                  <h4 class="mb-4">Select Meter(s)</h4>
                  
                  @if (isLoadingMeters()) {
                    <div class="text-center py-5">
                      <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <p class="text-muted">Searching for meters at this address...</p>
                    </div>
                  } @else if (availableMeters().length === 0) {
                    <div class="alert alert-warning">
                      <h5 class="alert-heading">No Meters Found</h5>
                      <p class="mb-0">We couldn't find any meters at this address. Please verify your address or contact customer service at <a href="tel:1-800-555-0123">1-800-555-0123</a>.</p>
                    </div>
                  } @else {
                    <p class="text-muted mb-4">We found {{ availableMeters().length }} meter(s) at this address. Select the meter(s) you want to enroll for service.</p>
                    
                    <div class="alert alert-light mb-4">
                      <strong>Service Address:</strong><br>
                      {{ form.serviceStreet }}@if (form.serviceUnit) {, {{ form.serviceUnit }}}<br>
                      {{ form.serviceCity }}, {{ form.serviceState }} {{ form.serviceZip }}
                    </div>

                    <div class="list-group">
                      @for (meter of availableMeters(); track meter.meterId; let i = $index) {
                        <div class="list-group-item d-flex align-items-center cursor-pointer meter-item"
                             [class.meter-selected]="meter.selected"
                             (click)="toggleMeterSelection(i)">
                          <input class="form-check-input me-3" type="checkbox"
                                 [checked]="meter.selected"
                                 (click)="$event.stopPropagation(); toggleMeterSelection(i)">
                          <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>Meter #{{ meter.meterNumber }}</strong>
                                <span class="badge bg-warning text-dark ms-2">Electric</span>
                              </div>
                              <span class="badge" [class.bg-success]="meter.status === 'available'" [class.bg-secondary]="meter.status !== 'available'">
                                {{ meter.status === 'available' ? 'Available' : meter.status }}
                              </span>
                            </div>
                            <small class="text-muted">Meter ID: {{ meter.meterId }}</small>
                          </div>
                        </div>
                      }
                    </div>

                    <div class="mt-3">
                      <small class="text-muted"><strong>{{ selectedMeterCount() }}</strong> meter(s) selected</small>
                    </div>
                  }
                }

                <!-- Step 6: Mailing Address -->
                @if (currentStep() === 6) {
                  <h4 class="mb-4">Mailing Address</h4>
                  <div class="form-check mb-4">
                    <input class="form-check-input" type="checkbox" id="mailingIsSameAsService"
                           [(ngModel)]="form.mailingIsSameAsService" name="mailingIsSameAsService">
                    <label class="form-check-label" for="mailingIsSameAsService">Same as service address</label>
                  </div>
                  
                  @if (!form.mailingIsSameAsService) {
                    <div class="row g-3">
                      <div class="col-12">
                        <label for="mailingStreet" class="form-label">Street Address <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="mailingStreet" [(ngModel)]="form.mailingStreet" name="mailingStreet" required>
                      </div>
                      <div class="col-md-4">
                        <label for="mailingUnit" class="form-label">Apt / Suite / Unit</label>
                        <input type="text" class="form-control" id="mailingUnit" [(ngModel)]="form.mailingUnit" name="mailingUnit">
                      </div>
                      <div class="col-md-8">
                        <label for="mailingCity" class="form-label">City <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="mailingCity" [(ngModel)]="form.mailingCity" name="mailingCity" required>
                      </div>
                      <div class="col-md-6">
                        <label for="mailingState" class="form-label">State <span class="text-danger">*</span></label>
                        <select class="form-select" id="mailingState" [(ngModel)]="form.mailingState" name="mailingState" required>
                          <option value="">Select state...</option>
                          <option value="TX">Texas</option>
                        </select>
                      </div>
                      <div class="col-md-6">
                        <label for="mailingZip" class="form-label">ZIP Code <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="mailingZip" [(ngModel)]="form.mailingZip" name="mailingZip" pattern="[0-9]{5}" maxlength="5" required>
                      </div>
                    </div>
                  } @else {
                    <div class="alert alert-light">
                      <strong>Mailing Address:</strong><br>
                      {{ form.serviceStreet }}@if (form.serviceUnit) {, {{ form.serviceUnit }}}<br>
                      {{ form.serviceCity }}, {{ form.serviceState }} {{ form.serviceZip }}
                    </div>
                  }
                }

                <!-- Step 7: Preferences & Terms -->
                @if (currentStep() === 7) {
                  <h4 class="mb-4">Preferences & Terms</h4>
                  
                  <div class="mb-4">
                    <h6>Bill Delivery Preference</h6>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="billDelivery" id="billEmail" value="email" [(ngModel)]="form.billDelivery">
                      <label class="form-check-label" for="billEmail">Email only (Paperless) <span class="badge bg-success ms-1">Recommended</span></label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="billDelivery" id="billMail" value="mail" [(ngModel)]="form.billDelivery">
                      <label class="form-check-label" for="billMail">Mail only</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="billDelivery" id="billBoth" value="both" [(ngModel)]="form.billDelivery">
                      <label class="form-check-label" for="billBoth">Both email and mail</label>
                    </div>
                  </div>

                  <div class="mb-4">
                    <h6>Communication Preferences</h6>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="marketingOptIn" [(ngModel)]="form.marketingOptIn" name="marketingOptIn">
                      <label class="form-check-label" for="marketingOptIn">Send me tips on saving energy and special offers</label>
                    </div>
                  </div>

                  <hr class="my-4">

                  <div class="mb-4">
                    <h6>Terms of Service</h6>
                    <div class="border rounded p-3 mb-3 bg-light" style="max-height: 200px; overflow-y: auto;">
                      <p class="small mb-2"><strong>Terms and Conditions</strong></p>
                      <p class="small text-muted">By enrolling for electricity service, you agree to the following terms and conditions:</p>
                      <ul class="small text-muted">
                        <li>You authorize us to provide electricity service to the address specified under your selected plan.</li>
                        <li>You agree to pay all charges for electricity service in a timely manner.</li>
                        <li>You understand that your rate is determined by your selected plan and may include energy charges, base charges, and TDSP delivery charges.</li>
                        <li>You have reviewed and agree to the Electricity Facts Label (EFL), Terms of Service (TOS), and Your Rights as a Customer (YRAC) documents for your selected plan.</li>
                        <li>Service is subject to availability in your area.</li>
                      </ul>
                      <p class="small text-muted mb-0">For complete terms, please review the plan documents linked in your enrollment summary.</p>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="acceptTerms" [(ngModel)]="form.acceptTerms" name="acceptTerms" required>
                      <label class="form-check-label" for="acceptTerms">
                        I have read and agree to the Terms of Service, EFL, and YRAC for my selected plan <span class="text-danger">*</span>
                      </label>
                    </div>
                  </div>

                  <!-- Summary -->
                  <div class="card bg-light mb-4">
                    <div class="card-header"><h6 class="mb-0">Enrollment Summary</h6></div>
                    <div class="card-body">
                      <div class="row mb-2">
                        <div class="col-md-6">
                          <strong>Customer:</strong><br>
                          <span class="text-muted">
                            @if (form.customerType === 'individual') {
                              {{ form.firstName }} {{ form.lastName }}
                            } @else {
                              {{ form.businessName }}
                            }
                          </span>
                        </div>
                        <div class="col-md-6">
                          <strong>Contact:</strong><br>
                          <span class="text-muted">{{ form.email }}<br>{{ form.phone }}</span>
                        </div>
                      </div>
                      <hr class="my-2">
                      <div class="row mb-2">
                        <div class="col-md-6">
                          <strong>Service Address:</strong><br>
                          <span class="text-muted">
                            {{ form.serviceStreet }}@if (form.serviceUnit) {, {{ form.serviceUnit }}}<br>
                            {{ form.serviceCity }}, {{ form.serviceState }} {{ form.serviceZip }}
                          </span>
                        </div>
                        <div class="col-md-6">
                          <strong>Selected Meters:</strong><br>
                          @for (meter of getSelectedMeters(); track meter.meterId) {
                            <span class="badge bg-secondary me-1">{{ meter.meterNumber }}</span>
                          }
                        </div>
                      </div>
                      <hr class="my-2">
                      @if (getSelectedPlan(); as plan) {
                        <div class="row mb-2">
                          <div class="col-12">
                            <strong>Selected Plan:</strong><br>
                            <span class="text-muted">{{ plan.name }}</span>
                            <span class="badge bg-primary ms-2">{{ plan.ratePerKwh }}¢/kWh</span>
                            <span class="badge bg-secondary ms-1">{{ plan.termMonths }} months</span>
                            @if (plan.renewablePercent === 100) {
                              <span class="badge bg-success ms-1">100% Renewable</span>
                            }
                            <div class="mt-1">
                              <a [href]="plan.eflUrl" target="_blank" class="small me-2">View EFL</a>
                              <a [href]="plan.tosUrl" target="_blank" class="small me-2">View TOS</a>
                              <a [href]="plan.yracUrl" target="_blank" class="small">View YRAC</a>
                            </div>
                          </div>
                        </div>
                        <hr class="my-2">
                        <div class="row">
                          <div class="col-12">
                            <strong>Contract Details:</strong>
                            <div class="row mt-2">
                              <div class="col-md-4">
                                <small class="text-muted">Start Date</small><br>
                                <span>{{ formatDate(form.serviceStartDate) }}</span>
                              </div>
                              <div class="col-md-4">
                                <small class="text-muted">End Date</small><br>
                                <span>{{ formatDate(getContractEndDate() || '') }}</span>
                              </div>
                              <div class="col-md-4">
                                <small class="text-muted">Term Length</small><br>
                                <span>{{ plan.termMonths }} month(s)</span>
                              </div>
                            </div>
                            @if (plan.earlyTerminationFee > 0) {
                              <div class="mt-2 small text-muted">
                                Early termination fee: {{ plan.earlyTerminationFee | currency }} if cancelled before {{ formatDate(getContractEndDate() || '') }}
                              </div>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Navigation Buttons -->
                <div class="d-flex justify-content-between mt-4 pt-3 border-top">
                  <button type="button" class="btn btn-outline-secondary" (click)="previousStep()" [disabled]="currentStep() === 1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="me-1" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                    </svg>
                    Back
                  </button>
                  
                  @if (currentStep() < totalSteps) {
                    <button type="button" class="btn btn-primary" (click)="nextStep()" [disabled]="!canProceed()">
                      Next
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="ms-1" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                      </svg>
                    </button>
                  } @else {
                    <button type="submit" class="btn btn-success" [disabled]="!canProceed() || isSubmitting()">
                      @if (isSubmitting()) {
                        <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                        Submitting...
                      } @else {
                        Complete Enrollment
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="ms-1" viewBox="0 0 16 16">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                        </svg>
                      }
                    </button>
                  }
                </div>
              </form>
            </div>
          </div>

          <!-- Help Text -->
          <div class="text-center mt-4">
            <p class="text-muted small">Already have an account? <a routerLink="/login">Sign in</a></p>
            <p class="text-muted small">Need help? Call us at <a href="tel:1-800-555-0123">1-800-555-0123</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer { cursor: pointer; }
    .transition-all { transition: width 0.3s ease; }
    .meter-item, .plan-card { 
      border-left: 3px solid transparent;
      transition: all 0.15s ease;
    }
    .meter-item:hover, .plan-card:hover { 
      background-color: #f8f9fa; 
    }
    .meter-item.meter-selected, .plan-card.plan-selected {
      border-left-color: #0d6efd;
      background-color: #e7f1ff;
    }
    .meter-item.meter-selected:hover, .plan-card.plan-selected:hover {
      background-color: #d0e4ff;
    }
  `]
})
export class SignupPage {
  private router = inject(Router);

  currentStep = signal(1);
  totalSteps = 7;
  isSubmitting = signal(false);
  isLoadingPlans = signal(false);
  isLoadingMeters = signal(false);
  availablePlans = signal<Plan[]>([]);
  availableMeters = signal<AvailableMeter[]>([]);
  
  // Minimum start date is tomorrow
  minStartDate = this.getMinStartDate();

  steps = [
    { number: 1, label: 'Type' },
    { number: 2, label: 'Contact' },
    { number: 3, label: 'Address' },
    { number: 4, label: 'Plan' },
    { number: 5, label: 'Meters' },
    { number: 6, label: 'Mailing' },
    { number: 7, label: 'Review' }
  ];

  form: SignupForm = {
    customerType: null,
    firstName: '',
    lastName: '',
    businessName: '',
    businessType: '',
    taxId: '',
    email: '',
    phone: '',
    contactFirstName: '',
    contactLastName: '',
    contactTitle: '',
    contactEmail: '',
    contactPhone: '',
    serviceStreet: '',
    serviceUnit: '',
    serviceCity: '',
    serviceState: '',
    serviceZip: '',
    serviceStartDate: this.getDefaultStartDate(),
    selectedPlanId: null,
    selectedMeterIds: [],
    mailingIsSameAsService: true,
    mailingStreet: '',
    mailingUnit: '',
    mailingCity: '',
    mailingState: '',
    mailingZip: '',
    billDelivery: 'email',
    paperlessBilling: true,
    marketingOptIn: false,
    acceptTerms: false
  };

  progressWidth = computed(() => ((this.currentStep() - 1) / (this.totalSteps - 1)) * 100);
  selectedMeterCount = computed(() => this.availableMeters().filter(m => m.selected).length);

  canProceed(): boolean {
    switch (this.currentStep()) {
      case 1:
        return this.form.customerType !== null;
      case 2:
        if (this.form.customerType === 'individual') {
          return !!(this.form.firstName && this.form.lastName && this.form.email && this.form.phone);
        } else {
          return !!(this.form.businessName && this.form.businessType && this.form.taxId && 
                    this.form.email && this.form.phone && this.form.contactFirstName &&
                    this.form.contactLastName && this.form.contactEmail && this.form.contactPhone);
        }
      case 3:
        return !!(this.form.serviceStreet && this.form.serviceCity && this.form.serviceState && this.form.serviceZip && this.form.serviceStartDate);
      case 4:
        return this.form.selectedPlanId !== null;
      case 5:
        return this.selectedMeterCount() > 0;
      case 6:
        if (this.form.mailingIsSameAsService) return true;
        return !!(this.form.mailingStreet && this.form.mailingCity && this.form.mailingState && this.form.mailingZip);
      case 7:
        return this.form.acceptTerms;
      default:
        return false;
    }
  }

  nextStep(): void {
    if (this.canProceed() && this.currentStep() < this.totalSteps) {
      const nextStepNum = this.currentStep() + 1;
      
      if (nextStepNum === 4) {
        this.loadAvailablePlans();
      } else if (nextStepNum === 5) {
        this.loadAvailableMeters();
      }
      
      this.currentStep.set(nextStepNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  loadAvailablePlans(): void {
    this.isLoadingPlans.set(true);
    
    setTimeout(() => {
      const mockPlans: Plan[] = [
        {
          planId: 1001,
          name: 'Green Energy 12',
          description: 'Lock in a competitive rate with 100% renewable energy from Texas wind farms.',
          ratePerKwh: 11.9,
          termMonths: 12,
          earlyTerminationFee: 150,
          baseCharge: 9.95,
          renewablePercent: 100,
          planType: 'fixed',
          features: ['100% Wind Energy', 'Fixed Rate', 'No Hidden Fees'],
          eflUrl: '#/efl/1001',
          tosUrl: '#/tos/1001',
          yracUrl: '#/yrac/1001'
        },
        {
          planId: 1002,
          name: 'Value Saver 24',
          description: 'Our best long-term value with a low fixed rate locked in for 2 years.',
          ratePerKwh: 10.5,
          termMonths: 24,
          earlyTerminationFee: 200,
          baseCharge: 4.95,
          renewablePercent: 15,
          planType: 'fixed',
          features: ['Lowest Rate', '24-Month Price Lock', 'Low Base Charge'],
          eflUrl: '#/efl/1002',
          tosUrl: '#/tos/1002',
          yracUrl: '#/yrac/1002'
        },
        {
          planId: 1003,
          name: 'Flex Power',
          description: 'Month-to-month flexibility with no long-term commitment required.',
          ratePerKwh: 13.2,
          termMonths: 1,
          earlyTerminationFee: 0,
          baseCharge: 0,
          renewablePercent: 10,
          planType: 'variable',
          features: ['No Contract', 'No Cancellation Fee', 'No Base Charge'],
          eflUrl: '#/efl/1003',
          tosUrl: '#/tos/1003',
          yracUrl: '#/yrac/1003'
        },
        {
          planId: 1004,
          name: 'Solar Plus 18',
          description: 'Premium plan powered by Texas solar with carbon offset credits included.',
          ratePerKwh: 12.4,
          termMonths: 18,
          earlyTerminationFee: 175,
          baseCharge: 9.95,
          renewablePercent: 100,
          planType: 'fixed',
          features: ['100% Solar', 'Carbon Offsets', 'Fixed Rate'],
          eflUrl: '#/efl/1004',
          tosUrl: '#/tos/1004',
          yracUrl: '#/yrac/1004'
        }
      ];

      this.availablePlans.set(mockPlans);
      this.isLoadingPlans.set(false);
    }, 1200);
  }

  loadAvailableMeters(): void {
    this.isLoadingMeters.set(true);
    
    setTimeout(() => {
      const mockMeters: AvailableMeter[] = [
        { meterId: 3001, meterNumber: 'E-12345678', type: 'electric', status: 'available', selected: false }
      ];

      if (this.form.customerType === 'business') {
        mockMeters.push(
          { meterId: 3002, meterNumber: 'E-23456789', type: 'electric', status: 'available', selected: false },
          { meterId: 3003, meterNumber: 'E-34567890', type: 'electric', status: 'available', selected: false }
        );
      }

      this.availableMeters.set(mockMeters);
      this.isLoadingMeters.set(false);
    }, 1500);
  }

  selectPlan(planId: number): void {
    this.form.selectedPlanId = planId;
  }

  getSelectedPlan(): Plan | undefined {
    return this.availablePlans().find(p => p.planId === this.form.selectedPlanId);
  }

  toggleMeterSelection(index: number): void {
    const meters = [...this.availableMeters()];
    meters[index] = { ...meters[index], selected: !meters[index].selected };
    this.availableMeters.set(meters);
    this.form.selectedMeterIds = meters.filter(m => m.selected).map(m => m.meterId);
  }

  getSelectedMeters(): AvailableMeter[] {
    return this.availableMeters().filter(m => m.selected);
  }

  handleSubmit(): void {
    if (!this.canProceed()) return;
    this.isSubmitting.set(true);

    // Simulate API call
    setTimeout(() => {
      const plan = this.getSelectedPlan()!;
      const selectedMeters = this.getSelectedMeters();
      
      // Build enrollment confirmation data
      const enrollmentData = {
        customerType: this.form.customerType,
        customerName: this.form.customerType === 'individual' 
          ? `${this.form.firstName} ${this.form.lastName}`
          : this.form.businessName,
        email: this.form.email,
        phone: this.form.phone,
        serviceAddress: {
          street: this.form.serviceStreet,
          unit: this.form.serviceUnit || undefined,
          city: this.form.serviceCity,
          state: this.form.serviceState,
          zip: this.form.serviceZip
        },
        plan: {
          name: plan.name,
          ratePerKwh: plan.ratePerKwh,
          termMonths: plan.termMonths,
          baseCharge: plan.baseCharge,
          renewablePercent: plan.renewablePercent,
          earlyTerminationFee: plan.earlyTerminationFee
        },
        contract: {
          startDate: this.form.serviceStartDate,
          endDate: this.getContractEndDate()!
        },
        meters: selectedMeters.map(m => ({ meterNumber: m.meterNumber })),
        preferences: {
          billDelivery: this.form.billDelivery
        },
        confirmationNumber: this.generateConfirmationNumber(),
        submittedAt: new Date().toISOString()
      };

      console.log('Enrollment submitted:', enrollmentData);
      this.isSubmitting.set(false);
      
      // Navigate to confirmation page with enrollment data
      this.router.navigate(['/signup/confirmation'], { 
        state: enrollmentData 
      });
    }, 2000);
  }

  private generateConfirmationNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ENR-${timestamp}-${random}`;
  }

  private getMinStartDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  private getDefaultStartDate(): string {
    // Default to 3 business days from now
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().split('T')[0];
  }

  getContractEndDate(): string | null {
    const plan = this.getSelectedPlan();
    if (!plan || !this.form.serviceStartDate) return null;
    
    const startDate = new Date(this.form.serviceStartDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.termMonths);
    return endDate.toISOString().split('T')[0];
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
