import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

interface EnrollmentData {
  customerType: string;
  customerName: string;
  email: string;
  phone: string;
  serviceAddress: {
    street: string;
    unit?: string;
    city: string;
    state: string;
    zip: string;
  };
  plan: {
    name: string;
    ratePerKwh: number;
    termMonths: number;
    baseCharge: number;
    renewablePercent: number;
    earlyTerminationFee: number;
  };
  contract: {
    startDate: string;
    endDate: string;
  };
  meters: Array<{
    meterNumber: string;
  }>;
  preferences: {
    billDelivery: string;
  };
  confirmationNumber: string;
  submittedAt: string;
}

@Component({
  selector: 'app-enrollment-confirmation',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  styles: [`
    @media print {
      .btn, a.btn { display: none !important; }
      .card { break-inside: avoid; }
      .card-header { background-color: #f8f9fa !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .bg-success, .bg-primary, .bg-secondary, .bg-info { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .badge { border: 1px solid #ccc; }
    }
  `],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          
          @if (enrollment()) {
            <!-- Success Header -->
            <div class="text-center mb-5">
              <div class="mb-4">
                <div class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                </div>
              </div>
              <h1 class="display-5 mb-3">Enrollment Complete!</h1>
              <p class="lead text-muted">Thank you for choosing us as your electricity provider.</p>
              <div class="alert alert-light d-inline-block">
                <strong>Confirmation Number:</strong> 
                <span class="font-monospace text-primary">{{ enrollment()!.confirmationNumber }}</span>
              </div>
            </div>

            <!-- Summary Cards -->
            <div class="row g-4 mb-4">
              
              <!-- Customer Info -->
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="me-2" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
                      </svg>
                      Customer Information
                    </h6>
                  </div>
                  <div class="card-body">
                    <p class="mb-1"><strong>{{ enrollment()!.customerName }}</strong></p>
                    <p class="mb-1 text-muted small">{{ enrollment()!.customerType === 'individual' ? 'Residential' : 'Business' }} Customer</p>
                    <hr class="my-2">
                    <p class="mb-1 small">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="me-1" viewBox="0 0 16 16">
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                      </svg>
                      {{ enrollment()!.email }}
                    </p>
                    <p class="mb-0 small">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="me-1" viewBox="0 0 16 16">
                        <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                      </svg>
                      {{ enrollment()!.phone }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Service Address -->
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="me-2" viewBox="0 0 16 16">
                        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
                      </svg>
                      Service Address
                    </h6>
                  </div>
                  <div class="card-body">
                    <p class="mb-1">
                      {{ enrollment()!.serviceAddress.street }}
                      @if (enrollment()!.serviceAddress.unit) {
                        , {{ enrollment()!.serviceAddress.unit }}
                      }
                    </p>
                    <p class="mb-3">
                      {{ enrollment()!.serviceAddress.city }}, {{ enrollment()!.serviceAddress.state }} {{ enrollment()!.serviceAddress.zip }}
                    </p>
                    <hr class="my-2">
                    <p class="mb-1 small text-muted">Meters Enrolled:</p>
                    @for (meter of enrollment()!.meters; track meter.meterNumber) {
                      <span class="badge bg-secondary me-1">{{ meter.meterNumber }}</span>
                    }
                  </div>
                </div>
              </div>

              <!-- Plan Details -->
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="me-2" viewBox="0 0 16 16">
                        <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9H5.5Zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005Zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518l.087.02Z"/>
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14Zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16Z"/>
                      </svg>
                      Your Plan
                    </h6>
                  </div>
                  <div class="card-body">
                    <h5 class="mb-1">{{ enrollment()!.plan.name }}</h5>
                    <div class="d-flex flex-wrap gap-2 mb-3">
                      <span class="badge bg-primary">{{ enrollment()!.plan.ratePerKwh }}¢/kWh</span>
                      <span class="badge bg-secondary">{{ enrollment()!.plan.termMonths }} months</span>
                      @if (enrollment()!.plan.renewablePercent === 100) {
                        <span class="badge bg-success">100% Renewable</span>
                      } @else if (enrollment()!.plan.renewablePercent > 0) {
                        <span class="badge bg-info">{{ enrollment()!.plan.renewablePercent }}% Renewable</span>
                      }
                    </div>
                    <table class="table table-sm table-borderless mb-0 small">
                      <tr>
                        <td class="text-muted ps-0">Base Charge:</td>
                        <td class="text-end pe-0">{{ enrollment()!.plan.baseCharge | currency }}/mo</td>
                      </tr>
                      @if (enrollment()!.plan.earlyTerminationFee > 0) {
                        <tr>
                          <td class="text-muted ps-0">Early Termination Fee:</td>
                          <td class="text-end pe-0">{{ enrollment()!.plan.earlyTerminationFee | currency }}</td>
                        </tr>
                      }
                    </table>
                  </div>
                </div>
              </div>

              <!-- Contract Details -->
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="me-2" viewBox="0 0 16 16">
                        <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                        <path d="M4.5 12.5A.5.5 0 0 1 5 12h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0-2A.5.5 0 0 1 5 10h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm1.639-3.708 1.33.886 1.854-1.855a.25.25 0 0 1 .289-.047l1.888.974V8.5a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V8s1.54-1.274 1.639-1.208zM6.25 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"/>
                      </svg>
                      Contract Details
                    </h6>
                  </div>
                  <div class="card-body">
                    <div class="row text-center mb-3">
                      <div class="col-6">
                        <small class="text-muted d-block">Start Date</small>
                        <strong>{{ formatDate(enrollment()!.contract.startDate) }}</strong>
                      </div>
                      <div class="col-6">
                        <small class="text-muted d-block">End Date</small>
                        <strong>{{ formatDate(enrollment()!.contract.endDate) }}</strong>
                      </div>
                    </div>
                    <hr class="my-2">
                    <p class="mb-1 small text-muted">Bill Delivery:</p>
                    <p class="mb-0">
                      @switch (enrollment()!.preferences.billDelivery) {
                        @case ('email') { Email (Paperless) }
                        @case ('mail') { Mail }
                        @case ('both') { Email and Mail }
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- What's Next -->
            <div class="card border-primary mb-4">
              <div class="card-header bg-primary text-white">
                <h6 class="mb-0">What Happens Next?</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4 mb-3 mb-md-0">
                    <div class="d-flex">
                      <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style="width: 32px; height: 32px; min-width: 32px;">1</div>
                      <div>
                        <strong>Confirmation Email</strong>
                        <p class="small text-muted mb-0">Check your inbox for enrollment confirmation and next steps.</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3 mb-md-0">
                    <div class="d-flex">
                      <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style="width: 32px; height: 32px; min-width: 32px;">2</div>
                      <div>
                        <strong>Service Activation</strong>
                        <p class="small text-muted mb-0">Your service will begin on {{ formatDate(enrollment()!.contract.startDate) }}.</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="d-flex">
                      <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style="width: 32px; height: 32px; min-width: 32px;">3</div>
                      <div>
                        <strong>First Bill</strong>
                        <p class="small text-muted mb-0">Your first bill will arrive after your first full billing cycle.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <button class="btn btn-outline-secondary" (click)="printSummary()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="me-1" viewBox="0 0 16 16">
                  <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                  <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
                </svg>
                Print Summary
              </button>
              <a routerLink="/login" class="btn btn-primary">
                Sign In to Your Account
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="ms-1" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                </svg>
              </a>
            </div>

            <!-- Help -->
            <div class="text-center mt-5">
              <p class="text-muted small">
                Questions? Call us at <a href="tel:1-800-555-0123">1-800-555-0123</a> or email 
                <a href="mailto:support@example.com">support&#64;example.com</a>
              </p>
            </div>

          } @else {
            <!-- No Data State -->
            <div class="text-center py-5">
              <h2>No Enrollment Data</h2>
              <p class="text-muted">It looks like you haven't completed an enrollment yet.</p>
              <a routerLink="/signup" class="btn btn-primary">Start Enrollment</a>
            </div>
          }

        </div>
      </div>
    </div>
  `
})
export class EnrollmentConfirmationPage implements OnInit {
  private router = inject(Router);
  
  enrollment = signal<EnrollmentData | null>(null);

  ngOnInit(): void {
    // Get enrollment data from router state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as EnrollmentData;
    
    if (state) {
      this.enrollment.set(state);
    } else {
      // Try to get from history state (for page refresh)
      const historyState = history.state as EnrollmentData;
      if (historyState?.confirmationNumber) {
        this.enrollment.set(historyState);
      }
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  printSummary(): void {
    window.print();
  }
}
