"use client"

import { useEffect } from "react"
import { trackView } from "@/lib/utils/view-history"

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
  }
}

export function TrackVehicleView({ vehicle }: TrackVehicleViewProps) {
  useEffect(() => {
    trackView({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      mileage: vehicle.mileage,
      transmission: vehicle.transmission,
      fuel_type: vehicle.fuel_type,
      image: vehicle.images?.[0] || 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=2070'
    })
  }, [vehicle])

  return null
}
