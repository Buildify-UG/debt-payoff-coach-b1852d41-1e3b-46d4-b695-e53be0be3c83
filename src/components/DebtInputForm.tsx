import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Trash2, Plus, ChevronLeft } from 'lucide-react';

interface Debt {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minimum_payment: number;
}

interface DebtInputFormProps {
  onSaved: (debts: Debt[]) => void;
  onBack: () => void;
}

export function DebtInputForm({ onSaved, onBack }: DebtInputFormProps) {
  const [debts, setDebts] = useState<Debt[]>([
    { id: '1', name: '', balance: 0, apr: 0, minimum_payment: 0 }
  ]);

  const updateDebt = (id: string, field: keyof Debt, value: any) => {
    setDebts(debts.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const addDebt = () => {
    setDebts([...debts, {
      id: Date.now().toString(),
      name: '',
      balance: 0,
      apr: 0,
      minimum_payment: 0
    }]);
  };

  const removeDebt = (id: string) => {
    if (debts.length > 1) {
      setDebts(debts.filter(d => d.id !== id));
    }
  };

  const handleContinue = () => {
    const validDebts = debts.filter(d => d.name && d.balance > 0 && d.apr >= 0);
    if (validDebts.length === 0) {
      alert('Please add at least one debt with name, balance, and APR');
      return;
    }
    onSaved(validDebts);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        <h1 className="text-3xl font-bold text-foreground mb-2">Your Debts</h1>
        <p className="text-muted-foreground mb-8">Add all your debts. We'll create a personalized payoff plan.</p>

        <div className="space-y-6">
          {debts.map((debt, idx) => (
            <Card key={debt.id} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-foreground">Debt {idx + 1}</h3>
                {debts.length > 1 && (
                  <button
                    onClick={() => removeDebt(debt.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`name-${debt.id}`}>Name (e.g., Credit Card)</Label>
                  <Input
                    id={`name-${debt.id}`}
                    value={debt.name}
                    onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                    placeholder="Credit Card, Personal Loan, etc."
                  />
                </div>

                <div>
                  <Label htmlFor={`balance-${debt.id}`}>Current Balance ($)</Label>
                  <Input
                    id={`balance-${debt.id}`}
                    type="number"
                    value={debt.balance || ''}
                    onChange={(e) => updateDebt(debt.id, 'balance', parseFloat(e.target.value) || 0)}
                    placeholder="5000"
                  />
                </div>

                <div>
                  <Label htmlFor={`apr-${debt.id}`}>APR (%)</Label>
                  <Input
                    id={`apr-${debt.id}`}
                    type="number"
                    step="0.1"
                    value={debt.apr || ''}
                    onChange={(e) => updateDebt(debt.id, 'apr', parseFloat(e.target.value) || 0)}
                    placeholder="18.5"
                  />
                </div>

                <div>
                  <Label htmlFor={`min-${debt.id}`}>Min. Payment ($)</Label>
                  <Input
                    id={`min-${debt.id}`}
                    type="number"
                    value={debt.minimum_payment || ''}
                    onChange={(e) => updateDebt(debt.id, 'minimum_payment', parseFloat(e.target.value) || 0)}
                    placeholder="50"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={addDebt}
          className="w-full mt-6 gap-2"
        >
          <Plus size={18} />
          Add Another Debt
        </Button>

        <div className="flex gap-4 mt-8">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleContinue} className="flex-1 bg-success hover:bg-success/90">
            Continue to Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
