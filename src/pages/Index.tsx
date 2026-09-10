import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LandingPage } from '../components/LandingPage';
import { DebtInputForm } from '../components/DebtInputForm';
import { FreePreview } from '../components/FreePreview';
import { AuthPage } from '../components/AuthPage';
import { Dashboard } from '../components/Dashboard';
import { AccountSettings } from '../components/AccountSettings';

function Index() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'calculator' | 'preview' | 'auth' | 'dashboard' | 'settings'>('landing');
  const [user, setUser] = useState<any>(null);
  const [debts, setDebts] = useState<any[]>([]);
  const [payoffPlan, setPayoffPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadUserData(user.id);
      }
      setLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          await loadUserData(session.user.id);
          setCurrentPage('dashboard');
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    const [debtsRes, plansRes] = await Promise.all([
      supabase.from('debts').select('*').eq('user_id', userId),
      supabase.from('payoff_plans').select('*').eq('user_id', userId).order('generated_at', { ascending: false }).limit(1)
    ]);
    
    if (debtsRes.data) setDebts(debtsRes.data);
    if (plansRes.data?.[0]) setPayoffPlan(plansRes.data[0]);
  };

  const handleDebtsSaved = (newDebts: any[]) => {
    setDebts(newDebts);
    setCurrentPage('preview');
  };

  const handlePlanGenerated = (plan: any) => {
    setPayoffPlan(plan);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('landing');
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-background">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      {currentPage === 'landing' && (
        <LandingPage 
          onGetStarted={() => setCurrentPage('calculator')}
          onLogin={() => setCurrentPage('auth')}
        />
      )}
      {currentPage === 'calculator' && (
        <DebtInputForm 
          onSaved={handleDebtsSaved}
          onBack={() => setCurrentPage('landing')}
        />
      )}
      {currentPage === 'preview' && (
        <FreePreview 
          debts={debts}
          payoffPlan={payoffPlan}
          onPlanGenerated={handlePlanGenerated}
          onSignup={() => setCurrentPage('auth')}
          onBack={() => setCurrentPage('calculator')}
        />
      )}
      {currentPage === 'auth' && (
        <AuthPage 
          onSuccess={() => {
            setCurrentPage('dashboard');
          }}
          onBack={() => setCurrentPage('landing')}
        />
      )}
      {currentPage === 'dashboard' && user && (
        <Dashboard 
          user={user}
          debts={debts}
          payoffPlan={payoffPlan}
          onDebtsUpdated={(newDebts) => setDebts(newDebts)}
          onPlanUpdated={(plan) => setPayoffPlan(plan)}
          onSettings={() => setCurrentPage('settings')}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'settings' && user && (
        <AccountSettings 
          user={user}
          onBack={() => setCurrentPage('dashboard')}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default Index;
