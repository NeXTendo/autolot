import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { searchVehicles } from "@/lib/supabase/rpc"
import { createClient } from "@/lib/supabase/server"
import { VehicleCard } from "@/components/vehicle-card"
import { RecentlyViewed } from "@/components/personalization/recently-viewed"
import { RecommendedListings } from "@/components/personalization/recommended-listings"
import { SectionCarousel } from "@/components/section-carousel"

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch featured vehicles using RPC
  const result = await searchVehicles(supabase, {
    page_limit: 8, // Fetch more for view all case
    page_offset: 0,
  })

  const featured = result.vehicles || []

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2070"
            alt="Hero car"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        
        <div className="container relative text-center animate-fade-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            PLATINUM<span className="font-light text-[hsl(var(--platinum))]">AUTO</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover premium vehicles crafted for excellence
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/listings">
              <Button size="lg" variant="platinum" className="group">
                View Inventory
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/listings/new">
              <Button size="lg" variant="outline">
                List Your Vehicle
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collection Carousel */}
      <SectionCarousel 
        title="Featured Collection" 
        description="Handpicked premium vehicles"
      >
        {featured.map((car) => (
          <VehicleCard key={car.id} vehicle={car} />
        ))}
      </SectionCarousel>

      {/* Personalized Content */}
      <RecommendedListings />
      
      <div className="bg-background">
        <RecentlyViewed title="Resume Your Search" />
      </div>

      {/* Stats Section */}
      <section className="py-20 border-t border-border/40">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-up">
              <div className="text-4xl font-bold text-[hsl(var(--platinum))] mb-2">500+</div>
              <div className="text-muted-foreground">Premium Vehicles</div>
            </div>
            <div className="animate-fade-up animation-delay-100">
              <div className="text-4xl font-bold text-[hsl(var(--platinum))] mb-2">10K+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div className="animate-fade-up animation-delay-200">
              <div className="text-4xl font-bold text-[hsl(var(--platinum))] mb-2">98%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

