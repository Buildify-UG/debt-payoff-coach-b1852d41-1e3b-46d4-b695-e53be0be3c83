import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { supabase, calculatePayoffPlan } from '../lib/supabase';
import { Lock, ChevronLeft } from 'lucide-react';

interface FreePreviewProps {
  debts: any[];
  payoffPlan: any;
  onPlanGenerated: (plan: any) => void;
  onSignup: () => void;
  onBack: () => void;
}

export function FreePreview({ debts, payoffPlan, onPlanGenerated, onSignup, onBack }: FreePreviewProps) {
  const [method, setMethod] = useState<'snowball' | 'avalanche'>('snowball');
  const [plan, setPlan] = useState(payoffPlan);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!plan) {
      generatePlan();
    }
  }, []);

  const generatePlan = async () => {
    setLoading(true);
    const newPlan = await calculatePayoffPlan(debts, method);
    setPlan(newPlan);
    onPlanGenerated(newPlan);
    setLoading(false);
  };

  const handleMethodChange = async (newMethod: 'snowball' | 'avalanche') => {
    setMethod(newMethod);
    setLoading(true);
    const newPlan = await calculatePayoffPlan(debts, newMethod);
    setPlan(newPlan);
    onPlanGenerated(newPlan);
    setLoading(false);
  };

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        <h1 className="text-3xl font-bold text-foreground mb-2">Your Payoff Plan</h1>
        <p className="text-muted-foreground mb-8">Choose your strategy to see your personalized plan.</p>

        {/* Payoff Method Selection */}
        <Card className="p-6 mb-8">
          <h2 className="font-semibold text-foreground mb-4">Payoff Strategy</h2>
          <RadioGroup value={method} onValueChange={(v) => handleMethodChange(v as 'snowball' | 'avalanche')}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="snowball" id="snowball" />
              <Label htmlFor="snowball" className="cursor-pointer">
                <span className="font-medium">Snowball</span> - Pay smallest balance first (motivating wins)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="avalanche" id="avalanche" />
              <Label htmlFor="avalanche" className="cursor-pointer">
                <span className="font-medium">Avalanche</span> - Pay highest APR first (save more interest)
              </Label>
            </div>
          </RadioGroup>
        </Card>

        {plan && !loading && (
          <>
            {/* Debt-Free Date - VISIBLE */}
            <Card className="p-8 mb-8 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
              <p className="text-muted-foreground text-sm mb-2">You'll be debt-free in</p>
              <h2 className="text-4xl font-bold text-success mb-2">{plan.months} months</h2>
              <p className="text-lg text-foreground">
                By <span className="font-semibold">{new Date(plan.debtFreeDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
              </p>
            </Card>

            {/* Summary Stats - VISIBLE */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6">
                <p className="text-muted-foreground text-sm">Total Debt</p>
                <p className="text-2xl font-bold text-foreground">${totalDebt.toLocaleString()}</p>
              </Card>
              <Card className="p-6">
                <p className="text-muted-foreground text-sm">Payoff Timeline</p>
                <p className="text-2xl font-bold text-foreground">{plan.months} months</p>
              </Card>
              <Card className="p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-transparent opacity-50" />
                <div className="relative">
                  <p className="text-muted-foreground text-sm">Interest You'll Save</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-foreground">$—</p>
                    <Lock size={18} className="text-muted-foreground" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Blurred Schedule - LOCKED */}
            <Card className="p-6 mb-8 opacity-50 pointer-events-none">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold text-foreground">Month-by-Month Schedule</h3>
                <Lock size={16} className="text-muted-foreground" />
              </div>
              <div className="space-y-2">
                {plan.schedule.slice(0, 3).map((month: any) => (
                  <div key={month.month} className="flex justify-between text-sm blur-sm">
                    <span>Month {month.month}</span>
                    <span>${month.payment.toLocaleString()}</span>
                  </div>
                ))}
                <p className="text-muted-foreground text-sm">... and {plan.schedule.length - 3} more months</p>
              </div>
            </Card>

            {/* Paywall CTA */}
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 mb-8">
              <h3 className="text-xl font-bold text-foreground mb-2">Unlock Your Full Plan</h3>
              <p className="text-muted-foreground mb-6">
                See your exact debt-free date, month-by-month payment schedule, total interest savings, and track your progress with milestones.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white text-sm">✓</div>
                  <span className="text-foreground">Full interactive schedule</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white text-sm">✓</div>
                  <span className="text-foreground">Interest savings calculation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white text-sm">✓</div>
                  <span className="text-foreground">Progress dashboard & milestones</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white text-sm">✓</div>
                  <span className="text-foreground">Payment reminders</span>
                </div>
              </div>
              <Button 
                onClick={onSignup}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg"
              >
                Start 7-Day Free Trial
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-4">
                $9/month or $69/year after trial. Cancel anytime.
              </p>
            </Card>
          </>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Calculating your plan...</p>
          </div>
        )}
      </div>
    </div>
  );
}
