import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DealerProfileForm } from '@/components/dealer/dealer-profile-form'
import { DealerSecuritySettings } from '@/components/dealer/dealer-security-settings'
import { Building2, ChevronRight, ShieldCheck, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DealerSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get full profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'dealer') {
    redirect('/profile')
  }

  // Get dealer profile
  const { data: dealerProfile } = await supabase
    .from('dealer_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!dealerProfile) {
    redirect('/dealer/dashboard')
  }

  return (
    <div className="container py-12 md:py-20 min-h-screen max-w-5xl mx-auto px-4 text-white">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 animate-fade-down">
        <Link href="/dealer/dashboard" className="hover:text-platinum transition-colors">Dealer Command</Link>
        <ChevronRight size={10} />
        <span className="text-platinum">Configurations</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 animate-fade-down">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-platinum/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-platinum/40">Configuration Node</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-2">
            Dealer <span className="text-platinum">Settings</span>
          </h1>
          <p className="text-platinum/40 font-medium">
            Manage your automotive business and master identity.
          </p>
        </div>
        
        <div className="p-4 bg-white/5 border border-white/10 flex items-center gap-4">
           <div className="h-10 w-10 bg-platinum/10 flex items-center justify-center">
             <ShieldCheck className="h-5 w-5 text-platinum" />
           </div>
           <div>
             <div className="text-[10px] font-black uppercase tracking-widest text-platinum/40 leading-none mb-1">Account Type</div>
             <div className="text-xs font-bold uppercase">Authorized Dealer</div>
           </div>
        </div>
      </div>

      <Tabs defaultValue="business" className="space-y-12">
        <TabsList className="bg-white/5 border border-white/5 p-1 rounded-none h-14 w-full md:w-auto">
          <TabsTrigger value="business" className="data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.3)] rounded-none px-8 font-black uppercase tracking-widest text-[10px] h-full transition-all flex items-center gap-2 text-white/40 hover:text-white">
            <Building2 size={14} /> Business Identity
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.3)] rounded-none px-8 font-black uppercase tracking-widest text-[10px] h-full transition-all flex items-center gap-2 text-white/40 hover:text-white">
            <UserIcon size={14} /> Security & Personal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="mt-0 outline-none">
          <DealerProfileForm initialProfile={dealerProfile} />
        </TabsContent>

        <TabsContent value="security" className="mt-0 outline-none">
          <DealerSecuritySettings profile={{
            id: profile.id,
            name: profile.name,
            phone: profile.phone,
            email: profile.email,
            reputation_score: profile.reputation_score || 0
          }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
