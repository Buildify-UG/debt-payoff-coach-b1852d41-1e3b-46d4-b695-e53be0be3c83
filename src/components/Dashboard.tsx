import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { supabase } from '../lib/supabase';
import { LogOut, Settings, Edit2, Plus, Trash2 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface DashboardProps {
  user: any;
  debts: any[];
  payoffPlan: any;
  onDebtsUpdated: (debts: any[]) => void;
  onPlanUpdated: (plan: any) => void;
  onSettings: () => void;
  onLogout: () => void;
}

const MILESTONES = [
  { amount: 1000, label: 'First $1K Paid Off' },
  { amount: 5000, label: '$5K Milestone' },
  { amount: 10000, label: '$10K Paid Off' },
  { amount: 25000, label: '25% There' },
  { amount: 50000, label: 'Halfway There' },
];

export function Dashboard({
  user,
  debts,
  payoffPlan,
  onDebtsUpdated,
  onPlanUpdated,
  onSettings,
  onLogout
}: DashboardProps) {
  const [editing, setEditing] = useState(false);
  const [editDebts, setEditDebts] = useState(debts);
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    loadMilestones();
  }, [user]);

  const loadMilestones = async () => {
    const { data } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id);
    setMilestones(data || []);
  };

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const progressPercent = payoffPlan ? Math.min(100, Math.max(0, (payoffPlan.months ? (24 / payoffPlan.months) * 100 : 0))) : 0;
  const daysUntilDebtFree = payoffPlan ? Math.ceil((new Date(payoffPlan.debtFreeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  const handleSaveDebts = async () => {
    const validDebts = editDebts.filter(d => d.name && d.balance > 0);
    
    for (const debt of validDebts) {
      if (!debt.id || debt.id.startsWith('temp-')) {
        const { error } = await supabase.from('debts').insert({
          user_id: user.id,
          ...debt,
          id: undefined
        });
        if (error) console.error(error);
      } else {
        const { error } = await supabase.from('debts').update(debt).eq('id', debt.id);
        if (error) console.error(error);
      }
    }

    for (const debt of debts) {
      if (!validDebts.find(d => d.id === debt.id)) {
        await supabase.from('debts').delete().eq('id', debt.id);
      }
    }

    onDebtsUpdated(validDebts);
    setEditing(false);
  };

  const addDebtRow = () => {
    setEditDebts([...editDebts, {
      id: `temp-${Date.now()}`,
      name: '',
      balance: 0,
      apr: 0,
      minimum_payment: 0
    }]);
  };

  const removeDebtRow = (id: string) => {
    setEditDebts(editDebts.filter(d => d.id !== id));
  };

  const achievedMilestones = MILESTONES.filter(m => milestones.some(am => am.milestone_type === m.label));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border-b">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Progress</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onSettings}>
              <Settings size={18} />
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Main Progress Card */}
        {payoffPlan && (
          <Card className="p-8 mb-8 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Debt-Free Date</p>
                <p className="text-3xl font-bold text-success">
                  {new Date(payoffPlan.debtFreeDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-2">Days Remaining</p>
                <p className="text-3xl font-bold text-foreground">{daysUntilDebtFree}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-2">Interest You'll Save</p>
                <p className="text-3xl font-bold text-primary">${payoffPlan.totalInterestPaid?.toLocaleString() || '—'}</p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">{Math.round(progressPercent)}% complete</p>
            </div>
          </Card>
        )}

        {/* Milestones */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Milestones</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
            {MILESTONES.map((milestone) => {
              const achieved = achievedMilestones.some(m => m.label === milestone.label);
              return (
                <Card
                  key={milestone.label}
                  className={`p-4 text-center cursor-pointer transition-all ${
                    achieved
                      ? 'bg-success/10 border-success'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{milestone.label}</p>
                  {achieved && <p className="text-xs text-success mt-2">✓ Achieved</p>}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Debts Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Your Debts</h2>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditDebts(debts);
                  setEditing(true);
                }}
              >
                <Edit2 size={16} />
                Edit
              </Button>
            )}
          </div>

          {!editing ? (
            <div className="space-y-3">
              {debts.map((debt) => (
                <Card key={debt.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">{debt.name}</h3>
                      <p className="text-sm text-muted-foreground">APR: {debt.apr}%</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">${debt.balance.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Min: ${debt.minimum_payment}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {editDebts.map((debt) => (
                <Card key={debt.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={debt.name}
                        onChange={(e) => setEditDebts(editDebts.map(d => d.id === debt.id ? { ...d, name: e.target.value } : d))}
                        placeholder="Debt name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Balance</Label>
                      <Input
                        type="number"
                        value={debt.balance}
                        onChange={(e) => setEditDebts(editDebts.map(d => d.id === debt.id ? { ...d, balance: parseFloat(e.target.value) || 0 } : d))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">APR %</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={debt.apr}
                        onChange={(e) => setEditDebts(editDebts.map(d => d.id === debt.id ? { ...d, apr: parseFloat(e.target.value) || 0 } : d))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Min Payment</Label>
                      <Input
                        type="number"
                        value={debt.minimum_payment}
                        onChange={(e) => setEditDebts(editDebts.map(d => d.id === debt.id ? { ...d, minimum_payment: parseFloat(e.target.value) || 0 } : d))}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDebtRow(debt.id)}
                      className="text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                onClick={addDebtRow}
                className="w-full gap-2"
              >
                <Plus size={16} />
                Add Debt
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setEditDebts(debts);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDebts}
                  className="flex-1 bg-success hover:bg-success/90"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Schedule Preview */}
        {payoffPlan?.schedule && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Payment Schedule (First 12 Months)</h2>
            <Card className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-muted-foreground">Month</th>
                    <th className="text-right py-2 text-muted-foreground">Payment</th>
                    <th className="text-right py-2 text-muted-foreground">Interest</th>
                  </tr>
                </thead>
                <tbody>
                  {payoffPlan.schedule.slice(0, 12).map((month: any) => (
                    <tr key={month.month} className="border-b hover:bg-muted/50">
                      <td className="py-3 text-foreground">Month {month.month}</td>
                      <td className="text-right text-foreground">${month.payment.toLocaleString()}</td>
                      <td className="text-right text-muted-foreground">${month.interest.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
