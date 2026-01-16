import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, tap, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Customer,
  Account,
  Premise,
  Meter,
  Plan,
  Contract,
  Bill,
  UsageSummary,
  CustomerSummary,
  MeterType,
  CustomerResponse,
  AccountResponse,
  AccountsResponse,
  PlansResponse,
  ContractsResponse,
  PlanResponse,
  ContractResponse
} from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private _customer = signal<Customer | null>(null);
  private _accounts = signal<Account[]>([]);
  private _plans = signal<Plan[]>([]);
  private _contracts = signal<Contract[]>([]);
  private _bills = signal<Bill[]>([]); // Bills not yet in backend
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  readonly customer = this._customer.asReadonly();
  readonly accounts = this._accounts.asReadonly();
  readonly plans = this._plans.asReadonly();
  readonly contracts = this._contracts.asReadonly();
  readonly bills = this._bills.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly isBusinessCustomer = computed(() => {
    const customer = this._customer();
    return customer?.type === 'BUSINESS';
  });

  readonly customerSummary = computed<CustomerSummary | null>(() => {
    const accounts = this._accounts();
    const bills = this._bills();
    if (accounts.length === 0) return null;

    const premises = accounts.flatMap(a => a.premises);
    const meters = premises.flatMap(p => p.meters);

    const unpaidBills = bills.filter(b => b.status === 'unpaid' || b.status === 'overdue');
    const nextDue = unpaidBills.length > 0
      ? unpaidBills.reduce((earliest, bill) =>
          bill.dueDate < earliest.dueDate ? bill : earliest
        )
      : null;

    // Aggregate usage by meter type
    const usageByType: { [key in MeterType]?: { usage: number; unit: string } } = {};
    for (const meter of meters) {
      if (meter.lastReading) {
        if (!usageByType[meter.type]) {
          usageByType[meter.type] = { usage: 0, unit: meter.unit };
        }
        usageByType[meter.type]!.usage += meter.lastReading;
      }
    }

    return {
      totalAccounts: accounts.length,
      totalPremises: premises.length,
      totalMeters: meters.length,
      totalCurrentBalance: accounts.reduce((sum, a) => sum + a.currentBalance, 0),
      totalDueAmount: unpaidBills.reduce((sum, b) => sum + b.amount, 0),
      nextDueDate: nextDue?.dueDate,
      totalUsageThisPeriod: usageByType
    };
  });

  readonly usageSummaries = computed<UsageSummary[]>(() => {
    const accounts = this._accounts();
    if (accounts.length === 0) return [];

    const summaries: UsageSummary[] = [];
    for (const account of accounts) {
      for (const premise of account.premises) {
        const addressStr = `${premise.street}${premise.unit ? ' ' + premise.unit : ''}, ${premise.city}`;
        for (const meter of premise.meters) {
          if (meter.lastReading) {
            // Mock previous period as 90-110% of current
            const variance = 0.9 + Math.random() * 0.2;
            const previousUsage = Math.round(meter.lastReading * variance);
            const percentChange = ((meter.lastReading - previousUsage) / previousUsage) * 100;

            summaries.push({
              meterId: meter.meterId,
              meterNumber: meter.meterNumber,
              meterType: meter.type,
              premiseAddress: addressStr,
              currentPeriodUsage: meter.lastReading,
              previousPeriodUsage: previousUsage,
              unit: meter.unit,
              percentChange: Math.round(percentChange * 10) / 10
            });
          }
        }
      }
    }
    return summaries;
  });

  loadCustomerData(): void {
    this._isLoading.set(true);
    this._error.set(null);

    forkJoin({
      customer: this.http.get<CustomerResponse>(`${this.apiUrl}/customer`),
      accounts: this.http.get<AccountsResponse>(`${this.apiUrl}/accounts`),
      contracts: this.http.get<ContractsResponse>(`${this.apiUrl}/contracts`)
    }).pipe(
      tap(({ customer, accounts, contracts }) => {
        this._customer.set(this.mapCustomerResponse(customer, accounts.accounts));
        this._accounts.set(accounts.accounts.map(a => this.mapAccountResponse(a)));
        this._contracts.set(contracts.contracts.map(c => this.mapContractResponse(c)));
        this._isLoading.set(false);
      }),
      catchError(error => {
        console.error('Failed to load customer data:', error);
        this._error.set('Failed to load customer data. Please try again.');
        this._isLoading.set(false);
        return of(null);
      })
    ).subscribe();
  }

  loadPlans(): void {
    this.http.get<PlansResponse>(`${this.apiUrl}/plans`).pipe(
      tap(response => {
        this._plans.set(response.plans.map(p => this.mapPlanResponse(p)));
      }),
      catchError(error => {
        console.error('Failed to load plans:', error);
        return of(null);
      })
    ).subscribe();
  }

  getAccountById(accountId: number): Account | undefined {
    return this._accounts().find(a => a.accountId === accountId);
  }

  getPremiseById(premiseId: number): Premise | undefined {
    for (const account of this._accounts()) {
      const premise = account.premises.find(p => p.premiseId === premiseId);
      if (premise) return premise;
    }
    return undefined;
  }

  getMeterById(meterId: number): Meter | undefined {
    for (const account of this._accounts()) {
      for (const premise of account.premises) {
        const meter = premise.meters.find(m => m.meterId === meterId);
        if (meter) return meter;
      }
    }
    return undefined;
  }

  clearData(): void {
    this._customer.set(null);
    this._accounts.set([]);
    this._plans.set([]);
    this._contracts.set([]);
    this._bills.set([]);
    this._error.set(null);
  }

  // Mapping functions
  private mapCustomerResponse(response: CustomerResponse, accounts: AccountResponse[]): Customer {
    return {
      customerId: response.customerId,
      type: response.customerType,
      firstName: response.firstName,
      lastName: response.lastName,
      businessName: response.businessName,
      email: response.email,
      phone: response.phone,
      status: response.status,
      accounts: accounts.map(a => this.mapAccountResponse(a))
    };
  }

  private mapAccountResponse(response: AccountResponse): Account {
    return {
      accountId: response.accountId,
      accountNumber: response.accountNumber,
      nickname: response.nickname,
      status: response.status,
      currentBalance: response.currentBalance,
      premises: response.premises.map(p => this.mapPremiseSummary(p))
    };
  }

  private mapPremiseSummary(premise: any): Premise {
    return {
      premiseId: premise.premiseId,
      street: premise.street,
      unit: premise.unit,
      city: premise.city,
      state: premise.state,
      zip: premise.zip,
      isPrimary: premise.isPrimary,
      meters: premise.meters.map((m: any) => this.mapMeterSummary(m))
    };
  }

  private mapMeterSummary(meter: any): Meter {
    return {
      meterId: meter.meterId,
      meterNumber: meter.meterNumber,
      type: meter.meterType as MeterType,
      status: meter.status,
      unit: 'kWh'
    };
  }

  private mapPlanResponse(response: PlanResponse): Plan {
    return {
      planId: response.planId,
      name: response.name,
      description: response.description,
      ratePerKwh: response.ratePerKwh,
      termMonths: response.termMonths,
      earlyTerminationFee: response.earlyTerminationFee,
      baseCharge: response.baseCharge,
      renewablePercent: response.renewablePercent,
      planType: response.planType,
      status: response.status,
      features: response.features,
      eflUrl: response.documents?.eflUrl,
      tosUrl: response.documents?.tosUrl,
      yracUrl: response.documents?.yracUrl
    };
  }

  private mapContractResponse(response: ContractResponse): Contract {
    return {
      contractId: response.contractId,
      contractNumber: response.contractNumber,
      customerId: response.customerId,
      plan: response.plan,
      startDate: new Date(response.startDate),
      endDate: new Date(response.endDate),
      status: response.status,
      earlyTerminationFee: response.earlyTerminationFee,
      signedAt: response.signedAt ? new Date(response.signedAt) : undefined,
      accounts: response.accounts
    };
  }
}
