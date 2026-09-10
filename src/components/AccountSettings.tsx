import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { supabase } from '../lib/supabase';
import { ChevronLeft } from 'lucide-react';

interface AccountSettingsProps {
  user: any;
  onBack: () => void;
  onLogout: () => void;
}

export function AccountSettings({ user, onBack, onLogout }: AccountSettingsProps) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    setUserData(data);
    setLoading(false);
  };

  const handleCancelTrial = async () => {
    if (confirm('Are you sure you want to cancel your trial? You can reactivate anytime.')) {
      const { error } = await supabase
        .from('users')
        .update({ subscription_status: 'canceled' })
        .eq('id', user.id);
      
      if (!error) {
        setUserData({ ...userData, subscription_status: 'canceled' });
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

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

        <h1 className="text-3xl font-bold text-foreground mb-8">Account Settings</h1>

        {/* Account Info */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-foreground font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-foreground font-medium">
                {new Date(user.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </Card>

        {/* Subscription Info */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Subscription</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${
                  userData?.subscription_status === 'trial' ? 'bg-blue-500' :
                  userData?.subscription_status === 'active' ? 'bg-success' :
                  'bg-muted'
                }`} />
                <p className="text-foreground font-medium capitalize">{userData?.subscription_status || 'Free'}</p>
              </div>
            </div>

            {userData?.subscription_status === 'trial' && userData?.trial_end_date && (
              <div>
                <p className="text-sm text-muted-foreground">Trial Ends</p>
                <p className="text-foreground font-medium">
                  {new Date(userData.trial_end_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="text-foreground font-medium">
                {userData?.subscription_status === 'trial' || userData?.subscription_status === 'active'
                  ? '$9/month or $69/year'
                  : 'No active subscription'}
              </p>
            </div>
          </div>

          {userData?.subscription_status === 'trial' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-foreground mb-3">
                Your trial is active. After {new Date(userData.trial_end_date).toLocaleDateString()}, your subscription will auto-renew unless you cancel.
              </p>
              <Button
                variant="outline"
                onClick={handleCancelTrial}
                className="text-destructive hover:text-destructive"
              >
                Cancel Trial
              </Button>
            </div>
          )}
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/20 bg-destructive/5">
          <h2 className="text-xl font-semibold text-destructive mb-4">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Signing out will log you out of this device. Your data will be saved.
          </p>
          <Button
            variant="outline"
            onClick={onLogout}
            className="text-destructive hover:text-destructive"
          >
            Sign Out
          </Button>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Need help? <a href="#" className="text-primary hover:underline">Contact support</a></p>
        </div>
      </div>
    </div>
  );
}
