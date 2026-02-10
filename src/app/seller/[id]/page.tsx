import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { VehicleCard } from '@/components/vehicle-card'
import { User, ShieldCheck, Calendar, Car } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

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

  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="container py-12 md:py-24 min-h-screen">
      {/* Profile Header */}
      <div className="mb-12 animate-fade-up">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center p-8 rounded-3xl bg-platinum/5 border border-platinum/10 backdrop-blur-sm">
          <div className="w-24 h-24 rounded-full bg-platinum/10 border-2 border-platinum/20 flex items-center justify-center font-bold text-platinum text-3xl">
            {profile.name?.[0] || <User size={40} />}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                @{profile.name?.toLowerCase().replace(/\s+/g, '_') || 'dealer'}
              </h1>
              {profile.is_verified && (
                <ShieldCheck className="text-platinum w-6 h-6" />
              )}
            </div>
            
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
          <h2 className="text-2xl font-bold uppercase tracking-widest text-sm flex items-center gap-3">
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
