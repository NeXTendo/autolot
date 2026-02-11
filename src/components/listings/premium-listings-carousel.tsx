"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Gauge, 
  Fuel, 
  Box,
  BadgeCheck,
  ArrowRight
} from "lucide-react"
import { Vehicle } from "@/lib/supabase/rpc"
import { PriceDisplay } from "@/components/price-display"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PremiumListingsCarouselProps {
  vehicles: Vehicle[]
}

export function PremiumListingsCarousel({ vehicles }: PremiumListingsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const ROTATION_INTERVAL = 10 * 1000 // 10 seconds
  const rotationInterval = ROTATION_INTERVAL

  const nextVehicle = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % vehicles.length)
      setIsAnimating(false)
    }, 500)
  }, [vehicles.length, isAnimating])

  const prevVehicle = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length)
      setIsAnimating(false)
    }, 500)
  }, [vehicles.length, isAnimating])

  useEffect(() => {
    if (vehicles.length <= 1) return

    const timer = setInterval(() => {
      nextVehicle()
    }, rotationInterval)

    return () => clearInterval(timer)
  }, [vehicles.length, nextVehicle, rotationInterval])

  if (vehicles.length === 0) return null

  const activeVehicle = vehicles[currentIndex]
  const images = activeVehicle.images || []
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=2070'

  return (
    <div className="mb-16 md:mb-24 animate-fade-up">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-amber-500/10 p-2 md:p-2.5 rounded-none border border-amber-500/20">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-widest text-white leading-none mb-1">
              Featured <span className="text-platinum/50">Assets</span>
            </h2>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-platinum/20">Elite inventory selection</p>
          </div>
        </div>

        {vehicles.length > 1 && (
          <div className="flex items-center gap-1.5 md:gap-2">
             <Button 
                variant="outline" 
                size="icon" 
                onClick={prevVehicle}
                className="h-8 w-8 md:h-10 md:w-10 border-white/5 bg-white/5 hover:bg-white/10 text-white rounded-none transition-all"
             >
                <ChevronLeft className="w-4 h-4 md:w-[18px] md:h-[18px]" />
             </Button>
             <div className="px-2 md:px-4 text-[9px] md:text-[10px] font-black font-mono text-platinum/40 tracking-widest">
                {String(currentIndex + 1).padStart(2, '0')} / {String(vehicles.length).padStart(2, '0')}
             </div>
             <Button 
                variant="outline" 
                size="icon" 
                onClick={nextVehicle}
                className="h-8 w-8 md:h-10 md:w-10 border-white/5 bg-white/5 hover:bg-white/10 text-white rounded-none transition-all"
             >
                <ChevronRight className="w-4 h-4 md:w-[18px] md:h-[18px]" />
             </Button>
          </div>
        )}
      </div>

      {/* Main Featured Card */}
      <div className={cn(
        "relative group min-h-[400px] sm:min-h-[450px] md:min-h-[500px] border border-white/5 bg-card/40 backdrop-blur-3xl overflow-hidden transition-all duration-700",
        isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-platinum/5 blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 h-full">
          {/* Image Side - Split at MD */}
          <div className="md:col-span-5 lg:col-span-7 relative min-h-[300px] sm:min-h-[400px] md:min-h-full overflow-hidden">
            <Link href={`/vehicle/${activeVehicle.id}`} className="block h-full w-full relative">
              <Image 
                src={mainImage}
                alt={`${activeVehicle.make} ${activeVehicle.model}`}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t md:bg-linear-to-r from-black/80 via-transparent to-transparent md:via-transparent md:to-black/20" />
              
              {/* Premium Badge Overlay */}
              <div className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1.5 sm:px-4 sm:py-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white">Consigned Premium</span>
              </div>
            </Link>
          </div>

          {/* Content Side - Split at MD */}
          <div className="md:col-span-7 lg:col-span-5 p-6 sm:p-8 lg:p-12 flex flex-col justify-between relative z-10 bg-black/40 md:bg-transparent">
            <div>
              <div className="flex flex-col gap-1 sm:gap-2 mb-6 sm:mb-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <span className="text-platinum/40 font-black tracking-tighter text-2xl sm:text-3xl lg:text-4xl leading-none italic">{activeVehicle.year}</span>
                  <div className="h-3 sm:h-4 w-px bg-white/10" />
                  <span className="text-platinum font-black tracking-tighter text-2xl sm:text-3xl lg:text-4xl leading-none truncate uppercase">{activeVehicle.make}</span>
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-platinum/60 tracking-tight leading-none uppercase truncate">{activeVehicle.model} {activeVehicle.trim}</h3>
              </div>

              <div className="glass-panel border-white/5 bg-white/5 p-4 sm:p-6 mb-6 sm:mb-8 hover:border-white/10 transition-colors">
                <div className="flex items-baseline gap-2 mb-4">
                  <PriceDisplay price={Number(activeVehicle.price)} className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter" />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-widest text-platinum/40">
                    <Gauge className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    {activeVehicle.mileage.toLocaleString()} KM
                  </div>
                  <div className="flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-widest text-platinum/40">
                    <Box className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    {activeVehicle.transmission}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-widest text-platinum/40">
                    <Fuel className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    {activeVehicle.fuel_type}
                  </div>
                </div>
              </div>

              {activeVehicle.description && (
                <p className="text-[10px] sm:text-xs text-platinum/40 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-6 sm:mb-8 italic">
                  &ldquo;{activeVehicle.description}&rdquo;
                </p>
              )}

              {activeVehicle.features && activeVehicle.features.length > 0 && (
                <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-10 hidden sm:block">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-platinum/20">Featured Modifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeVehicle.features.slice(0, 4).map((feature, i) => (
                      <span key={i} className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/5 border border-white/5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-platinum/60">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-white/5">
              <div className="flex items-center gap-3 flex-1 overflow-hidden w-full">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-platinum/5 border border-white/5 flex items-center justify-center text-platinum/40 shrink-0">
                  <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-platinum/20 mb-0.5 sm:mb-1">Seller Identity</div>
                  <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-platinum truncate">
                    {activeVehicle.seller?.name || "Global Participant"}
                  </div>
                </div>
              </div>
              
              <Button asChild className="w-full sm:w-auto px-6 py-5 sm:px-8 sm:py-6 bg-black text-white hover:bg-white hover:text-black rounded-none font-black uppercase tracking-widest text-[10px] sm:text-xs italic shrink-0 border-2 border-platinum/50 hover:border-white shadow-lg hover:shadow-xl transition-all">
                <Link href={`/vehicle/${activeVehicle.id}`}>
                  View Artifact <ArrowRight size={14} className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Timer Progress Bar */}
        <div className="absolute bottom-0 left-0 h-0.5 md:h-1 bg-platinum/10 w-full overflow-hidden">
          <div 
            className="h-full bg-platinum transition-all duration-1000 linear"
            style={{ 
              ['--progress-width' as string]: `${(currentIndex + 1) / vehicles.length * 100}%`,
              ['--progress-opacity' as string]: isAnimating ? '0' : '0.5',
              width: 'var(--progress-width)',
              opacity: 'var(--progress-opacity)'
            }}
          />
        </div>
      </div>
    </div>
  )
}
