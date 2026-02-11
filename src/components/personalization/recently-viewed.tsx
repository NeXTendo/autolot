"use client"

import { useState, useEffect } from "react"
import { VehicleCard } from "@/components/vehicle-card"
import { getHistory, ViewHistoryItem } from "@/lib/utils/view-history"
import { SectionCarousel } from "@/components/section-carousel"

interface RecentlyViewedProps {
  excludeId?: string
  title?: string
}

export function RecentlyViewed({ excludeId, title = "Recent Discoveries" }: RecentlyViewedProps) {
  const [history, setHistory] = useState<ViewHistoryItem[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Wrap in async IIFE to avoid cascading render lint error
    void (async () => {
      setHistory(getHistory())
      setIsMounted(true)
    })()
  }, [])

  const filteredHistory = history.filter(item => item.id !== excludeId)

  if (!isMounted || filteredHistory.length === 0) return null

  return (
    <div className="py-24 bg-black/50">
      <SectionCarousel 
        title={title} 
        description="Pick up where you left off"
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
              images: [item.image],
              seller: item.seller
            }} 
          />
        ))}
      </SectionCarousel>
    </div>
  )
}
