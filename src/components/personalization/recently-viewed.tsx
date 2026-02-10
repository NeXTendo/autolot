"use client"

import { useEffect, useState } from "react"
import { VehicleCard } from "@/components/vehicle-card"
import { getHistory, ViewHistoryItem } from "@/lib/utils/view-history"
import { SectionCarousel } from "@/components/section-carousel"

interface RecentlyViewedProps {
  excludeId?: string
  title?: string
}

export function RecentlyViewed({ excludeId, title = "Recently Viewed" }: RecentlyViewedProps) {
  const [history, setHistory] = useState<ViewHistoryItem[]>([])

  useEffect(() => {
    const items = getHistory()
    setHistory(items.filter(item => item.id !== excludeId))
  }, [excludeId])

  if (history.length === 0) return null

  return (
    <SectionCarousel 
      title={title} 
      description="Based on your browsing activity"
    >
      {history.slice(0, 10).map((item) => (
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
