import { useEffect, useState } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AdminDashboard } from './AdminDashboard';
import { authAPI, errorMessage, type AuthStatus } from '../../utils/api';
import { usePageTitle } from '../../hooks/usePageTitle';

// Gate in front of the dashboard: shows the sign-in form until authenticated
export function AdminPage({ onBack }: { onBack: () => void }) {
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  usePageTitle('Admin');

  useEffect(() => {
    authAPI
      .check()
      .then(setAuth)
      .catch(() => setAuth({ authenticated: false, emailAlerts: false }));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      setAuth(await authAPI.login(password));
      setPassword('');
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to sign in'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
    setAuth({ authenticated: false, emailAlerts: false });
  };

  if (auth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  if (auth.authenticated) {
    return <AdminDashboard onBack={onBack} onLogout={handleLogout} emailAlerts={auth.emailAlerts} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="w-12 h-12 bg-brand-purple/10 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-brand-purple" />
          </div>
          <CardTitle>Admin Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none"
              />
            </div>
            <Button type="submit" disabled={submitting} variant="secondary" className="w-full">
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
            <Button type="button" variant="ghost" onClick={onBack} className="w-full">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Site
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
