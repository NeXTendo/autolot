import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { matchProtectedRoute, isRoleAllowed } from '@/lib/auth/route-protection'
import type { UserRole } from '@/lib/types/roles'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Check if route requires role-based protection
  const pathname = request.nextUrl.pathname
  const protectedRoute = matchProtectedRoute(pathname)

  if (protectedRoute) {
    // If route is protected but user is not authenticated, redirect to login
    if (!user) {
      const redirectUrl = new URL(protectedRoute.redirectTo || '/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Get user's role from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role as UserRole

    // Check if user's role is allowed for this route
    if (!userRole || !isRoleAllowed(userRole, protectedRoute.allowedRoles)) {
      const redirectUrl = new URL(protectedRoute.redirectTo || '/', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}
