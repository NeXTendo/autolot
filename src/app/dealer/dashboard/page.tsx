import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireDealer } from '@/lib/auth/roles'
import { Users, TrendingUp, Car, BarChart3, Eye, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { VehicleCard } from '@/components/vehicle-card'

export default async function DealerDashboardPage() {
  // Require dealer role
  let profile
  try {
    profile = await requireDealer()
  } catch {
    redirect('/login')
  }

  const supabase = await createClient()

  // Get dealer profile with stats
  const { data: dealerData } = await supabase.rpc('get_dealer_profile', {
    p_dealer_id: profile.id
  })

  // Get dealer listings
  const { data: listings } = await supabase.rpc('get_dealer_listings', {
    p_dealer_id: profile.id,
    p_status: 'active'
  })

  // Get dealer staff
  const { data: staff } = await supabase.rpc('get_dealer_staff', {
    p_dealer_id: profile.id
  })

  // Get recent leads
  const { data: leads } = await supabase
    .from('messages')
    .select('*, vehicle:vehicles(make, model, year), sender:profiles!messages_user_id_fkey(name)')
    .eq('seller_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = dealerData?.stats || { total_listings: 0, total_sold: 0, staff_count: 0 }

  // Calculate analytics from listings
  const totalViews = listings?.reduce((sum: number, v: any) => sum + (v.view_count || 0), 0) || 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
            Dealer Command Center
          </h1>
          <p className="text-white/60">Manage your inventory, team, and leads</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-platinum/10 to-platinum/5 border border-platinum/20">
            <div className="flex items-center justify-between mb-4">
              <Car className="text-platinum" size={24} />
              <TrendingUp className="text-green-400" size={16} />
            </div>
            <div className="text-3xl font-black text-white mb-1">{stats.total_listings}</div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">Active Listings</div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="text-green-400" size={24} />
              <TrendingUp className="text-green-400" size={16} />
            </div>
            <div className="text-3xl font-black text-white mb-1">{stats.total_sold}</div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">Total Sold</div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <Eye className="text-blue-400" size={24} />
            </div>
            <div className="text-3xl font-black text-white mb-1">{totalViews.toLocaleString()}</div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">Total Views</div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-purple-400" size={24} />
            </div>
            <div className="text-3xl font-black text-white mb-1">{stats.staff_count}</div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">Team Members</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Listings */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase tracking-widest text-white">
                  Active Inventory
                </h2>
                <Button asChild variant="outline" className="border-platinum/20 text-platinum hover:bg-platinum/10">
                  <Link href="/listings/new">Add Listing</Link>
                </Button>
              </div>

              {listings && listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listings.slice(0, 4).map((vehicle: any) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                  <Car className="w-12 h-12 mx-auto mb-4 text-white/20" />
                  <p className="text-white/40 text-sm">No active listings</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href="/listings/new">Create Your First Listing</Link>
                  </Button>
                </div>
              )}

              {listings && listings.length > 4 && (
                <Button asChild variant="ghost" className="w-full mt-4 text-platinum">
                  <Link href={`/dealer/${profile.id}`}>View All {listings.length} Listings</Link>
                </Button>
              )}
            </div>

            {/* Recent Leads */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <MessageSquare size={20} />
                  Recent Leads
                </h2>
                <Button asChild variant="ghost" className="text-platinum text-xs">
                  <Link href="/admin">View All</Link>
                </Button>
              </div>

              {leads && leads.length > 0 ? (
                <div className="space-y-3">
                  {leads.map((lead: any) => (
                    <div key={lead.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-bold text-white">{lead.sender?.name || 'Anonymous'}</div>
                          <div className="text-xs text-white/40">
                            {lead.vehicle?.year} {lead.vehicle?.make} {lead.vehicle?.model}
                          </div>
                        </div>
                        <div className="text-xs text-white/40">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-sm text-white/70 line-clamp-2">{lead.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/40 text-sm">
                  No leads yet
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/listings/new">
                    <Car size={16} />
                    Add New Listing
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/dealer/staff">
                    <Users size={16} />
                    Manage Team
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href="/admin">
                    <MessageSquare size={16} />
                    View All Leads
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href={`/dealer/${profile.id}`}>
                    <Eye size={16} />
                    View Public Profile
                  </Link>
                </Button>
              </div>
            </div>

            {/* Team Overview */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-white">
                  Team
                </h3>
                <Button asChild variant="ghost" size="sm" className="text-platinum text-xs">
                  <Link href="/dealer/staff">Manage</Link>
                </Button>
              </div>

              {staff && staff.length > 0 ? (
                <div className="space-y-2">
                  {staff.slice(0, 5).map((member: any) => (
                    <div key={member.staff.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                      <div className="w-8 h-8 rounded-full bg-platinum/10 flex items-center justify-center text-xs font-bold text-platinum">
                        {member.profile.name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{member.profile.name}</div>
                        <div className="text-xs text-white/40 capitalize">{member.staff.role.replace('_', ' ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-white/40 text-sm">
                  No team members yet
                </div>
              )}
            </div>

            {/* Performance Tip */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-platinum/10 to-platinum/5 border border-platinum/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="text-platinum mt-1" size={20} />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">
                    Pro Tip
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Listings with professional photos get 3x more views. Consider adding inspection reports to build buyer trust.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
