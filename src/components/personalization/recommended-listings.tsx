"use client"

import { useEffect, useState } from "react"
import { VehicleCard } from "@/components/vehicle-card"
import { searchVehicles, type Vehicle } from "@/lib/supabase/rpc"
import { createClient } from "@/lib/supabase/client"
import { getPersonalizationStats } from "@/lib/utils/view-history"

export function RecommendedListings() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRecommended = async () => {
      setLoading(true)
      const stats = getPersonalizationStats()
      
      if (!stats) {
        // Fallback to featured/recent if no history
        const result = await searchVehicles(supabase, {
          page_limit: 4
        })
        setVehicles(result.vehicles || [])
      } else {
        // Fetch items matching favorite make or price range
        const result = await searchVehicles(supabase, {
          search_make: stats.favoriteMake,
          min_price: stats.priceRange.min,
          max_price: stats.priceRange.max,
          page_limit: 4
        })
        
        if (result.vehicles && result.vehicles.length > 0) {
          setVehicles(result.vehicles)
        } else {
          // Fallback if no specific matches
          const fallback = await searchVehicles(supabase, { page_limit: 4 })
          setVehicles(fallback.vehicles || [])
        }
      }
      setLoading(false)
    }
    fetchRecommended()
  }, [supabase])

  if (!loading && vehicles.length === 0) return null

  return (
    <section className="py-24 bg-black">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-fade-up">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-12 bg-platinum/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-platinum/40">Personalized</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter uppercase">
              Curated <span className="text-platinum">Selection</span>
            </h2>
            <p className="text-platinum/40 max-w-xl font-medium leading-relaxed">
              Based on your browsing patterns and preferences. Hand-picked for your collection.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="h-[400px] rounded-2xl bg-muted animate-pulse" />
            ))
          ) : (
            vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}
