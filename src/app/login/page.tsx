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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V12.5C11 13.3 11.7 14 12.5 14S14 13.3 14 12.5V11C15.1 11 16 10.1 16 9V9H21ZM7 22H17C18.1 22 19 21.1 19 20V19H5V20C5 21.1 5.9 22 7 22Z"/>
            </svg>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative">
      <Toaster />
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full opacity-10 blur-2xl"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm shadow-sm border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white text-xl font-bold">P</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                  PopStreet Bakes
                </h1>
                <p className="text-sm text-gray-600">Point of Sale System</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="relative flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          {/* Main Login Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200 p-8 mb-6 transform hover:scale-105 transition-all duration-300">
            <div className="text-center mb-8">
              {/* Logo with floating animation */}
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center shadow-2xl animate-float">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {/* Decorative dots */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
              </div>
              
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                Welcome Back! 👋
              </h2>
              <p className="text-gray-600 text-lg">Sign in to access your bakery POS system</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-3 text-gray-700">
                  📧 Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-lg placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                  placeholder="your.email@bakery.com"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-3 text-gray-700">
                  🔒 Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-lg placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>🚀 Sign In</span>
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Demo Accounts Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-200 p-6 mb-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">✨ Try Demo Accounts</h3>
              <p className="text-gray-600">Experience the system with pre-configured accounts</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl font-semibold border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none shadow-sm"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  👑 Demo Admin Account
                </div>
              </button>

              <button
                onClick={() => handleDemoLogin('cashier')}
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl font-semibold border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none shadow-sm"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  💼 Demo Cashier Account
                </div>
              </button>
            </div>

            {/* Expandable demo credentials */}
            {showDemo && (
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 animate-slideInFromBottom">
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-100">
                    <span className="font-medium text-purple-700">👑 Admin:</span>
                    <span className="text-gray-600">admin@popstreetbakes.com</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-100">
                    <span className="font-medium text-indigo-700">💼 Cashier:</span>
                    <span className="text-gray-600">cashier@popstreetbakes.com</span>
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-3">
                    Password for both accounts: <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin123 / cashier123</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowDemo(!showDemo)}
              className="w-full mt-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors duration-200"
            >
              {showDemo ? '🔼 Hide' : '🔽 Show'} Demo Credentials
            </button>
          </div>

          {/* Navigation */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200 group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 