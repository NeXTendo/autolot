"use client"

import { useState } from "react"
import { VehicleCard } from "@/components/vehicle-card"
import { getHistory, ViewHistoryItem } from "@/lib/utils/view-history"
import { SectionCarousel } from "@/components/section-carousel"

interface RecentlyViewedProps {
  excludeId?: string
  title?: string
}

export function RecentlyViewed({ excludeId, title = "Recently Viewed" }: RecentlyViewedProps) {
  const [history] = useState<ViewHistoryItem[]>(() => getHistory())

  const filteredHistory = history.filter(item => item.id !== excludeId)

  if (filteredHistory.length === 0) return null

  return (
    <SectionCarousel 
      title={title} 
      description="Based on your browsing activity"
    >
      {filteredHistory.slice(0, 10).map((item) => (
        <VehicleCard 
          key={item.id} 
          vehicle={{
            id: item.id,
            make: item.make,
            model: item.model,
            year: item.year,
            price: item.price,
            mileage: item.mileage,
            transmission: item.transmission,
            fuel_type: item.fuel_type,
            images: [item.image]
          }} 
        />
      ))}
    </SectionCarousel>
  )
}
