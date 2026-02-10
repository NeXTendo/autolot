import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/register')
  }

  return (
    <div className="container py-12 md:py-24 min-h-screen">
      <div className="mb-12 animate-fade-down">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Command Center</h1>
        <p className="text-platinum-dim italic">Manage your digital collection and identity.</p>
      </div>
      
      <ProfileForm initialProfile={profile} />
    </div>
  )
}
