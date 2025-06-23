'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthHeader from '@/components/AuthHeader';

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState('');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen" style={{backgroundColor: '#FFE1E0'}}>
      {/* Use Auth Header */}
      <AuthHeader />

      {/* Hero Section */}
      <main className="max-w-full mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#7F55B1'}}>
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M17 13v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0" />
            </svg>
          </div>
          <h2 className="text-5xl font-bold mb-6" style={{color: '#7F55B1'}}>Welcome to Your Bakery POS</h2>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{color: '#9B7EBD'}}>
            Streamline your bakery operations with our modern point-of-sale system. 
            Manage orders, track inventory, and serve customers efficiently.
          </p>
        </div>

        {/* Welcome Message for Authenticated Users */}
        {isAuthenticated && user && (
          <div className="bg-white rounded-2xl shadow-lg border-2 p-6 max-w-4xl mx-auto mb-12" style={{borderColor: '#F49BAB'}}>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2" style={{color: '#7F55B1'}}>
                Welcome back, {user.name || user.email}!
              </h3>
              <p style={{color: '#9B7EBD'}}>
                You're signed in as {user.role === 'ADMIN' ? 'an Administrator' : 'a Cashier'}. 
                Choose your action below to get started.
              </p>
              <div className="mt-4 flex justify-center">
                <span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: user.role === 'ADMIN' ? '#7F55B1' : '#9B7EBD',
                    color: 'white'
                  }}
                >
                  {user.role === 'ADMIN' ? 'Administrator' : 'Cashier'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* POS System Card - Available to all authenticated users */}
          {isAuthenticated ? (
            <Link 
              href="/pos"
              className="group bg-white rounded-2xl border-2 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              style={{borderColor: '#F49BAB'}}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{backgroundColor: '#7F55B1'}}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M17 13v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{color: '#7F55B1'}}>POS System</h3>
                <p className="mb-6" style={{color: '#9B7EBD'}}>
                  Process orders, manage your cart, and handle transactions with our intuitive interface.
                </p>
                <div className="inline-flex items-center text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200" style={{backgroundColor: '#7F55B1'}}>
                  Start Taking Orders
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          ) : (
            <div className="group bg-white rounded-2xl border-2 p-8 opacity-75" style={{borderColor: '#F49BAB'}}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center" style={{backgroundColor: '#F49BAB'}}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{color: '#7F55B1'}}>POS System</h3>
                <p className="mb-6" style={{color: '#9B7EBD'}}>
                  Please log in to access the POS system and start processing orders.
                </p>
                <Link 
                  href="/login"
                  className="inline-flex items-center font-semibold px-6 py-3 rounded-xl border-2 hover:shadow-md transition-all duration-200" 
                  style={{color: '#7F55B1', borderColor: '#F49BAB', backgroundColor: 'transparent'}}
                >
                  Login Required
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* Admin Panel Card - Only for Admin users */}
          {isAuthenticated && user?.role === 'ADMIN' ? (
            <Link 
              href="/admin"
              className="group bg-white rounded-2xl border-2 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              style={{borderColor: '#F49BAB'}}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{backgroundColor: '#9B7EBD'}}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{color: '#7F55B1'}}>Admin Dashboard</h3>
                <p className="mb-6" style={{color: '#9B7EBD'}}>
                  View sales reports, manage inventory, and monitor your bakery's performance.
                </p>
                <div className="inline-flex items-center font-semibold px-6 py-3 rounded-xl border-2 hover:bg-opacity-10 transition-all duration-200" style={{color: '#7F55B1', borderColor: '#F49BAB', backgroundColor: 'transparent'}}>
                  Access Dashboard
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          ) : (
            <div className="group bg-white rounded-2xl border-2 p-8 opacity-75" style={{borderColor: '#F49BAB'}}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center" style={{backgroundColor: '#F49BAB'}}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{color: '#7F55B1'}}>Admin Dashboard</h3>
                <p className="mb-6" style={{color: '#9B7EBD'}}>
                  {isAuthenticated 
                    ? 'Admin access required to view dashboard and reports.'
                    : 'Please log in with admin credentials to access the dashboard.'
                  }
                </p>
                {!isAuthenticated ? (
                  <Link 
                    href="/login"
                    className="inline-flex items-center font-semibold px-6 py-3 rounded-xl border-2 hover:shadow-md transition-all duration-200" 
                    style={{color: '#7F55B1', borderColor: '#F49BAB', backgroundColor: 'transparent'}}
                  >
                    Login Required
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </Link>
                ) : (
                  <div className="inline-flex items-center font-semibold px-6 py-3 rounded-xl border-2" style={{color: '#9B7EBD', borderColor: '#F49BAB', backgroundColor: 'transparent', opacity: 0.5}}>
                    Admin Only
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12" style={{color: '#7F55B1'}}>Key Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border-2 p-6 text-center hover:shadow-lg transition-all duration-300" style={{borderColor: '#F49BAB'}}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{backgroundColor: '#F49BAB'}}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold mb-2" style={{color: '#7F55B1'}}>Fast Processing</h4>
              <p style={{color: '#9B7EBD'}}>Quick order processing and real-time inventory updates</p>
            </div>

            <div className="bg-white rounded-2xl border-2 p-6 text-center hover:shadow-lg transition-all duration-300" style={{borderColor: '#F49BAB'}}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{backgroundColor: '#9B7EBD'}}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h4 className="text-lg font-bold mb-2" style={{color: '#7F55B1'}}>Inventory Tracking</h4>
              <p style={{color: '#9B7EBD'}}>Live inventory management with automatic stock updates</p>
            </div>

            <div className="bg-white rounded-2xl border-2 p-6 text-center hover:shadow-lg transition-all duration-300" style={{borderColor: '#F49BAB'}}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{backgroundColor: '#7F55B1'}}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold mb-2" style={{color: '#7F55B1'}}>Modern Interface</h4>
              <p style={{color: '#9B7EBD'}}>Clean, intuitive design built for efficiency and ease of use</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 mt-20" style={{borderColor: '#F49BAB'}}>
        <div className="max-w-full mx-auto px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: '#7F55B1'}}>
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <span className="text-lg font-bold" style={{color: '#7F55B1'}}>PopStreet Bakes MiniPOS</span>
            </div>
            <p style={{color: '#9B7EBD'}}>© 2024 PopStreet Bakes. Crafted for delicious experiences.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 