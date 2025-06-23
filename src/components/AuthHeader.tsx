'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
  showNavigation?: boolean;
}

export default function AuthHeader({ 
  title = "PopStreet Bakes", 
  subtitle = "Point of Sale System",
  showNavigation = true 
}: AuthHeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();

  const getRoleColor = (role: UserRole) => {
    return role === 'ADMIN' ? '#7F55B1' : '#9B7EBD';
  };

  const getRoleDisplayName = (role: UserRole) => {
    return role === 'ADMIN' ? 'Administrator' : 'Cashier';
  };

  return (
    <header className="bg-white shadow-sm border-b-2" style={{borderColor: '#F49BAB'}}>
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: '#7F55B1'}}>
              <span className="text-white text-lg font-bold">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{color: '#7F55B1'}}>{title}</h1>
              <p className="text-sm" style={{color: '#9B7EBD'}}>{subtitle}</p>
            </div>
          </Link>

          {/* Navigation Links (if user is authenticated) */}
          {isAuthenticated && showNavigation && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/" 
                className="text-sm font-medium hover:underline transition-all duration-200" 
                style={{color: '#9B7EBD'}}
              >
                Home
              </Link>
              <Link 
                href="/pos" 
                className="text-sm font-medium hover:underline transition-all duration-200" 
                style={{color: '#9B7EBD'}}
              >
                POS System
              </Link>
              {user?.role === 'ADMIN' && (
                <Link 
                  href="/admin" 
                  className="text-sm font-medium hover:underline transition-all duration-200" 
                  style={{color: '#9B7EBD'}}
                >
                  Admin Panel
                </Link>
              )}
            </nav>
          )}

          {/* User Info and Logout */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium" style={{color: '#7F55B1'}}>
                  {user.name || user.email}
                </p>
                <div className="flex items-center justify-end space-x-2">
                  <span 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: getRoleColor(user.role),
                      color: 'white'
                    }}
                  >
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl border-2 text-sm font-medium hover:shadow-md transition-all duration-200"
                style={{
                  borderColor: '#F49BAB',
                  color: '#7F55B1',
                  backgroundColor: 'transparent'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-white transition-all duration-200 hover:shadow-lg"
              style={{backgroundColor: '#7F55B1'}}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && showNavigation && (
          <nav className="md:hidden mt-4 pt-4 border-t" style={{borderColor: '#F49BAB'}}>
            <div className="flex space-x-6">
              <Link 
                href="/" 
                className="text-sm font-medium hover:underline transition-all duration-200" 
                style={{color: '#9B7EBD'}}
              >
                Home
              </Link>
              <Link 
                href="/pos" 
                className="text-sm font-medium hover:underline transition-all duration-200" 
                style={{color: '#9B7EBD'}}
              >
                POS
              </Link>
              {user?.role === 'ADMIN' && (
                <Link 
                  href="/admin" 
                  className="text-sm font-medium hover:underline transition-all duration-200" 
                  style={{color: '#9B7EBD'}}
                >
                  Admin
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
} 