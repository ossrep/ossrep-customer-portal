export type CustomerType = 'individual' | 'business';
export type AccountStatus = 'active' | 'inactive' | 'pending';
export type MeterType = 'electric';
export type MeterStatus = 'active' | 'inactive';
export type BillStatus = 'paid' | 'unpaid' | 'overdue' | 'pending';

export interface Customer {
  customerId: number;
  type: CustomerType;
  // For individual
  firstName?: string;
  lastName?: string;
  // For business
  businessName?: string;
  accounts: Account[];
}

export interface Account {
  accountId: number;
  accountNumber: string;
  nickname?: string;
  status: AccountStatus;
  premises: Premise[];
  currentBalance: number;
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
}

export interface Premise {
  premiseId: number;
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  meters: Meter[];
  isPrimary: boolean;
}

export interface Meter {
  meterId: number;
  meterNumber: string;
  type: MeterType;
  status: MeterStatus;
  installDate: Date;
  lastReading: number;
  lastReadingDate: Date;
  unit: string; // kWh
}

export interface Bill {
  billId: number;
  accountId: number;
  accountNumber: string;
  amount: number;
  dueDate: Date;
  status: BillStatus;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  paidDate?: Date;
  paidAmount?: number;
}

export interface UsageSummary {
  meterId: number;
  meterNumber: string;
  meterType: MeterType;
  premiseAddress: string;
  currentPeriodUsage: number;
  previousPeriodUsage: number;
  unit: string;
  percentChange: number;
}

// Aggregated data for dashboard
export interface CustomerSummary {
  totalAccounts: number;
  totalPremises: number;
  totalMeters: number;
  totalCurrentBalance: number;
  totalDueAmount: number;
  nextDueDate?: Date;
  totalUsageThisPeriod: { [key in MeterType]?: { usage: number; unit: string } };
}
