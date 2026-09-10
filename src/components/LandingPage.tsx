import { Button } from './ui/button';
import { TrendingDown, Target, Zap } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <nav className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-primary">Debt Payoff Coach</h1>
        <Button variant="ghost" onClick={onLogin}>Sign In</Button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-foreground mb-6">
              Your Debt Payoff Plan Starts Here
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get a personalized snowball or avalanche strategy. See your exact debt-free date. Track your progress with milestones and reminders.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex gap-3">
                <TrendingDown className="text-success flex-shrink-0" />
                <span className="text-foreground">Personalized payoff strategy</span>
              </div>
              <div className="flex gap-3">
                <Target className="text-success flex-shrink-0" />
                <span className="text-foreground">See your debt-free date</span>
              </div>
              <div className="flex gap-3">
                <Zap className="text-success flex-shrink-0" />
                <span className="text-foreground">Gamified milestones & reminders</span>
              </div>
            </div>
            <Button size="lg" onClick={onGetStarted} className="bg-success hover:bg-success/90">
              Calculate My Payoff Date
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-muted-foreground">Free Preview</p>
                <p className="text-2xl font-bold text-foreground">No signup required</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-muted-foreground">Paid Plan</p>
                <p className="text-lg font-bold text-foreground">$9/month or $69/year</p>
                <p className="text-sm text-muted-foreground">7-day free trial</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-muted-foreground">Unlock</p>
                <p className="text-foreground font-semibold">Full schedule, interest savings, progress tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
