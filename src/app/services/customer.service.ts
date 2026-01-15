import { Injectable, signal, computed } from '@angular/core';
import {
  Customer,
  Account,
  Premise,
  Meter,
  Bill,
  UsageSummary,
  CustomerSummary,
  MeterType
} from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  // In a real app, this would be determined by the logged-in user
  // For demo purposes, toggle this to switch between individual and business views
  private _isBusinessCustomer = signal(false);

  private _customer = signal<Customer | null>(null);
  private _bills = signal<Bill[]>([]);
  private _isLoading = signal(false);

  readonly customer = this._customer.asReadonly();
  readonly bills = this._bills.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isBusinessCustomer = this._isBusinessCustomer.asReadonly();

  readonly customerSummary = computed<CustomerSummary | null>(() => {
    const customer = this._customer();
    const bills = this._bills();
    if (!customer) return null;

    const accounts = customer.accounts;
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
      if (!usageByType[meter.type]) {
        usageByType[meter.type] = { usage: 0, unit: meter.unit };
      }
      usageByType[meter.type]!.usage += meter.lastReading;
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
    const customer = this._customer();
    if (!customer) return [];

    const summaries: UsageSummary[] = [];
    for (const account of customer.accounts) {
      for (const premise of account.premises) {
        const addressStr = `${premise.street}${premise.unit ? ' ' + premise.unit : ''}, ${premise.city}`;
        for (const meter of premise.meters) {
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
    return summaries;
  });

  constructor() {
    this.loadCustomerData();
  }

  toggleCustomerType(): void {
    this._isBusinessCustomer.update(v => !v);
    this.loadCustomerData();
  }

  private loadCustomerData(): void {
    this._isLoading.set(true);

    // Simulate API delay
    setTimeout(() => {
      if (this._isBusinessCustomer()) {
        this._customer.set(this.getMockBusinessCustomer());
        this._bills.set(this.getMockBusinessBills());
      } else {
        this._customer.set(this.getMockIndividualCustomer());
        this._bills.set(this.getMockIndividualBills());
      }
      this._isLoading.set(false);
    }, 300);
  }

  getAccountById(accountId: number): Account | undefined {
    return this._customer()?.accounts.find(a => a.accountId === accountId);
  }

  getPremiseById(premiseId: number): Premise | undefined {
    const customer = this._customer();
    if (!customer) return undefined;

    for (const account of customer.accounts) {
      const premise = account.premises.find(p => p.premiseId === premiseId);
      if (premise) return premise;
    }
    return undefined;
  }

  getMeterById(meterId: number): Meter | undefined {
    const customer = this._customer();
    if (!customer) return undefined;

    for (const account of customer.accounts) {
      for (const premise of account.premises) {
        const meter = premise.meters.find(m => m.meterId === meterId);
        if (meter) return meter;
      }
    }
    return undefined;
  }

  // ============ MOCK DATA ============

  private getMockIndividualCustomer(): Customer {
    return {
      customerId: 1,
      type: 'individual',
      firstName: 'John',
      lastName: 'Smith',
      accounts: [
        {
          accountId: 1001,
          accountNumber: '1234567890',
          status: 'active',
          currentBalance: 142.50,
          lastPaymentDate: new Date('2024-12-15'),
          lastPaymentAmount: 128.75,
          premises: [
            {
              premiseId: 2001,
              street: '123 Main Street',
              city: 'Anytown',
              state: 'TX',
              zip: '75001',
              isPrimary: true,
              meters: [
                {
                  meterId: 3001,
                  meterNumber: 'E-12345678',
                  type: 'electric',
                  status: 'active',
                  installDate: new Date('2020-03-15'),
                  lastReading: 1245,
                  lastReadingDate: new Date('2025-01-10'),
                  unit: 'kWh'
                }
              ]
            },
            {
              premiseId: 2002,
              street: '456 Beach Boulevard',
              unit: 'Unit 12',
              city: 'Galveston',
              state: 'TX',
              zip: '77550',
              isPrimary: false,
              meters: [
                {
                  meterId: 3002,
                  meterNumber: 'E-23456789',
                  type: 'electric',
                  status: 'active',
                  installDate: new Date('2022-06-01'),
                  lastReading: 387,
                  lastReadingDate: new Date('2025-01-10'),
                  unit: 'kWh'
                }
              ]
            }
          ]
        }
      ]
    };
  }

  private getMockBusinessCustomer(): Customer {
    return {
      customerId: 2,
      type: 'business',
      businessName: 'Acme Corporation',
      accounts: [
        {
          accountId: 1002,
          accountNumber: '9876543210',
          nickname: 'Headquarters',
          status: 'active',
          currentBalance: 2847.30,
          lastPaymentDate: new Date('2024-12-20'),
          lastPaymentAmount: 3150.00,
          premises: [
            {
              premiseId: 2003,
              street: '100 Corporate Drive',
              city: 'Dallas',
              state: 'TX',
              zip: '75201',
              isPrimary: true,
              meters: [
                {
                  meterId: 3003,
                  meterNumber: 'E-34567890',
                  type: 'electric',
                  status: 'active',
                  installDate: new Date('2019-01-15'),
                  lastReading: 45230,
                  lastReadingDate: new Date('2025-01-10'),
                  unit: 'kWh'
                }
              ]
            }
          ]
        },
        {
          accountId: 1003,
          accountNumber: '5555555555',
          nickname: 'Warehouse District',
          status: 'active',
          currentBalance: 1523.45,
          lastPaymentDate: new Date('2024-12-18'),
          lastPaymentAmount: 1489.00,
          premises: [
            {
              premiseId: 2004,
              street: '200 Industrial Parkway',
              unit: 'Building A',
              city: 'Fort Worth',
              state: 'TX',
              zip: '76102',
              isPrimary: true,
              meters: [
                {
                  meterId: 3004,
                  meterNumber: 'E-45678901',
                  type: 'electric',
                  status: 'active',
                  installDate: new Date('2021-04-01'),
                  lastReading: 28750,
                  lastReadingDate: new Date('2025-01-10'),
                  unit: 'kWh'
                }
              ]
            },
            {
              premiseId: 2005,
              street: '200 Industrial Parkway',
              unit: 'Building B',
              city: 'Fort Worth',
              state: 'TX',
              zip: '76102',
              isPrimary: false,
              meters: [
                {
                  meterId: 3005,
                  meterNumber: 'E-56789012',
                  type: 'electric',
                  status: 'active',
                  installDate: new Date('2021-04-01'),
                  lastReading: 19840,
                  lastReadingDate: new Date('2025-01-10'),
                  unit: 'kWh'
                }
              ]
            }
          ]
        },
        {
          accountId: 1004,
          accountNumber: '7777777777',
          nickname: 'Retail Locations',
          status: 'active',
          currentBalance: 956.80,
          lastPaymentDate: new Date('2024-12-22'),
          lastPaymentAmount: 1020.00,
          premises: [
            {
              premiseId: 2006,
              street: '500 Shopping Center Blvd',
              unit: 'Store 101',
              city: 'Plano',
              state: 'TX',
              zip: '75024',
              isPrimary: true,
              meters: [
                {
                  meterId: 3006,
                  meterNumber: 'E-67890123',
                  type: 'electric',
                  status: 'active',
                  installDate: new Date('2023-02-15'),
                  lastReading: 8920,
                  lastReadingDate: new Date('2025-01-10'),
                  unit: 'kWh'
                }
              ]
            },
            {
              premiseId: 2007,
              street: '750 Mall Drive',
              unit: 'Suite 220',
              city: 'Arlington',
              state: 'TX',
              zip: '76011',
              isPrimary: false,
              meters: [
                {
                  meterId: 3007,
                  meterNumber: 'E-78901234',
                  type: 'electric',
                  status: 'active',
                  installDate: new Date('2023-08-01'),
                  lastReading: 6540,
                  lastReadingDate: new Date('2025-01-10'),
                  unit: 'kWh'
                }
              ]
            }
          ]
        }
      ]
    };
  }

  private getMockIndividualBills(): Bill[] {
    return [
      {
        billId: 4001,
        accountId: 1001,
        accountNumber: '1234567890',
        amount: 142.50,
        dueDate: new Date('2025-01-28'),
        status: 'unpaid',
        billingPeriodStart: new Date('2024-12-10'),
        billingPeriodEnd: new Date('2025-01-09')
      },
      {
        billId: 4002,
        accountId: 1001,
        accountNumber: '1234567890',
        amount: 128.75,
        dueDate: new Date('2024-12-28'),
        status: 'paid',
        billingPeriodStart: new Date('2024-11-10'),
        billingPeriodEnd: new Date('2024-12-09'),
        paidDate: new Date('2024-12-15'),
        paidAmount: 128.75
      },
      {
        billId: 4003,
        accountId: 1001,
        accountNumber: '1234567890',
        amount: 156.20,
        dueDate: new Date('2024-11-28'),
        status: 'paid',
        billingPeriodStart: new Date('2024-10-10'),
        billingPeriodEnd: new Date('2024-11-09'),
        paidDate: new Date('2024-11-20'),
        paidAmount: 156.20
      }
    ];
  }

  private getMockBusinessBills(): Bill[] {
    return [
      // Headquarters
      {
        billId: 4004,
        accountId: 1002,
        accountNumber: '9876543210',
        amount: 2847.30,
        dueDate: new Date('2025-01-25'),
        status: 'unpaid',
        billingPeriodStart: new Date('2024-12-10'),
        billingPeriodEnd: new Date('2025-01-09')
      },
      {
        billId: 4005,
        accountId: 1002,
        accountNumber: '9876543210',
        amount: 3150.00,
        dueDate: new Date('2024-12-25'),
        status: 'paid',
        billingPeriodStart: new Date('2024-11-10'),
        billingPeriodEnd: new Date('2024-12-09'),
        paidDate: new Date('2024-12-20'),
        paidAmount: 3150.00
      },
      // Warehouse
      {
        billId: 4006,
        accountId: 1003,
        accountNumber: '5555555555',
        amount: 1523.45,
        dueDate: new Date('2025-01-22'),
        status: 'unpaid',
        billingPeriodStart: new Date('2024-12-10'),
        billingPeriodEnd: new Date('2025-01-09')
      },
      {
        billId: 4007,
        accountId: 1003,
        accountNumber: '5555555555',
        amount: 1489.00,
        dueDate: new Date('2024-12-22'),
        status: 'paid',
        billingPeriodStart: new Date('2024-11-10'),
        billingPeriodEnd: new Date('2024-12-09'),
        paidDate: new Date('2024-12-18'),
        paidAmount: 1489.00
      },
      // Retail
      {
        billId: 4008,
        accountId: 1004,
        accountNumber: '7777777777',
        amount: 956.80,
        dueDate: new Date('2025-01-30'),
        status: 'unpaid',
        billingPeriodStart: new Date('2024-12-10'),
        billingPeriodEnd: new Date('2025-01-09')
      },
      {
        billId: 4009,
        accountId: 1004,
        accountNumber: '7777777777',
        amount: 1020.00,
        dueDate: new Date('2024-12-30'),
        status: 'paid',
        billingPeriodStart: new Date('2024-11-10'),
        billingPeriodEnd: new Date('2024-12-09'),
        paidDate: new Date('2024-12-22'),
        paidAmount: 1020.00
      }
    ];
  }
}
