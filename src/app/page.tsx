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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Enhanced Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient blobs - More visible */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full opacity-40 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-purple-300 to-indigo-300 rounded-full opacity-35 blur-3xl"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-30 blur-2xl"></div>
        
        {/* Floating bakery items - Much more visible */}
        <div className="absolute top-16 left-16 opacity-50 animate-float">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full shadow-lg"></div>
        </div>
        
        <div className="absolute top-32 right-16 opacity-50 animate-float-delayed">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-pink-400 rounded-lg shadow-lg"></div>
        </div>
        
        <div className="absolute top-48 left-32 opacity-50 animate-float">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-300 to-purple-400 rounded-full shadow-lg"></div>
        </div>
        
        <div className="absolute top-64 right-32 opacity-45 animate-float-slow">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-300 to-indigo-400 rounded-lg shadow-lg"></div>
        </div>
        
        <div className="absolute top-80 left-48 opacity-50 animate-float-delayed">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full shadow-lg"></div>
        </div>

        {/* Middle section elements */}
        <div className="absolute top-96 right-48 opacity-45 animate-float-slow">
          <div className="w-7 h-7 bg-gradient-to-br from-rose-300 to-rose-400 rounded-full shadow-lg"></div>
        </div>
        
        <div className="absolute top-112 left-64 opacity-45 animate-float">
          <div className="w-5 h-5 bg-gradient-to-br from-cyan-300 to-cyan-400 rounded-lg shadow-lg"></div>
        </div>

        <div className="absolute top-128 right-64 opacity-50 animate-float-delayed">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-300 to-emerald-400 rounded-full shadow-lg"></div>
        </div>

        <div className="absolute top-144 left-80 opacity-45 animate-float-slow">
          <div className="w-11 h-11 bg-gradient-to-br from-amber-300 to-amber-400 rounded-lg shadow-lg"></div>
        </div>

        <div className="absolute top-160 right-80 opacity-50 animate-float">
          <div className="w-6 h-6 bg-gradient-to-br from-violet-300 to-violet-400 rounded-full shadow-lg"></div>
        </div>

        {/* Bottom section elements */}
        <div className="absolute bottom-32 left-16 opacity-50 animate-float-delayed">
          <div className="w-8 h-8 bg-gradient-to-br from-red-300 to-red-400 rounded-full shadow-lg"></div>
        </div>

        <div className="absolute bottom-48 right-16 opacity-45 animate-float-slow">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-blue-400 rounded-lg shadow-lg"></div>
        </div>

        <div className="absolute bottom-64 left-32 opacity-50 animate-float">
          <div className="w-7 h-7 bg-gradient-to-br from-green-300 to-green-400 rounded-full shadow-lg"></div>
        </div>

        <div className="absolute bottom-80 right-32 opacity-45 animate-float-delayed">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-300 to-teal-400 rounded-lg shadow-lg"></div>
        </div>

        {/* Geometric patterns - More visible */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-24 left-1/4 w-16 h-16 border-3 border-purple-400 rounded-full"></div>
          <div className="absolute bottom-24 left-1/6 w-12 h-12 border-3 border-pink-400 rounded-lg rotate-45"></div>
          <div className="absolute top-1/3 right-1/4 w-14 h-14 border-3 border-indigo-400 rounded-full"></div>
          <div className="absolute bottom-1/3 right-1/6 w-10 h-10 border-3 border-orange-400 rounded-lg rotate-12"></div>
        </div>

        {/* Subtle gradient overlays - More visible */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-purple-200/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-pink-200/50 to-transparent"></div>
      </div>

      {/* Use Auth Header */}
      <AuthHeader />

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-6 py-24">
        {/* Hero Content */}
        <div className="text-center mb-24">
          {/* Fresh Daily Badge */}
          <div className="inline-flex items-center bg-white/90 backdrop-blur-sm border border-orange-200 text-orange-600 px-5 py-2 rounded-full text-sm font-medium shadow-sm mb-12">
            <span className="text-orange-500 mr-2">✨</span>
            Fresh Daily
          </div>

          {/* Main Content Container */}
          <div className="max-w-5xl mx-auto">
            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-none">
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 bg-clip-text text-transparent">
                PopStreet
              </span>
              <br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                Bakes
              </span>
            </h1>
            
            {/* Subtitle */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
                Modern Bakery POS System
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Streamline your bakery operations with our modern, intuitive point-of-sale system designed for efficiency and ease.
              </p>
            </div>
            
            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              <div className="group p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Manage Orders</h3>
                <p className="text-sm text-gray-600">Process transactions quickly and efficiently</p>
              </div>
              
              <div className="group p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-pink-100 hover:border-pink-200 transition-all duration-300 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Track Inventory</h3>
                <p className="text-sm text-gray-600">Real-time stock monitoring and alerts</p>
              </div>
              
              <div className="group p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-indigo-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Serve Customers</h3>
                <p className="text-sm text-gray-600">Deliver exceptional customer experiences</p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  href="/pos"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17" />
                  </svg>
                  Start Taking Orders
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                  </svg>
                  Get Started
                </Link>
              )}
              
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Trusted by local bakeries
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message for Authenticated Users */}
        {isAuthenticated && user && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-200 p-8 max-w-4xl mx-auto mb-20 transform hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-2xl">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">
                Welcome back, {user.name || user.email}! 👋
              </h3>
              <p className="text-base text-gray-600 mb-6">
                You're signed in as <span className="font-semibold">{user.role === 'ADMIN' ? 'an Administrator' : 'a Cashier'}</span>. 
                Ready to serve some delicious baked goods?
              </p>
              <div className="flex justify-center">
                <span 
                  className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-white shadow-lg"
                  style={{
                    background: user.role === 'ADMIN' 
                      ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' 
                      : 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)'
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {user.role === 'ADMIN' ? 'Admin' : 'Cashier'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Actions Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
          {/* POS System Card */}
          {isAuthenticated ? (
            <Link 
              href="/pos"
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border border-purple-200 p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative text-center">
                <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M17 13v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0a1.65 1.65 0 00-3 0v0" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">🛒 POS System</h3>
                <p className="text-base mb-8 text-gray-600 leading-relaxed">
                  Process orders, manage your cart, and handle transactions with our lightning-fast, intuitive interface designed for busy bakeries.
                </p>
                
                {/* Features list */}
                <div className="text-left mb-8 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Quick order processing</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Real-time inventory tracking</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Touch-friendly mobile design</span>
                  </div>
                </div>
                
                <div className="inline-flex items-center text-white font-bold px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  Start Taking Orders
                  <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-300 p-10 opacity-75">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 to-gray-500/10 rounded-3xl"></div>
              <div className="relative text-center">
                <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-600">🔒 POS System</h3>
                <p className="text-base mb-8 text-gray-500">
                  Please log in to access the POS system and start processing delicious orders.
                </p>
                <Link 
                  href="/login"
                  className="inline-flex items-center font-bold px-8 py-4 rounded-2xl border-2 border-purple-300 text-purple-600 hover:bg-purple-50 transition-all duration-300"
                >
                  🔑 Login Required
                  <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* Admin Panel Card */}
          {isAuthenticated && user?.role === 'ADMIN' ? (
            <Link 
              href="/admin"
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border border-purple-200 p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative text-center">
                <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">📊 Admin Dashboard</h3>
                <p className="text-base mb-8 text-gray-600 leading-relaxed">
                  Monitor your bakery's performance with comprehensive analytics, manage inventory, and oversee all operations.
                </p>
                
                {/* Features list */}
                <div className="text-left mb-8 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Sales analytics & reports</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Product management</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Revenue tracking</span>
                  </div>
                </div>
                
                <div className="inline-flex items-center font-bold px-8 py-4 rounded-2xl border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-all duration-300">
                  Access Dashboard
                  <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-300 p-10 opacity-75">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 to-gray-500/10 rounded-3xl"></div>
              <div className="relative text-center">
                <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-600">🔒 Admin Dashboard</h3>
                <p className="text-base mb-8 text-gray-500">
                  {isAuthenticated 
                    ? 'Administrator privileges required to access the dashboard and analytics.'
                    : 'Please log in with admin credentials to access comprehensive bakery management tools.'
                  }
                </p>
                {!isAuthenticated ? (
                  <Link 
                    href="/login"
                    className="inline-flex items-center font-bold px-8 py-4 rounded-2xl border-2 border-purple-300 text-purple-600 hover:bg-purple-50 transition-all duration-300"
                  >
                    🔑 Login Required
                    <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </Link>
                ) : (
                  <div className="inline-flex items-center font-bold px-8 py-4 rounded-2xl border-2 border-gray-300 text-gray-500">
                    👑 Admin Only
                    <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
              ✨ Key Features
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to run a modern, efficient bakery business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200 p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">⚡ Lightning Fast</h4>
              <p className="text-gray-600">Quick order processing with real-time inventory updates. No more waiting around!</p>
            </div>

            {/* Feature Card 2 */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200 p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">📊 Smart Analytics</h4>
              <p className="text-gray-600">Comprehensive sales tracking and business insights to grow your bakery.</p>
            </div>

            {/* Feature Card 3 */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200 p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">📱 Mobile Ready</h4>
              <p className="text-gray-600">Optimized for tablets and mobile devices with touch-friendly interface.</p>
            </div>

            {/* Feature Card 4 */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200 p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">📦 Inventory Control</h4>
              <p className="text-gray-600">Real-time stock tracking to never run out of your bestselling items.</p>
            </div>

            {/* Feature Card 5 */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200 p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">💳 Easy Checkout</h4>
              <p className="text-gray-600">Streamlined payment processing for faster customer service.</p>
            </div>

            {/* Feature Card 6 */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200 p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">🔐 Secure & Reliable</h4>
              <p className="text-gray-600">Bank-level security with automatic backups and data protection.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20 mb-10">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-3xl p-12 text-white shadow-2xl">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to modernize your bakery? 🚀</h3>
            <p className="text-xl mb-8 opacity-90">Join hundreds of bakeries already using our POS system</p>
            {!isAuthenticated && (
              <Link 
                href="/login"
                className="inline-flex items-center bg-white text-purple-700 font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                Get Started Today
                <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 