import { prisma } from '../prisma.js';
import { formatDueDate } from '../utils/currency.js';

export interface CalculationInput {
  price: number;
  termMonths: number;
  downPaymentAmount?: number;
  downPaymentPercent?: number;
  customMarkupPercent?: number;
}

export interface InstallmentScheduleItem {
  month: number;
  amount: number;
  dueDate: string;
}

export interface CalculationResult {
  cashPrice: number;
  termMonths: number;
  markupPercent: number;
  downPaymentAmount: number;
  downPaymentPercent: number;
  loanAmount: number;
  overpayment: number;
  totalPrice: number;
  monthlyPayment: number;
  schedule: InstallmentScheduleItem[];
}

export class InstallmentService {
  /**
   * Get all active installment plans
   */
  static async getPlans() {
    return prisma.installmentPlan.findMany({
      where: { isActive: true },
      orderBy: { months: 'asc' },
    });
  }

  /**
   * Calculate exact installment terms
   */
  static async calculate(input: CalculationInput): Promise<CalculationResult> {
    const { price, termMonths } = input;

    // 1. Fetch matching plan or default
    const plan = await prisma.installmentPlan.findUnique({
      where: { months: termMonths },
    });

    const markupPercent = input.customMarkupPercent !== undefined && input.customMarkupPercent !== null
      ? input.customMarkupPercent
      : (plan ? plan.markupPercent : 24.0);

    // 2. Down payment computation
    let downPaymentAmount = 0;
    let downPaymentPercent = 0;

    if (input.downPaymentAmount !== undefined && input.downPaymentAmount !== null) {
      downPaymentAmount = Math.max(0, Math.min(price * 0.7, input.downPaymentAmount));
      downPaymentPercent = Number(((downPaymentAmount / price) * 100).toFixed(1));
    } else if (input.downPaymentPercent !== undefined && input.downPaymentPercent !== null) {
      downPaymentPercent = Math.max(0, Math.min(70, input.downPaymentPercent));
      downPaymentAmount = Math.round((price * downPaymentPercent) / 100);
    }

    const principal = price - downPaymentAmount;
    const overpayment = Math.round(principal * (markupPercent / 100));
    const loanAmount = principal + overpayment;
    const monthlyPayment = Math.round(loanAmount / termMonths);
    const totalPrice = downPaymentAmount + loanAmount;

    // Generate schedule
    const schedule: InstallmentScheduleItem[] = [];
    for (let i = 1; i <= termMonths; i++) {
      schedule.push({
        month: i,
        amount: monthlyPayment,
        dueDate: formatDueDate(i),
      });
    }

    return {
      cashPrice: price,
      termMonths,
      markupPercent,
      downPaymentAmount,
      downPaymentPercent,
      loanAmount,
      overpayment,
      totalPrice,
      monthlyPayment,
      schedule,
    };
  }
}
