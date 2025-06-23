'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const success = await login(email.trim(), password);
    
    if (success) {
      router.push('/');
    }
    
    setIsLoading(false);
  };

  const handleDemoLogin = async (role: 'admin' | 'cashier') => {
    setIsLoading(true);
    
    // Demo credentials
    const demoCredentials = {
      admin: { email: 'admin@popstreetbakes.com', password: 'admin123' },
      cashier: { email: 'cashier@popstreetbakes.com', password: 'cashier123' }
    };

    const { email: demoEmail, password: demoPassword } = demoCredentials[role];
    const success = await login(demoEmail, demoPassword);
    
    if (success) {
      router.push('/');
    }
    
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#FFE1E0'}}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{borderColor: '#7F55B1'}}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#FFE1E0'}}>
      <Toaster />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2" style={{borderColor: '#F49BAB'}}>
        <div className="max-w-full mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: '#7F55B1'}}>
                <span className="text-white text-lg font-bold">P</span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{color: '#7F55B1'}}>PopStreet Bakes</h1>
                <p className="text-sm" style={{color: '#9B7EBD'}}>Point of Sale System</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          {/* Main Login Card */}
          <div className="bg-white rounded-2xl shadow-xl border-2 p-8" style={{borderColor: '#F49BAB'}}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{backgroundColor: '#7F55B1'}}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{color: '#7F55B1'}}>Welcome Back</h2>
              <p style={{color: '#9B7EBD'}}>Sign in to access your POS system</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{color: '#7F55B1'}}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
                  style={{
                    borderColor: '#F49BAB',
                    focusRingColor: '#7F55B1'
                  }}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{color: '#7F55B1'}}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
                  style={{
                    borderColor: '#F49BAB',
                    focusRingColor: '#7F55B1'
                  }}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{backgroundColor: '#7F55B1'}}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 bg-white rounded-2xl shadow-xl border-2 p-6" style={{borderColor: '#F49BAB'}}>
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold" style={{color: '#7F55B1'}}>Demo Accounts</h3>
              <p className="text-sm" style={{color: '#9B7EBD'}}>Try the system with pre-configured accounts</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-xl font-medium border-2 transition-all duration-200 hover:shadow-md disabled:opacity-50"
                style={{
                  borderColor: '#7F55B1',
                  color: '#7F55B1',
                  backgroundColor: 'transparent'
                }}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Demo Admin Account
                </div>
              </button>

              <button
                onClick={() => handleDemoLogin('cashier')}
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-xl font-medium border-2 transition-all duration-200 hover:shadow-md disabled:opacity-50"
                style={{
                  borderColor: '#9B7EBD',
                  color: '#9B7EBD',
                  backgroundColor: 'transparent'
                }}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Demo Cashier Account
                </div>
              </button>
            </div>

            {showDemo && (
              <div className="mt-4 p-3 rounded-xl" style={{backgroundColor: '#FFE1E0'}}>
                <p className="text-xs text-center" style={{color: '#7F55B1'}}>
                  <strong>Admin:</strong> admin@popstreetbakes.com / admin123<br/>
                  <strong>Cashier:</strong> cashier@popstreetbakes.com / cashier123
                </p>
              </div>
            )}

            <button
              onClick={() => setShowDemo(!showDemo)}
              className="w-full mt-3 text-xs font-medium hover:underline transition-all duration-200"
              style={{color: '#9B7EBD'}}
            >
              {showDemo ? 'Hide' : 'Show'} Demo Credentials
            </button>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-sm font-medium hover:underline transition-all duration-200"
              style={{color: '#9B7EBD'}}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 