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
import { QuickSearchBubbles } from "@/components/home/quick-search-bubbles"
import { MakeCarousel } from "@/components/home/make-carousel"
import { NewsSection } from "@/components/home/news-section"

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch featured vehicles using RPC
  const result = await searchVehicles(supabase, {
    is_premium: true,
    page_limit: 8,
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
        
        <div className="container relative z-10 px-6 text-center space-y-8 animate-fade-up">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-platinum/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-platinum/60">The World&apos;s Automotive Hub</span>
            <div className="h-px w-12 bg-platinum/20" />
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] md:leading-[0.8] mb-8">
            Global <br />
            <span className="text-platinum">Marketplace</span>
          </h1>

          <p className="text-lg md:text-2xl text-platinum/60 max-w-3xl mx-auto font-medium leading-relaxed px-4">
            Connect with verified sellers and buyers from across the globe. <br className="hidden md:block" />
            The most prestigious marketplace for automotive excellence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button asChild size="lg" variant="platinum" className="h-14 sm:h-16 px-8 sm:px-12 rounded-none font-black uppercase tracking-widest text-base sm:text-lg group w-full sm:w-auto">
              <Link href="/listings" className="flex items-center justify-center">
                Explore Inventory
                <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform duration-500" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 sm:h-16 px-8 sm:px-12 rounded-none border-white/20 hover:bg-white hover:text-black transition-all duration-500 font-black uppercase tracking-widest text-base sm:text-lg w-full sm:w-auto">
              <Link href="/listings/new">List Your Vehicle</Link>
            </Button>
          </div>

          <QuickSearchBubbles />
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

      <MakeCarousel />

      {/* Personalized Content */}
      <RecommendedListings />
      
      <div className="bg-background">
        <RecentlyViewed title="Resume Your Search" />
      </div>

      <NewsSection />
    </div>
  )
}

