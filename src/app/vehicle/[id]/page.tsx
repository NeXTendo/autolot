import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImageGallery } from '@/components/image-gallery'
import { VehiclePrice } from '@/components/vehicle-price'
import { Calendar, Gauge, Fuel, Settings } from 'lucide-react'
import { TrackVehicleView } from '@/components/vehicle/track-vehicle-view'
import { SellerContact } from '@/components/vehicle/seller-contact'
import { SimilarListings } from '@/components/vehicle/similar-listings'
import { RecentlyViewed } from '@/components/personalization/recently-viewed'
import { VehicleFeatures } from '@/components/vehicle/vehicle-features'

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  // Get current user for ownership check
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*, profiles(id, name, phone, email)')
    .eq('id', id)
    .single()

  if (!vehicle) {
    notFound()
  }

  const images = vehicle.images || []
  const isOwner = user?.id === vehicle.seller_id

  return (
    <div className="min-h-screen pb-20">
      <TrackVehicleView vehicle={vehicle} />
      
      <div className="container py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Enhanced Image Gallery */}
            <div className="animate-fade-up">
              <ImageGallery 
                images={images}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              />
            </div>

            {/* Title & Price (Mobile Only) */}
            <div className="lg:hidden mb-8">
              <span className="text-[hsl(var(--platinum))] font-bold text-sm uppercase tracking-[0.2em]">
                {vehicle.year} {vehicle.make}
              </span>
              <h1 className="text-3xl font-bold mt-2">
                {vehicle.model} {vehicle.trim}
              </h1>
              <VehiclePrice price={Number(vehicle.price)} className="text-2xl font-bold mt-2" />
            </div>

            {/* Description */}
            <Card className="animate-fade-up">
              <CardContent className="p-8">
                <h4 className="font-bold mb-6 uppercase text-sm tracking-wider flex items-center gap-2">
                  <span className="w-8 h-px bg-platinum/30"></span>
                  Vehicle Narrative
                </h4>
                <p className="text-muted-foreground leading-loose text-lg whitespace-pre-line">
                  {vehicle.description || "The owner hasn't provided a description for this vehicle yet. Please contact the concierge for full details and history."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-12">
            <div className="animate-fade-up">
              <div className="hidden lg:block mb-8">
                <span className="text-[hsl(var(--platinum))] font-bold text-sm uppercase tracking-[0.2em]">
                  {vehicle.year} {vehicle.make}
                </span>
                <h1 className="text-4xl font-bold mt-2 leading-tight">
                  {vehicle.model} {vehicle.trim}
                </h1>
                <VehiclePrice price={Number(vehicle.price)} className="text-3xl font-bold mt-4" />
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-1 gap-4 mb-12">
                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-platinum-dim" />
                    <span className="text-xs text-muted-foreground uppercase">Mileage</span>
                  </div>
                  <span className="font-bold text-sm">{Number(vehicle.mileage).toLocaleString()} km</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40">
                  <div className="flex items-center gap-3">
                    <Gauge className="w-5 h-5 text-platinum-dim" />
                    <span className="text-xs text-muted-foreground uppercase">Condition</span>
                  </div>
                  <span className="font-bold text-sm">{vehicle.condition}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-platinum-dim" />
                    <span className="text-xs text-muted-foreground uppercase">Transmission</span>
                  </div>
                  <span className="font-bold text-sm">{vehicle.transmission}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/40">
                  <div className="flex items-center gap-3">
                    <Fuel className="w-5 h-5 text-platinum-dim" />
                    <span className="text-xs text-muted-foreground uppercase">Fuel Type</span>
                  </div>
                  <span className="font-bold text-sm">{vehicle.fuel_type}</span>
                </div>
              </div>

              {/* Features (BeForward Grid) */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div className="animate-fade-up">
                  <VehicleFeatures features={vehicle.features} />
                </div>
              )}

              {/* Refined Seller Contact */}
              <div className="pt-4">
                <SellerContact seller={vehicle.profiles} vehicle={vehicle} isOwner={isOwner} />
              </div>
            </div>

            {/* Quick Actions (Buyer vs Seller) */}
            <div className="p-6 rounded-2xl bg-platinum/5 border border-platinum/10 space-y-4 animate-fade-up">
              {isOwner ? (
                <>
                  <h4 className="font-bold text-center text-sm uppercase tracking-widest">Listing Management</h4>
                  <Button variant="platinum" className="w-full h-12 text-lg" asChild>
                    <Link href={`/listings/edit/${vehicle.id}`}>Edit Listing</Link>
                  </Button>
                  <Button variant="outline" className="w-full h-12 border-destructive/20 hover:bg-destructive/10 text-destructive">
                    Mark as Sold
                  </Button>
                </>
              ) : (
                <>
                  <h4 className="font-bold text-center text-sm uppercase tracking-widest">Concierge Services</h4>
                  <Button variant="platinum" className="w-full h-12 text-lg">
                    Acquire Vehicle
                  </Button>
                  <Button variant="outline" className="w-full h-12">
                    Request Private View
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="animate-fade-up mt-16 space-y-16">
        <SimilarListings vehicle={vehicle} />
        <RecentlyViewed excludeId={vehicle.id} />
      </div>
    </div>
  )
}

