"use client"

import { useEffect, useState } from "react"
import { VehicleCard } from "@/components/vehicle-card"
import { searchVehicles, type Vehicle } from "@/lib/supabase/rpc"
import { createClient } from "@/lib/supabase/client"
import { getPersonalizationStats } from "@/lib/utils/view-history"
import { Sparkles } from "lucide-react"

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
    <section className="py-20 bg-platinum/5">
      <div className="container">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 rounded-lg bg-platinum/10">
            <Sparkles className="w-6 h-6 text-platinum" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Recommended For You</h2>
            <p className="text-muted-foreground text-sm">Curated selection based on your browsing patterns</p>
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
