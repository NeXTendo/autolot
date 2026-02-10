"use client"

import { useEffect, useState } from "react"
import { VehicleCard } from "@/components/vehicle-card"
import { searchVehicles } from "@/lib/supabase/rpc"
import { createClient } from "@/lib/supabase/client"

interface SimilarListingsProps {
  vehicle: {
    id: string
    make: string
    price: number
  }
}

export function SimilarListings({ vehicle }: SimilarListingsProps) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchSimilar = async () => {
      const result = await searchVehicles(supabase, {
        search_make: vehicle.make,
        min_price: Number(vehicle.price) * 0.7,
        max_price: Number(vehicle.price) * 1.3,
        page_limit: 4
      })
      // Filter out current vehicle
      const filtered = (result.vehicles || []).filter((v: { id: string }) => v.id !== vehicle.id)
      setVehicles(filtered)
    }
    fetchSimilar()
  }, [vehicle.id, vehicle.make, vehicle.price, supabase])

  if (vehicles.length === 0) return null

  return (
    <section className="py-12 border-t border-border/40">
      <div className="container">
        <h2 className="text-2xl font-bold mb-8">Similar Listings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </div>
    </section>
  )
}
