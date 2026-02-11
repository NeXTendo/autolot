"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Fuel, Box, Gauge, ChevronLeft, ChevronRight } from "lucide-react"
import { PriceDisplay } from "@/components/price-display"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VehicleCardProps {
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    price: number
    mileage: number
    trim?: string
    fuel_type?: string
    transmission?: string
    drivetrain?: string
    images?: string[]
    is_premium?: boolean
    seller?: {
      name: string
      verified?: boolean
      is_verified?: boolean
    }
  }
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = vehicle.images && vehicle.images.length > 0 
    ? vehicle.images 
    : ['https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=2070']

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Card className={cn(
      "group overflow-hidden hover:border-primary/50 transition-all duration-500 flex flex-col h-full bg-card/50 backdrop-blur-sm relative rounded-none",
      vehicle.is_premium && "ring-1 ring-platinum/20 shadow-[0_0_30px_rgba(229,228,226,0.05)] border-platinum/30"
    )}>
      {vehicle.is_premium && (
        <div className="absolute top-0 left-0 w-16 h-16 z-20 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-[141%] h-3 bg-platinum/90 text-black text-[7px] font-black uppercase tracking-[0.2em] flex items-center justify-center -rotate-45 -translate-x-[30%] translate-y-[40%] shadow-lg">
            Premium
          </div>
        </div>
      )}
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/vehicle/${vehicle.id}`} className="block h-full w-full">
          <Image 
            src={images[currentImageIndex]} 
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </Link>
        
        {/* Navigation Arrows (Only if multiple images) */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-none bg-background/20 hover:bg-background/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-none bg-background/20 hover:bg-background/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Pagination Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1 rounded-none bg-black/20 backdrop-blur-sm">
              {images.map((_: string, idx: number) => (
                <div 
                  key={idx}
                  className={cn(
                    "w-1.5 h-1.5 rounded-none transition-all duration-300",
                    idx === currentImageIndex ? "bg-white w-3" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Price Tag */}
        <div className="absolute top-4 right-4 z-10">
          <div className={cn(
            "px-2 py-1 rounded-none backdrop-blur-md border shadow-xl transition-all duration-500",
            vehicle.is_premium 
              ? "bg-black/90 text-white border-platinum/50" 
              : "bg-background/80 text-white border-white/10"
          )}>
            <PriceDisplay price={Number(vehicle.price)} className={cn("text-[10px] font-black tracking-tight", vehicle.is_premium && "text-platinum")} />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-5 flex flex-col flex-grow">
        <Link href={`/vehicle/${vehicle.id}`} className="hover:underline decoration-primary/30 underline-offset-4 flex-grow">
          <h5 className="text-lg font-bold leading-tight mb-1">
            {vehicle.make} <span className="font-light text-muted-foreground">{vehicle.model}</span>
          </h5>
          <div className="flex items-center gap-2 mb-3">
             <span className="text-[10px] font-black uppercase tracking-widest text-platinum/40">
               {vehicle.seller?.name || "Global Seller"}
             </span>
             {vehicle.seller?.is_verified && (
               <div className="flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded-none border border-blue-500/20">
                 <div className="w-1 h-1 rounded-none bg-blue-400" />
                 <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">Verified</span>
               </div>
             )}
          </div>
        </Link>

        {/* Core Specs Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-auto">
          {/* ... existing specs ... */}
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-platinum-dim" /> {vehicle.year}
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium whitespace-nowrap">
            <Gauge className="w-3.5 h-3.5 text-platinum-dim" /> {Number(vehicle.mileage).toLocaleString()} km
          </div>
          
          {vehicle.transmission && (
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium whitespace-nowrap">
              <Box className="w-3.5 h-3.5 text-platinum-dim" /> {vehicle.transmission}
            </div>
          )}
          
          {vehicle.fuel_type && (
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium whitespace-nowrap">
              <Fuel className="w-3.5 h-3.5 text-platinum-dim" /> {vehicle.fuel_type}
            </div>
          )}
        </div>
        
        {vehicle.is_premium && (
          <div className="mt-4 pt-4 border-t border-platinum/10 flex items-center justify-between">
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-platinum/40">Exclusive Listing</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-platinum rounded-none animate-pulse" />
              <div className="w-1 h-1 bg-platinum rounded-none animate-pulse delay-75" />
              <div className="w-1 h-1 bg-platinum rounded-none animate-pulse delay-150" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
