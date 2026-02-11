import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  LayoutDashboard, 
  Car, 
  Users, 
  BarChart3,
  Settings,
  ShieldCheck
} from 'lucide-react'
import { AnalyticsSummary } from '@/components/dashboard/analytics-summary'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { ReviewManagement } from '@/components/dashboard/review-management'
import { SellerBenchmark } from '@/components/dashboard/seller-benchmark'
import { StrategicReach } from '@/components/dashboard/strategic-reach'
import { LeadManagement } from '@/components/dashboard/lead-management'
import { InventoryGrid } from '@/components/dashboard/inventory-grid'
import { HighPotentialAssets } from '@/components/dashboard/high-potential-assets'
import { DealerOnboarding } from '@/components/dealer/dealer-onboarding'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

interface StaffMember {
  staff: {
    id: string
    role: string
  }
  profile: {
    name: string
  }
}

export default async function DealerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Allow dealer or dealer_staff
  if (!profile || (profile.role !== 'dealer' && profile.role !== 'dealer_staff')) {
    redirect('/profile')
  }

  // Determine the dealer ID (self or parent)
  const dealerId = profile.role === 'dealer' ? profile.id : profile.parent_dealer_id
  
  if (!dealerId) {
    redirect('/profile')
  }

  // Get dealer staff for the Team tab
  const { data: staff } = await supabase.rpc('get_dealer_staff', {
    p_dealer_id: dealerId
  })

  return (
    <div className="container py-12 md:py-20 min-h-screen max-w-7xl mx-auto px-4 text-white">
      {/* Onboarding Trigger - Only for actual dealer account, not staff */}
      {profile.role === 'dealer' && (
        <DealerOnboarding dealerId={profile.id} />
      )}

      {/* Premium Header Container */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8 pb-8 border-b border-white/5">
        <div className="animate-fade-down">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-platinum/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-platinum/40">Dealer Command</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-2">
            Control <span className="text-platinum">Center</span>
          </h1>
          <p className="text-platinum/40 font-medium">
            Authenticated Agent: <span className="text-platinum font-black uppercase tracking-widest text-[11px] ml-1">@{profile?.name?.toLowerCase().replace(/\s+/g, '_') || 'dealer'}</span>
            {profile?.is_verified && (
              <span className="ml-3 inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase tracking-tighter text-blue-400">
                <ShieldCheck size={10} /> Verified
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 animate-fade-down">
          <Button asChild variant="platinum" className="h-14 px-8 rounded-none font-black uppercase tracking-widest group">
            <Link href="/listings/new">
              <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Initialize Listing
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-14 px-8 rounded-none border-white/5 bg-white/5 hover:bg-white hover:text-black transition-all font-black uppercase tracking-widest">
            <Link href="/dealer/settings">
              <Settings size={18} className="mr-2" /> Business Config
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-12">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible">
          <TabsList className="bg-white/5 border border-white/5 p-1 rounded-none h-14 w-full md:w-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.3)] rounded-none px-8 font-black uppercase tracking-widest text-[10px] h-full transition-all text-white/40 hover:text-white">
              <LayoutDashboard size={14} className="mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.3)] rounded-none px-8 font-black uppercase tracking-widest text-[10px] h-full transition-all text-white/40 hover:text-white">
              <Car size={14} className="mr-2" /> Marketplace
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.3)] rounded-none px-8 font-black uppercase tracking-widest text-[10px] h-full transition-all text-white/40 hover:text-white relative">
              <Users size={14} className="mr-2" /> Buyers
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.3)] rounded-none px-8 font-black uppercase tracking-widest text-[10px] h-full transition-all text-white/40 hover:text-white">
              <BarChart3 size={14} className="mr-2" /> Performance
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.3)] rounded-none px-8 font-black uppercase tracking-widest text-[10px] h-full transition-all text-white/40 hover:text-white">
              <Users size={14} className="mr-2" /> Team
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="m-0 space-y-12">
          <div className="animate-fade-up">
            <AnalyticsSummary sellerId={dealerId} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            <div className="lg:col-span-2 space-y-8 animate-fade-up [animation-delay:200ms]">
              <SalesChart sellerId={dealerId} />
            </div>
            <div className="space-y-8 animate-fade-up [animation-delay:400ms]">
               <StrategicReach sellerId={dealerId} />
               <HighPotentialAssets sellerId={dealerId} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="m-0 animate-fade-up">
          <div className="flex flex-col gap-8 mb-12">
             <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">Active Assets</h3>
                  <p className="text-platinum/40 text-[10px] font-black uppercase tracking-widest">Global Marketplace Inventory</p>
                </div>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="rounded-none border-white/5 text-[9px] font-black uppercase tracking-widest">All Status</Button>
                   <Button variant="outline" size="sm" className="rounded-none border-white/5 text-[9px] font-black uppercase tracking-widest">Sort: Latest</Button>
                </div>
             </div>
             <InventoryGrid sellerId={dealerId} />
          </div>
        </TabsContent>

        <TabsContent value="leads" className="m-0 animate-fade-up">
          <div className="flex flex-col gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight">Acquisition Inbox</h3>
              <p className="text-platinum/40 text-[10px] font-black uppercase tracking-widest">Direct Buyer Inquiries & Leads</p>
            </div>
            <LeadManagement sellerId={dealerId} />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="m-0 animate-fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">Market Benchmarking</h3>
                  <p className="text-platinum/40 text-[10px] font-black uppercase tracking-widest">Comparing performance vs market average</p>
                </div>
                <SellerBenchmark sellerId={dealerId} />
             </div>
             <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">Reputation & Reviews</h3>
                  <p className="text-platinum/40 text-[10px] font-black uppercase tracking-widest">Customer satisfaction and trust metrics</p>
                </div>
                <ReviewManagement sellerId={dealerId} />
             </div>
          </div>
        </TabsContent>

        <TabsContent value="team" className="m-0 animate-fade-up">
           <div className="flex flex-col gap-8 mb-12">
             <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">Team Management</h3>
                  <p className="text-platinum/40 text-[10px] font-black uppercase tracking-widest">Staff members and permissions</p>
                </div>
                <Button asChild variant="platinum" className="h-10 px-6 rounded-none font-black uppercase tracking-widest text-[10px]">
                   <Link href="/dealer/staff">
                     Manage Staff
                   </Link>
                </Button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {staff && staff.length > 0 ? (staff as unknown as StaffMember[]).map((member) => (
                  <div key={member.staff.id} className="p-6 rounded-none bg-white/5 border border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-platinum/10 flex items-center justify-center text-sm font-black text-platinum">
                      {member.profile.name?.[0]}
                    </div>
                    <div>
                      <div className="font-bold text-white">{member.profile.name}</div>
                      <div className="text-xs text-platinum/40 font-black uppercase tracking-widest">{member.staff.role.replace('_', ' ')}</div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-3 text-center py-12 border-2 border-dashed border-white/5 bg-white/5">
                    <p className="text-platinum/40 text-sm italic">No team members yet</p>
                  </div>
                )}
             </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
