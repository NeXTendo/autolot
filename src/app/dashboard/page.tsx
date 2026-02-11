import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'dealer' || profile?.role === 'dealer_staff') {
    redirect('/dealer/dashboard')
  } else if (profile?.role === 'inspector') {
    redirect('/inspector/dashboard')
  } else if (profile?.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/profile')
  }
}
