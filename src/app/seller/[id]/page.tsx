import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { VehicleCard } from '@/components/vehicle-card'
import { User, ShieldCheck, Calendar, Car, Building2 } from 'lucide-react'
import { TrackProfileView } from '@/components/seller/track-profile-view'
import Image from 'next/image'

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch seller profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) {
    notFound()
  }

  // Fetch seller's vehicles
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .eq('seller_id', id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // If dealer, fetch business profile
  let dealerProfile = null
  if (profile.role === 'dealer') {
    const { data } = await supabase
      .from('dealer_profiles')
      .select('*')
      .eq('id', id)
      .single()
    dealerProfile = data
  }

  const displayName = dealerProfile?.business_name || profile.name
  const displayLogo = dealerProfile?.business_logo
  const isVerified = dealerProfile ? dealerProfile.is_verified : profile.is_verified

  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="container py-12 md:py-24 min-h-screen">
      <TrackProfileView sellerId={id} />
      {/* Profile Header */}
      <div className="mb-12 animate-fade-up">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center p-8 rounded-3xl bg-platinum/5 border border-platinum/10 backdrop-blur-sm relative overflow-hidden">
          {dealerProfile && (
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Building2 size={120} />
            </div>
          )}
          
          <div className="w-24 h-24 rounded-full bg-platinum/10 border-2 border-platinum/20 flex items-center justify-center font-bold text-platinum text-3xl overflow-hidden relative">
            {displayLogo ? (
              <Image 
                src={displayLogo} 
                alt={displayName} 
                fill 
                className="object-contain p-2"
                unoptimized
              />
            ) : (
              profile.name?.[0] || <User size={40} />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {dealerProfile ? displayName : `@${displayName?.toLowerCase().replace(/\s+/g, '_')}`}
              </h1>
              {isVerified && (
                <ShieldCheck className="text-platinum w-6 h-6" />
              )}
            </div>

            {dealerProfile?.business_description && (
              <p className="text-sm text-platinum/60 mb-4 max-w-2xl leading-relaxed">
                {dealerProfile.business_description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <Car className="w-4 h-4 text-platinum-dim" />
                {vehicles?.length || 0} Active Listings
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-platinum-dim" />
                Member since {joinedDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="space-y-8 animate-fade-up dela-150">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold uppercase tracking-widest flex items-center gap-3">
            <span className="w-8 h-px bg-platinum/30"></span>
            Current Inventory
          </h2>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">
            {vehicles?.length || 0} Results
          </span>
        </div>

        {vehicles && vehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((car) => (
              <VehicleCard key={car.id} vehicle={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-platinum/10 rounded-3xl">
            <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-xl font-bold mb-2">No active listings</h3>
            <p className="text-muted-foreground">This collector is currently building their inventory.</p>
          </div>
        )}
      </div>
    </div>
  )
}
