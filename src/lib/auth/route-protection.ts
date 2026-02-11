// Role-based route protection configuration

import type { UserRole } from '@/lib/types/roles';

export interface RouteProtection {
  path: string;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * Define protected routes and their required roles
 */
export const protectedRoutes: RouteProtection[] = [
  // Admin routes
  {
    path: '/admin',
    allowedRoles: ['admin', 'moderator'],
    redirectTo: '/',
  },
  
  // Dealer routes
  {
    path: '/dealer/dashboard',
    allowedRoles: ['dealer'],
    redirectTo: '/',
  },
  {
    path: '/dealer/staff',
    allowedRoles: ['dealer'],
    redirectTo: '/',
  },
  
  // Dealer staff routes
  {
    path: '/dealer-staff',
    allowedRoles: ['dealer_staff'],
    redirectTo: '/',
  },
  
  // Seller routes (dealers, dealer staff, and regular sellers)
  {
    path: '/seller',
    allowedRoles: ['dealer', 'dealer_staff', 'registered', 'verified'],
    redirectTo: '/',
  },
  {
    path: '/listings/new',
    allowedRoles: ['dealer', 'dealer_staff', 'registered', 'verified'],
    redirectTo: '/login',
  },
  {
    path: '/listings/edit',
    allowedRoles: ['dealer', 'dealer_staff', 'registered', 'verified'],
    redirectTo: '/login',
  },
  
  // Buyer routes (any authenticated user can be a buyer)
  {
    path: '/buyer',
    allowedRoles: ['buyer', 'registered', 'verified', 'dealer', 'dealer_staff', 'admin', 'moderator'],
    redirectTo: '/login',
  },
  
  // Inspector routes
  {
    path: '/inspector',
    allowedRoles: ['inspector', 'admin', 'moderator'],
    redirectTo: '/',
  },
];

/**
 * Check if a path matches a protected route pattern
 */
export function matchProtectedRoute(pathname: string): RouteProtection | null {
  for (const route of protectedRoutes) {
    if (pathname.startsWith(route.path)) {
      return route;
    }
  }
  return null;
}

/**
 * Check if user role is allowed for a route
 */
export function isRoleAllowed(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}
