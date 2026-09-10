import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jncylojtfzcvnqxeigim.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuY3lsb2p0Znpjdm5xeGVpZ2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMjM5NDgsImV4cCI6MjEwNDU5OTk0OH0.8cOkgmbpsNHVM8YbcFqv5jlHRypIbmaHgLPm5sIPbww';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function calculatePayoffPlan(debts: any[], method: 'snowball' | 'avalanche') {
  const sorted = [...debts].sort((a, b) => 
    method === 'snowball' 
      ? a.balance - b.balance 
      : b.apr - a.apr
  );

  let schedule = [];
  let remaining = JSON.parse(JSON.stringify(sorted));
  let month = 0;
  let totalInterestPaid = 0;
  let totalPaidOff = 0;

  while (remaining.some((d: any) => d.balance > 0) && month < 600) {
    month++;
    let monthlyPayment = 0;
    let monthlyInterest = 0;

    for (let i = 0; i < remaining.length; i++) {
      const monthlyRate = remaining[i].apr / 100 / 12;
      const interest = remaining[i].balance * monthlyRate;
      monthlyInterest += interest;
      remaining[i].balance += interest;

      if (i === 0) {
        const payment = Math.min(remaining[i].balance, 500);
        remaining[i].balance -= payment;
        monthlyPayment += payment;
      } else {
        const minPayment = remaining[i].minimum_payment || 50;
        const payment = Math.min(remaining[i].balance, minPayment);
        remaining[i].balance -= payment;
        monthlyPayment += payment;
      }

      if (remaining[i].balance < 0) remaining[i].balance = 0;
    }

    totalInterestPaid += monthlyInterest;
    totalPaidOff += monthlyPayment;

    schedule.push({
      month,
      payment: monthlyPayment,
      interest: monthlyInterest,
      remaining: remaining.map((d: any) => ({ name: d.name, balance: d.balance }))
    });

    remaining = remaining.filter((d: any) => d.balance > 0);
  }

  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + month);

  return {
    debtFreeDate: debtFreeDate.toISOString().split('T')[0],
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    schedule: schedule.slice(0, 60),
    months: month
  };
}
