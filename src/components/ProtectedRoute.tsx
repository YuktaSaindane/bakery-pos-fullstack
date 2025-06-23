'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    if (!isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    // Check role-based access
    if (requiredRole && user?.role !== requiredRole) {
      // If user doesn't have required role, redirect based on their actual role
      if (user?.role === 'ADMIN') {
        router.push('/admin');
      } else if (user?.role === 'CASHIER') {
        router.push('/pos');
      } else {
        router.push('/');
      }
      return;
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, fallbackPath]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#FFE1E0'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{borderColor: '#7F55B1'}}></div>
          <p className="text-lg font-medium" style={{color: '#7F55B1'}}>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
} 