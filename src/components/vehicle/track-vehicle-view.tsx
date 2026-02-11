"use client"

import { useEffect } from "react"
import { trackView } from "@/lib/utils/view-history"
import { recordVehicleView } from "@/lib/supabase/rpc"
import { createClient } from "@/lib/supabase/client"

interface TrackVehicleViewProps {
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    price: number
    mileage: number
    transmission?: string
    fuel_type?: string
    images?: string[]
    seller?: {
      name: string
      verified?: boolean
    }
  }
}

export function TrackVehicleView({ vehicle }: TrackVehicleViewProps) {
  const supabase = createClient()

  useEffect(() => {
    // Record DB view
    recordVehicleView(supabase, vehicle.id)

    trackView({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      mileage: vehicle.mileage,
      transmission: vehicle.transmission,
      fuel_type: vehicle.fuel_type,
      image: vehicle.images?.[0] || 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=2070',
      seller: vehicle.seller
    })
  }, [vehicle])

  return null
}
