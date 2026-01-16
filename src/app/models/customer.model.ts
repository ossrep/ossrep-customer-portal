// Types matching backend API
export type CustomerType = 'INDIVIDUAL' | 'BUSINESS';
export type CustomerStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';
export type AccountStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';
export type MeterType = 'ELECTRIC';
export type MeterStatus = 'AVAILABLE' | 'ACTIVE' | 'INACTIVE';
export type ContractStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'RENEWED';
export type PlanType = 'FIXED' | 'VARIABLE' | 'INDEXED';
export type PlanStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type BillStatus = 'paid' | 'unpaid' | 'overdue' | 'pending';

// API Response types
export interface CustomerResponse {
  customerId: number;
  customerType: CustomerType;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  createdAt: string;
  accounts: AccountSummary[];
}

export interface AccountSummary {
  accountId: number;
  accountNumber: string;
  nickname?: string;
  status: string;
}

export interface AccountResponse {
  accountId: number;
  accountNumber: string;
  customerId: number;
  nickname?: string;
  status: AccountStatus;
  currentBalance: number;
  createdAt: string;
  premises: PremiseSummary[];
}

export interface AccountsResponse {
  accounts: AccountResponse[];
}

export interface PremiseSummary {
  premiseId: number;
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  isPrimary: boolean;
  meters: MeterSummary[];
}

export interface MeterSummary {
  meterId: number;
  meterNumber: string;
  meterType: string;
  status: string;
}

export interface PlanResponse {
  planId: number;
  name: string;
  description?: string;
  ratePerKwh: number;
  termMonths: number;
  earlyTerminationFee: number;
  baseCharge: number;
  renewablePercent: number;
  planType: PlanType;
  status: PlanStatus;
  features: string[];
  documents: {
    eflUrl?: string;
    tosUrl?: string;
    yracUrl?: string;
  };
}

export interface PlansResponse {
  plans: PlanResponse[];
}

export interface ContractResponse {
  contractId: number;
  contractNumber: string;
  customerId: number;
  plan: ContractPlanSummary;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  earlyTerminationFee: number;
  signedAt?: string;
  accounts: ContractAccountSummary[];
}

export interface ContractPlanSummary {
  planId: number;
  name: string;
  ratePerKwh: number;
  termMonths: number;
  planType: string;
}

export interface ContractAccountSummary {
  accountId: number;
  accountNumber: string;
}

export interface ContractsResponse {
  contracts: ContractResponse[];
}

// Domain models for UI (transformed from API responses)
export interface Customer {
  customerId: number;
  type: CustomerType;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  email: string;
  phone: string;
  status: CustomerStatus;
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
  installDate?: Date;
  lastReading?: number;
  lastReadingDate?: Date;
  unit: string;
}

export interface Plan {
  planId: number;
  name: string;
  description?: string;
  ratePerKwh: number;
  termMonths: number;
  earlyTerminationFee: number;
  baseCharge: number;
  renewablePercent: number;
  planType: PlanType;
  status: PlanStatus;
  features: string[];
  eflUrl?: string;
  tosUrl?: string;
  yracUrl?: string;
}

export interface Contract {
  contractId: number;
  contractNumber: string;
  customerId: number;
  plan: ContractPlanSummary;
  startDate: Date;
  endDate: Date;
  status: ContractStatus;
  earlyTerminationFee: number;
  signedAt?: Date;
  accounts: ContractAccountSummary[];
}

// Bill is not yet in backend, keeping for future
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
