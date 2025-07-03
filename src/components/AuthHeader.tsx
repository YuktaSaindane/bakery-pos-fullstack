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

  const getRoleGradient = (role: UserRole) => {
    return role === 'ADMIN' 
      ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' 
      : 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)';
  };

  const getRoleDisplayName = (role: UserRole) => {
    return role === 'ADMIN' ? 'Admin' : 'Cashier';
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Title and Subtitle */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  {title}
                </h1>
                <p className="text-xs text-gray-500">{subtitle}</p>
              </div>
            </Link>
          </div>

          {/* Center Navigation */}
          {isAuthenticated && showNavigation && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 rounded-md hover:bg-purple-50 transition-all duration-200"
              >
                <span>🏠</span>
                <span>Home</span>
              </Link>
              <Link 
                href="/pos" 
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 rounded-md hover:bg-purple-50 transition-all duration-200"
              >
                <span>🛒</span>
                <span>POS</span>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link 
                  href="/admin" 
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 rounded-md hover:bg-purple-50 transition-all duration-200"
                >
                  <span>📊</span>
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          )}

          {/* Right Side - User Info */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getRoleDisplayName(user.role)} • Active
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-all duration-200"
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
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-all duration-200"
            >
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && showNavigation && (
          <div className="md:hidden border-t border-gray-200 py-3">
            <nav className="flex justify-center space-x-6">
              <Link 
                href="/" 
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 rounded-md hover:bg-purple-50 transition-all duration-200"
              >
                <span>🏠</span>
                <span>Home</span>
              </Link>
              <Link 
                href="/pos" 
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 rounded-md hover:bg-purple-50 transition-all duration-200"
              >
                <span>🛒</span>
                <span>POS</span>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link 
                  href="/admin" 
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 rounded-md hover:bg-purple-50 transition-all duration-200"
                >
                  <span>📊</span>
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 