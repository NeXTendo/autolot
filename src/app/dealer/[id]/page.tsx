import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { VehicleCard } from '@/components/vehicle-card'
import { Building2, Calendar, Car, MapPin, Phone, Mail, Globe } from 'lucide-react'
import { TrackProfileView } from '@/components/seller/track-profile-view'
import { DealerBadge } from '@/components/dealer/dealer-badge'
import type { DealerProfile } from '@/lib/types/roles'

interface DealerStats {
  total_listings: number
  total_sold: number
  staff_count: number
}

export default async function DealerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch dealer profile with stats
  const { data: dealerData } = await supabase.rpc('get_dealer_profile', {
    p_dealer_id: id
  })

  if (!dealerData) {
    notFound()
  }

  const profile = dealerData.profile as DealerProfile
  const stats = dealerData.stats as DealerStats

  // Fetch dealer's vehicles
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .eq('seller_id', id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <TrackProfileView sellerId={id} />
      
      {/* Hero Section with Dealer Branding */}
      <div className="relative bg-gradient-to-b from-platinum/5 to-transparent border-b border-white/5">
        <div className="container py-16 md:py-24">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo */}
            <div className="w-32 h-32 rounded-2xl bg-white/5 border-2 border-platinum/20 flex items-center justify-center overflow-hidden">
              {profile.business_logo ? (
                <img src={profile.business_logo} alt={profile.business_name} className="w-full h-full object-cover" />
              ) : (
                <Building2 size={48} className="text-platinum/40" />
              )}
            </div>
            
            {/* Business Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2">
                    {profile.business_name}
                  </h1>
                  <DealerBadge isVerified={profile.is_verified} size="lg" />
                </div>
              </div>
              
              {profile.business_description && (
                <p className="text-lg text-white/70 leading-relaxed mb-6 max-w-3xl">
                  {profile.business_description}
                </p>
              )}
              
              {/* Contact Info */}
              <div className="flex flex-wrap gap-6 text-sm">
                {profile.business_address && (
                  <div className="flex items-center gap-2 text-white/60">
                    <MapPin size={16} className="text-platinum" />
                    <span>{profile.business_address}</span>
                  </div>
                )}
                {profile.business_phone && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Phone size={16} className="text-platinum" />
                    <a href={`tel:${profile.business_phone}`} className="hover:text-platinum transition-colors">
                      {profile.business_phone}
                    </a>
                  </div>
                )}
                {profile.business_email && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Mail size={16} className="text-platinum" />
                    <a href={`mailto:${profile.business_email}`} className="hover:text-platinum transition-colors">
                      {profile.business_email}
                    </a>
                  </div>
                )}
                {profile.website_url && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Globe size={16} className="text-platinum" />
                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-platinum transition-colors">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-4xl font-black text-white mb-2">{stats.total_listings}</div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">Active Listings</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-4xl font-black text-white mb-2">{stats.total_sold}</div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">Vehicles Sold</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-4xl font-black text-white mb-2">{stats.staff_count}</div>
            <div className="text-xs font-black uppercase tracking-widest text-white/40">Team Members</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <Calendar size={20} className="text-platinum" />
            <div>
              <div className="text-sm font-bold text-white">Since {joinedDate}</div>
              <div className="text-xs font-black uppercase tracking-widest text-white/40">Member</div>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
              <span className="w-8 h-px bg-platinum/30"></span>
              Current Inventory
            </h2>
            <span className="text-xs text-white/40 uppercase tracking-widest font-black">
              {vehicles?.length || 0} Vehicles
            </span>
          </div>

          {vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles.map((car) => (
                <VehicleCard key={car.id} vehicle={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border-2 border-dashed border-white/10 rounded-3xl">
              <Car className="w-12 h-12 mx-auto mb-4 text-white/20" />
              <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">No Active Listings</h3>
              <p className="text-white/40 text-sm">This dealer is currently updating their inventory.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
